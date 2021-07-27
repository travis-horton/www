# notes
ok... here's the deal. the following commands will set everything up basically how it should be,
but right now the docker containers in production are on the network "bridge", which is the default
network. the problem is that you can only start the nginx proxy docker container no more than 5
times within 168hrs (1week) (cause the certificate authority will restrict your sign certs). what
this means is that in a week i should go restart that nginx proxy docker container in production on
a dedicated network (the docs suggest "net").


## start the nginx proxy docker container -- to be done in stage and prod
docker run --detach --rm --name proxy --publish 80:80 --publish 443:443 --volume certs:/etc/nginx/certs --volume vhost:/etc/nginx/vhost.d --volume html:/usr/share/nginx/html --volume /var/run/docker.sock:/tmp/docker.sock:ro --network net -d nginxproxy/nginx-proxy


## start acme docker container with real certs (limit 5 per week!) -- to be done in stage and prod
docker run --detach --rm --name acme --network net --volumes-from proxy --volume /var/run/docker.sock:/var/run/docker.sock:ro --volume acme:/etc/acme.sh -d nginxproxy/acme-companion


## start kiddspazz website at travish.com -- to be done in prod
docker run --rm --name website --network net -e VIRTUAL_HOST=travish.com -e LETSENCRYPT_HOST=travish.com -e VIRTUAL_PORT=80 -d kiddspazz/www_web
docker run --rm --name www_website --network net -e VIRTUAL_HOST=www.travish.com -e LETSENCRYPT_HOST=www.travish.com -e VIRTUAL_PORT=80 -d kiddspazz/www_web


## start kiddspazz website at kiddspazz.com -- to be done in stage
docker run --rm --name website -e VIRTUAL_HOST=kiddspazz.com -e LETSENCRYPT_HOST=kiddspazz.com -e VIRTUAL_PORT=80 --network net -d kiddspazz/www_web


## start the acme docker container with test certs and DEBUG mode -- for testing only
docker run --detach --rm --name acme --network net --env "DEBUG=1" --volumes-from proxy --volume /var/run/docker.sock:/var/run/docker.sock:ro --volume acme:/etc/acme.sh --env "ACME_CA_URI=https://acme-staging-v02.api.letsencrypt.org/directory" -d nginxproxy/acme-companion
