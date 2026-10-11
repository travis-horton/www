# syntax=docker/dockerfile:1
# Both base images are named by version, never `latest` (26.1002). With `latest`
# the same Dockerfile built a different site whenever Docker Hub moved the tag,
# and nothing in this repo's history said when. ⚠️ Corrected 26.1009: these name
# a RELEASE LINE, not one build, and they MOVE. `nginx:1.31` is re-pointed by
# every 1.31.x patch (one CI run had nginx 1.31.6 here while the proxy ran
# 1.31.3); `node:26-trixie` by every Node 26 minor AND patch release. So the
# same commit, rebuilt a week later, can be a different build, and only a jump
# to nginx 1.32 or Node 27 is a change to one of these lines.
# That is ON PURPOSE (Travis, ruling M-169, 26.1009): a personal site wants each
# security patch the next time it builds, without a pull request per patch. The
# price: a rollback re-runs the old image (deploy-to-prod.yml pulls it by tag),
# but rebuilding an old commit does not reproduce it. To freeze one exact build
# instead, pin the full version (`nginx:1.31.6`) or add a `@sha256:` digest.
# A channel name (`stable`, `mainline`, `lts`) is refused by
# scripts/repo-pins.test.js.
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
# Parcel's pipeline without Babel (Babel 8 is jest's alone; .parcelrc says why).
# Without this file the build falls back to Parcel's default and fails.
COPY ./.parcelrc /app/.parcelrc

RUN npm ci
COPY ./src /app/src
# sitemap.xml, written from src/data/public-pages.json (26.1010). Before the
# site build, so a list that names a private or impossible address fails the
# build fast. Written OUTSIDE dist on purpose: scripts/check-bundle.mjs fails
# any built file but index.html that has no hash in its name.
COPY ./scripts/gen-sitemap.mjs /app/scripts/gen-sitemap.mjs
RUN node scripts/gen-sitemap.mjs /app/sitemap.xml
RUN npm run build

FROM nginx:1.31
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
# The three security headers, included by each location of nginx.conf.
# ⚠️ NOT under conf.d: nginx loads every file there by itself, above the server,
# and each location that has an add_header of its own would silently drop them.
COPY ./nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf

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

# 📒 Same rule, same reason, for the visit log (26.1006): nginx.conf's
# `access_log /var/log/www/visits.log` would otherwise kill any container started
# without the mount. Both containers get `-v /var/log/www` from the deploy
# workflows; the image must still boot without it.
RUN mkdir -p /var/log/www

# 🔑 The mount point for the gcal capability map (ticket 63ba96c0, 26.0911).
# Deliberately EMPTY in the image: this image is public on Docker Hub, so the
# secret must never be baked in. `web` bind-mounts the droplet's
# /etc/gcal-hook here at run time; any container without that mount serves
# 404 on both capability routes (nginx.conf explains the fail-closed glob).
RUN mkdir -p /etc/nginx/gcal

COPY --from=build /app/dist /var/www/html
# For search engines (26.1009). Plain files with fixed names, so they sit beside
# the build rather than in it: scripts/check-bundle.mjs requires every BUILT
# file but index.html to carry a hash in its name. Served by nginx.conf's pages
# location (④), which answers an existing file as itself, with `no-cache`.
# sitemap.xml is generated in the build stage (26.1010) from
# src/data/public-pages.json by scripts/gen-sitemap.mjs, and guarded by
# scripts/sitemap.test.js, which fails when a routed page is not on the list.
COPY ./nginx/robots.txt /var/www/html/
COPY --from=build /app/sitemap.xml /var/www/html/sitemap.xml
