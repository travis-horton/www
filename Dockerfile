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
COPY --from=build /app/dist /var/www/html
