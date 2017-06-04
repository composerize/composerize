var composerize = require('./dist/bundle');
var command = process.argv.slice(2).join(' ');
console.log(composerize(command));
