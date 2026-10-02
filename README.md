[![production environment](https://github.com/travis-horton/www/actions/workflows/deploy-to-prod.yml/badge.svg?branch=main)](https://github.com/travis-horton/www/actions/workflows/deploy-to-prod.yml)
[![development environment](https://github.com/travis-horton/www/actions/workflows/deploy-to-dev.yml/badge.svg?branch=dev)](https://github.com/travis-horton/www/actions/workflows/deploy-to-dev.yml)
[![Last Commit](https://img.shields.io/github/last-commit/travis-horton/www)](https://github.com/travis-horton/www)

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

[docker](https://www.docker.com)

### setup

this project uses git submodules (!), so you'll have to do a bit of extra setup work:
`git submodule init`
`git submodule update`

### install

simply `npm install`

### usage

`npm run serve` runs `parcel serve`, which sets up a version of the app on `localhost:1234`

### run tests

`npm test` runs the tests (jest); `npm run lint` runs eslint

### deployment

this is set up to deploy to stage [kiddspazz.com](https://www.kiddspazz.com) simply by git pushing
the `dev` branch.
production automatically deploys on merge with `main`.

# authors

* kiddspazz/thor/travis, [github](https://github.com/travis-horton)

uses kiddspazz's perlin noise, asteroids, ray-tracer, polygon-race and orbitz repos

# TODOS

* add blog posts

# docker notes
ok... here's the deal. the following commands will set everything up basically how it should be,

the problem is that you if you start the nginx proxy docker container more than 5 times within
168hrs (1week) the certificate authority will restrict your sign certs.

the docker docs say you should probably use a network other than the default "bridge", but i think i
was reading somewhere else that part of this setup requires the default network...

From the Docker docs:
When you start Docker, a default bridge network (also called bridge) is created automatically, and
newly-started containers connect to it unless otherwise specified. You can also create user-defined
custom bridge networks.

the proxy and acme containers are started with `--restart always`, not `--rm`: a container started
with `--rm` is deleted when the server reboots, and then nothing answers on ports 80 and 443 until
someone starts it again by hand.

both images are named by version. `reverse-proxy/docker-compose.yml` describes the same two
containers for `docker compose` (it calls them `nginx-proxy` and `nginx-proxy-acme`); keep the
versions here and there the same. on any one server use one way or the other and stay with it:
compose puts its project name in front of the volume names, so switching starts the proxy on empty
certificate volumes.


## start the nginx proxy docker container -- to be done in stage and prod
docker run --detach --restart always --name proxy --publish 80:80 --publish 443:443 --volume certs:/etc/nginx/certs --volume vhost:/etc/nginx/vhost.d --volume html:/usr/share/nginx/html --volume /var/run/docker.sock:/tmp/docker.sock:ro -d nginxproxy/nginx-proxy:1.11.6


## start acme docker container with real certs (limit 5 per week!) -- to be done in stage and prod
docker run --detach --restart always --name acme --volumes-from proxy --volume /var/run/docker.sock:/var/run/docker.sock:ro --volume acme:/etc/acme.sh -d nginxproxy/acme-companion:2.8.2


the two "start kiddspazz website" blocks below are how it was first done by hand. the deploy
workflows now start these containers themselves, as `web` and `www_web` (see `.github/workflows/`).

## start kiddspazz website at travish.com -- to be done in prod
docker run --rm --name website -e VIRTUAL_HOST=travish.com -e LETSENCRYPT_HOST=travish.com -e VIRTUAL_PORT=80 -d kiddspazz/www_web
docker run --rm --name www_website -e VIRTUAL_HOST=www.travish.com -e LETSENCRYPT_HOST=www.travish.com -e VIRTUAL_PORT=80 -d kiddspazz/www_web


## start kiddspazz website at kiddspazz.com -- to be done in stage
docker run --rm --name website -e VIRTUAL_HOST=kiddspazz.com -e LETSENCRYPT_HOST=kiddspazz.com -e VIRTUAL_PORT=80 -d kiddspazz/www_web


## start the acme docker container with test certs and DEBUG mode -- for testing only
docker run --detach --rm --name acme --env "DEBUG=1" --volumes-from proxy --volume /var/run/docker.sock:/var/run/docker.sock:ro --volume acme:/etc/acme.sh --env "ACME_CA_URI=https://acme-staging-v02.api.letsencrypt.org/directory" -d nginxproxy/acme-companion:2.8.2
