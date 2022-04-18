[![production environment](https://github.com/kiddspazz/www/actions/workflows/deploy-to-prod.yml/badge.svg?branch=main)](https://github.com/kiddspazz/www/actions/workflows/deploy-to-prod.yml)
[![development environment](https://github.com/kiddspazz/www/actions/workflows/deploy-to-dev.yml/badge.svg?branch=dev)](https://github.com/kiddspazz/www/actions/workflows/deploy-to-dev.yml)
[![Last Commit](https://img.shields.io/github/last-commit/kiddspazz/www)](https://github.com/kiddspazz/www)

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
this project uses git submodules (!), so you'll have to do a bit of extra setup work:
`git submodule init`
`git submodule update`

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

