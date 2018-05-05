# composerize

[![Greenkeeper badge](https://badges.greenkeeper.io/magicmark/composerize.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/magicmark/composerize.svg?branch=master)](https://travis-ci.org/magicmark/composerize)
[![npm](https://img.shields.io/npm/v/composerize.svg)](https://www.npmjs.com/package/composerize)

http://composerize.com - Turns docker run commands into docker-compose files!

![Demo](https://i.imgur.com/GayZj2G.png)

## CLI

composerize can be run in the cli.

`npm install composerize -g` to install, and run as such:

```bash
$ composerize docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx
```

## Contributing

- [Clone a fork of the repo](https://guides.github.com/activities/forking/) and install the project dependencies by running `yarn install`
- Make your changes, and build the project by running `yarn build`
- Test your changes with `yarn test`
