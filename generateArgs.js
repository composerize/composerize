const exec = require('child_process').exec;

const parseOptions = options => {
    options.split('\n').forEach(line => {
        lineSplit = line.replace(/(\s)+/g, ' ').trim().split(' ');

        let option;
        let flag;
        let type;

        if (lineSplit[0].startsWith('--')) {
            option = lineSplit[0];

            if (lineSplit[1] === 'value') {
                type = 'array'
            }

        }

    });
    console.log(options);
};

exec('docker run --help', (err, output) => {
    if (!err) {
        parseOptions(output.split('Options:\n')[1]);
    }
});
