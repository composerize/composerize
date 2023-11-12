# composerize

[![Build Status](https://travis-ci.org/magicmark/composerize.svg?branch=master)](https://travis-ci.com/github/magicmark/composerize)
[![npm](https://img.shields.io/npm/v/composerize.svg)](https://www.npmjs.com/package/composerize)
[![Follow @mark_larah](https://img.shields.io/twitter/follow/mark_larah)](https://twitter.com/mark_larah?ref_src=github_composerize)
[![ShareVB on GitHub](https://img.shields.io/badge/ShareVB-100000?logo=github&logoColor=white)](https://github.com/sharevb)
            
http://composerize.com - Turns `docker run` commands into `docker-compose.yml` files and even merge with existing `docker-compose.yml`!

Looking for the reverse : http://decomposerize.com / [Decomposerize](https://github.com/outilslibre/decomposerize)

Want to convert from Docker compose file formats : http://composeverter.com / [Composeverter](https://github.com/outilslibre/composeverter)

![Demo](https://i.imgur.com/GayZj2G.png)

## CLI

composerize can be run in the cli.

`npm install composerize -g` to install, and run as such:

```bash
$ composerize docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx
```


## How to use with node.js

Make sure to install the `composerize` package in your project by running:

```bash
npm install composerize
```

With the following code, you can easily integrate **Composerize** into your Node.js project and generate Docker Compose configurations from Docker run commands.

```javascript
const { convertDockerRunToCompose } = require('composerize');

const dockerRunCommand = 'docker run -d -p 8080:80 --name my-web-app nginx:latest';

// Convert the Docker run command to a Docker Compose configuration
const composeConfig = convertDockerRunToCompose(dockerRunCommand);

console.log(composeConfig);
```

You can also merge docker run command(s) with an existing Docker Compose file content :

```javascript
const { convertDockerRunToCompose } = require('composerize');

const dockerRunCommand = 'docker run -d -p 8080:80 --name my-web-app nginx:latest';

// An existing Docker Compose configuration as a string
const existingComposeConfig = `
version: '3'
services:
  existing-service:
    image: my-existing-image:latest
    ports:
      - '8000:80'
`;

// Convert the Docker run command to a Docker Compose configuration and merge with provided docker compose
const composeConfig = convertDockerRunToCompose(dockerRunCommand, existingComposeConfig);

console.log(composeConfig);
```

You can also choose which version of Docker compose V2, you target : 2.x, 3.x or Common Specification by specifying a third parameter `composeVersion` on `convertDockerRunToCompose` :
- 'v2x'
- 'v3x'
- 'latest'

```javascript
const { convertDockerRunToCompose } = require('composerize');

const dockerRunCommand = 'docker run -d -p 8080:80 --name my-web-app nginx:latest';

// Convert the Docker run command to a Docker Compose configuration for 2.x
const composeConfig = convertDockerRunToCompose(dockerRunCommand, null, 'v2x');

console.log(composeConfig);
```

## Contributing

- [Clone a fork of the repo](https://guides.github.com/activities/forking/) and install the project dependencies by running `yarn`
- Make your changes, and build the project by running `make build`
- Test your changes with `make test`

### yarn version

Needs yarn@1.19.1. See https://github.com/yarnpkg/yarn/issues/7734.

## Maintainers

- Mark Larah (Twitter: [@mark_larah](https://twitter.com/mark_larah))
- ShareVB [GitHub](https://github.com/sharevb)
