#!/usr/bin/env node
/* eslint-disable */

const composerize = require('./dist/composerize');

const command = process.argv.slice(2).join(' ');
console.log(composerize(command));
