# syntax=docker/dockerfile:1
FROM node:latest as build

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install
COPY ./src /app/src
RUN yarn build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
