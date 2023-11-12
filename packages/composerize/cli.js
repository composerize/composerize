#!/usr/bin/env node
/* eslint-disable */

const composerize = require('./dist/composerize');

const command = process.argv.slice(2).join(' ');

if (process.stdin.isTTY){
	console.log(composerize(command));
}
else {
	var existingDockerCompose = '';
	process.stdin.on('data', function(d) {
		existingDockerCompose += d;
	}).on('end', function() {
		console.log(composerize(command, existingDockerCompose));
	}).setEncoding('utf8');
}
