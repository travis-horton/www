# syntax=docker/dockerfile:1
# Both base images are named by version, never `latest` (26.1002). With `latest`
# the same Dockerfile built a different site whenever Docker Hub moved the tag,
# and nothing in this repo's history said when. These two are exactly what
# `latest` pointed at on the day they were pinned, so a new version is now a
# change to one of these lines that can be read, tested and reverted.
# ⚠️ node's major must equal `node-version` in .github/workflows/checks.yml:
# move both together (scripts/repo-pins.test.js fails if they drift).
FROM node:26-trixie AS build
WORKDIR /app

ARG GIT_HASH=unknown
ENV GIT_HASH=$GIT_HASH
# The footer: v<APP_VERSION>+<BUILD_DATE>, e.g. v3.28.0+26.0918.1600 (semver with
# build metadata). APP_VERSION = the release this sandbox build will become
# (predicted from HISTORY.md); BUILD_DATE = Boise time, YY.MMDD.HHMM. Empty values
# fall back to package.json / "local".
ARG APP_VERSION=
ENV APP_VERSION=$APP_VERSION
ARG BUILD_DATE=
ENV BUILD_DATE=$BUILD_DATE

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm ci
COPY ./src /app/src
RUN npm run build

FROM nginx:1.31
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ THE IMAGE MUST OWN THIS DIRECTORY, NOT THE RUN COMMAND. nginx.conf declares
# `access_log /var/log/gcal-hook/…` for the push receiver, and nginx OPENS every
# access_log at startup: if the directory is missing it does not warn and carry
# on, it exits with [emerg] and the container dies.
#
# That is what took www.travish.com down on 26.0907. Both prod containers run
# THIS image, but only `web` got `-v /var/log/gcal-hook:…` (the bind mount that
# makes the doorbell's log outlive a deploy). `www_web` has no mount, so the
# directory did not exist inside it, nginx refused to start, nginx-proxy lost its
# upstream, and every request to www.travish.com got nginx-proxy's default 503 —
# while the bare domain, whose container had the mount, stayed a healthy 200.
#
# Creating it here makes the image self-sufficient: any container from it can
# start with no mount at all. The `-v` on `web` stays, because it does a
# different job — PERSISTENCE across `--rm` deploys, not existence.
RUN mkdir -p /var/log/gcal-hook

# 🔑 The mount point for the gcal capability map (ticket 63ba96c0, 26.0911).
# Deliberately EMPTY in the image: this image is public on Docker Hub, so the
# secret must never be baked in. `web` bind-mounts the droplet's
# /etc/gcal-hook here at run time; any container without that mount serves
# 404 on both capability routes (nginx.conf explains the fail-closed glob).
RUN mkdir -p /etc/nginx/gcal

COPY --from=build /app/dist /var/www/html
