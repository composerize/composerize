#!/usr/bin/env node
/* eslint-disable */

const composerize = require('./dist/composerize');
const { composerizeCli } = require('./cli-merge');
const argv = require('yargs-parser')(process.argv.slice(2), {
	configuration: {
		'halt-at-non-option': true,
	}
});

const command = argv['_'].join(' ');
const composeVersion = argv.format || argv.f || 'latest';
const indent = Number(argv.indent || argv.i || 2);

if (argv.help || argv.h)
{
	console.log(`
Convert a "docker run/create/container run/service create" command to docker-compose file.

An existing compose.yaml can be passed to stdin to be merged with provided command line.

Available options:
-f, --format: Docker Compose format (v2x, v3x, latest). Default: latest
-i, --indent: number of space for indentation. Default: 2

Samples:
composerize -i 4 -f v2x docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx
	`);
	process.exit();
}

function printOutput(existingDockerCompose) {
	composerizeCli({
		command,
		composerize,
		composeVersion,
		existingDockerCompose,
		indent,
	})
		.then((output) => console.log(output))
		.catch((error) => {
			console.error(error.message);
			process.exit(1);
		});
}

if (process.stdin.isTTY){
	printOutput('');
}
else {
	var existingDockerCompose = '';
	process.stdin.on('data', function(d) {
		existingDockerCompose += d;
	}).on('end', function() {
		printOutput(existingDockerCompose);
	}).setEncoding('utf8');
}
