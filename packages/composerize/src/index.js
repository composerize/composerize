// @flow

import 'core-js/fn/object/entries';

import yamljs from 'yamljs';
import parser from 'yargs-parser';
import deepmerge from 'deepmerge';

import { maybeGetComposeEntry, getComposeJson } from './logic';

export type RawValue = string | number | boolean | [string | number | boolean];

const getServiceName = (image: string): string => {
    let name = image.includes('/') ? image.split('/').slice(-1)[0] : image;
    name = name.includes(':') ? name.split(':')[0] : name;

    return name;
};

export default (input: string): ?string => {
    const formattedInput = input.replace(/(\s)+/g, ' ').trim();
    const parsedInput: {
        +_: Array<string>,
        +[flag: string]: RawValue,
    } = parser(formattedInput.replace(/^docker (run|create)/, ''), {
        configuration: { 'halt-at-non-option': true },
        boolean: ['i', 't', 'd', 'rm', 'privileged'],
    });
    const { _: command, ...params } = parsedInput;

    if (!formattedInput.startsWith('docker run') && !formattedInput.startsWith('docker create')) {
        throw new SyntaxError('must be a valid docker run/create command');
    }

    // The service object that we'll update
    let service = {};

    // $FlowFixMe: may be do better
    const { net: netArg, network: networkArg } = params;
    const network = netArg || networkArg || 'default';

    // Loop through the tokens and append to the service object
    Object.entries(params).forEach(([key, value]: [string, RawValue | mixed]) => {
        // https://github.com/facebook/flow/issues/2174
        // $FlowFixMe: Object.entries wipes out types ATOW
        const result = maybeGetComposeEntry(key, value);
        if (result) {
            const entries = Array.isArray(result) ? result : [result];
            entries.forEach(entry => {
                // Store whatever the next entry will be
                const json = getComposeJson(entry);
                service = deepmerge(service, json);
            });
        }
    });

    const image = command[0];
    service.image = image;
    if (command.length > 1) {
        let argStart = 1;
        const commandArgsArray = [];
        while (argStart < command.length) {
            commandArgsArray.push(command[argStart]);
            argStart += 1;
        }
        service.command = commandArgsArray.join(' ');
    }

    const namedVolumes = [];
    if (service.volumes) {
        for (let volumeIndex = 0; volumeIndex < service.volumes.length; volumeIndex += 1) {
            let source;
            if (typeof service.volumes[volumeIndex] === 'string') {
                const volumeName = service.volumes[volumeIndex].split(':')[0];
                source = volumeName;
            } else {
                const volumeSource = service.volumes[volumeIndex].source;
                source = volumeSource;
            }
            if (source && !source.includes('/') && !source.includes('$')) {
                namedVolumes.push([source, {}]);
            }
        }
    }

    const namedNetworks = [];
    if (service.networks) {
        if (Array.isArray(service.networks)) {
            for (let networkIndex = 0; networkIndex < service.networks.length; networkIndex += 1) {
                namedNetworks.push([
                    service.networks[networkIndex],
                    { external: { name: service.networks[networkIndex] } },
                ]);
            }
        } else {
            Object.keys(service.networks).forEach(serviceNetworkName => {
                // TODO: supposed to be done by babel : if (service.networks.hasOwnProperty(network))
                namedNetworks.push([serviceNetworkName, { external: { name: serviceNetworkName } }]);
            });
        }
    }

    const serviceName = getServiceName(image);

    // Outer template
    const result = {
        version: '3.3',
        services: {
            [serviceName]: service,
        },
    };
    if (namedNetworks.length > 0) {
        const networks = fromEntries(namedNetworks);
        result = { ...result, networks };
    }
    if (namedVolumes.length > 0) {
        result.volumes = Object.fromEntries(namedVolumes);
    }

    return yamljs.stringify(result, 9, 4).trim();
};
