# composerize

http://composerize.com

Turns docker run commands into docker-compose files

## cli
composerize can be run in the cli.

`npm install composerize` to install, and run as such:

```
$ node_modules/.bin/composerize docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx
version: 3
services:
    nginx:
        ports:
            - '80:80'
        volumes:
            - '/var/run/docker.sock:/tmp/docker.sock:ro'
        restart: always
        logging:
            options:
                max-size: 1g
```
