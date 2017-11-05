#!/usr/bin/env node

const composerize = require('./dist/composerize');

const command = process.argv.slice(2).join(' ');
// eslint-disable-next-line no-console
console.log(composerize(command));
