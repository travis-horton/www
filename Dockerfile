# syntax=docker/dockerfile:1
FROM node:latest AS build
WORKDIR /app

ARG GIT_HASH=unknown
ENV GIT_HASH=$GIT_HASH

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm ci
COPY ./src /app/src
RUN npm run build

FROM nginx:latest
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
