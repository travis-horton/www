# syntax=docker/dockerfile:1
FROM node:latest AS build
WORKDIR /app

ARG GIT_HASH=unknown
ENV GIT_HASH=$GIT_HASH

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install
COPY ./src /app/src
RUN yarn build

FROM nginx:latest
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html
