eval `docker-machine env default`
docker-compose -f docker-compose.yml -f docker-compose-dev.yml up