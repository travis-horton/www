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

* kiddspazz/thor/travis, [github](https://github.com/kiddspazz)

uses kiddspazz's perlin noise, asteroids, ray-tracer, polygon-race and orbitz repos

# TODOS

* add blog posts
* write tests

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


## start the nginx proxy docker container -- to be done in stage and prod
docker run --detach --rm --name proxy --publish 80:80 --publish 443:443 --volume certs:/etc/nginx/certs --volume vhost:/etc/nginx/vhost.d --volume html:/usr/share/nginx/html --volume /var/run/docker.sock:/tmp/docker.sock:ro -d nginxproxy/nginx-proxy


## start acme docker container with real certs (limit 5 per week!) -- to be done in stage and prod
docker run --detach --rm --name acme --volumes-from proxy --volume /var/run/docker.sock:/var/run/docker.sock:ro --volume acme:/etc/acme.sh -d nginxproxy/acme-companion


## start kiddspazz website at travish.com -- to be done in prod
docker run --rm --name website -e VIRTUAL_HOST=travish.com -e LETSENCRYPT_HOST=travish.com -e VIRTUAL_PORT=80 -d kiddspazz/www_web
docker run --rm --name www_website -e VIRTUAL_HOST=www.travish.com -e LETSENCRYPT_HOST=www.travish.com -e VIRTUAL_PORT=80 -d kiddspazz/www_web


## start kiddspazz website at kiddspazz.com -- to be done in stage
docker run --rm --name website -e VIRTUAL_HOST=kiddspazz.com -e LETSENCRYPT_HOST=kiddspazz.com -e VIRTUAL_PORT=80 -d kiddspazz/www_web


## start the acme docker container with test certs and DEBUG mode -- for testing only
docker run --detach --rm --name acme --env "DEBUG=1" --volumes-from proxy --volume /var/run/docker.sock:/var/run/docker.sock:ro --volume acme:/etc/acme.sh --env "ACME_CA_URI=https://acme-staging-v02.api.letsencrypt.org/directory" -d nginxproxy/acme-companion
