[![style: styled-components](https://img.shields.io/badge/style-%F0%9F%92%85%20styled--components-orange.svg?colorB=daa357&colorA=db748e)](https://github.com/styled-components/styled-components)

[![development environment](https://github.com/kiddspazz/www/actions/workflows/deploy-to-dev.yml/badge.svg?branch=dev)](https://github.com/kiddspazz/www/actions/workflows/deploy-to-dev.yml)
[![production environment](https://github.com/kiddspazz/www/actions/workflows/deploy-to-prod.yml/badge.svg?branch=main)](https://github.com/kiddspazz/www/actions/workflows/deploy-to-prod.yml)

# website repo

a general all-around website, with sections for personal interests, jobs/skills, and blog

## built with

* javascript
* react
* [nginx-proxy docker](https://github.com/nginx-proxy/nginx-proxy) for nginx reverse proxy services
* [acme-companion](https://github.com/nginx-proxy/acme-companion) paired with above for ssl/https
    services

# getting started
### prerequisites

[yarn](https://yarnpkg.com)

[docker](https://www.docker.com)

### setup

make sure you have yarn (see above)

### install

simply `yarn`

### usage

`yarn serve` runs `parcel serve`, which sets up a version of the app on `localhost:1234`

### run tests

*TODO* write tests

### deployment

this is set up to deploy to stage [kiddspazz.com](https://www.kiddspazz.com) simply by git pushing
the `dev` branch.
production automatically deploys on merge with `main`.

# authors

* kiddspazz/thor/travis, github: [@github](https://github.com/kiddspazz)

uses kiddspazz's perlin noise, asteroids, ray-tracer, polygon-race and orbitz repos

# TODOS

* add blog posts
* write tests
