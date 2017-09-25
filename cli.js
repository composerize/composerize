#!/usr/bin/env node
'use strict';

var composerize = require('./dist/composerize');
var command = process.argv.slice(2).join(' ');
console.log(composerize(command));
