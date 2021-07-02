[![style: styled-components](https://img.shields.io/badge/style-%F0%9F%92%85%20styled--components-orange.svg?colorB=daa357&colorA=db748e)](https://github.com/styled-components/styled-components)

![build to dev](https://github.com/kiddspazz/.github/workflows/publish-docker-image-on-push.yml/badge.svg?branch=dev)

# website repo

a general all-around website, with sections for personal interests, jobs/skills, and blog

## built with

* javascript
* react
* styled-components

# getting started

to get a local version:

### prerequisites

[yarn](https://yarnpkg.com)
[docker](https://www.docker.com)

### setup

make sure your docker deamon is running (aka start docker)

### install

no install needed. this runs in a container and the container build takes care of all the
installations

### usage

simply `yarn rebuild` will stop a docker container called "web" and rebuild and restart it
this container listens on port 8080, so navigate in your browser to [localhost:8080](localhost:8080)

### run tests

*TODO* write tests

### deployment

this is set up to deploy to stage [kiddspazz.com](https://www.kiddspazz.com) simply by git pushing
the `dev` branch.

*TODO* set up the deploy to production on a merge into master

# authors

* kiddspazz/thor/travis, github: [@github](https://github.com/kiddspazz)

uses kiddspazz's perlin noise repo

# TODOS

* add router to contact for resume
* fix footer overhang
