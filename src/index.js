// @flow
import yamljs from 'yamljs';
import parser from 'yargs-parser';
import deepmerge from 'deepmerge';

import { maybeGetComposeEntry, getComposeJson } from './logic';

const getServiceName = image => {
    let name = image.includes('/') ? image.split('/')[1] : image;
    name = name.includes(':') ? name.split(':')[0] : name;

    return name;
};

export default (input: string): ?string => {
    const formattedInput = input.replace(/(\s)+/g, ' ').trim();
    const tokens = parser(formattedInput);

    if (tokens._[0] !== 'docker' || tokens._[1] !== 'run') {
        throw new SyntaxError('must be a valid docker run command');
    }

    // The service object that we'll update
    let service = {};

    // Loop through the tokens and append to the service object
    Object.entries(tokens)
        .filter(t => t[0] !== '_')
        .forEach(([key, value]) => {
            const composeEntry = maybeGetComposeEntry(key, value);
            if (composeEntry) {
                // Store whatever the next entry will be
                const json = getComposeJson(composeEntry);
                service = deepmerge(service, json);
            }
        });

    const image = tokens._[tokens._.length - 1];
    service.image = image;

    const serviceName = getServiceName(image);

    // Outer template
    const result = {
        version: '3.3',
        services: {
            [serviceName]: service,
        },
    };

    return yamljs.stringify(result, 9, 4).trim();
};
