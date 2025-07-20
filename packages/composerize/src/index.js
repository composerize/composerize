// @flow

import parser from 'yargs-parser';
import deepmerge from 'deepmerge';
import Composeverter from 'composeverter';

import { maybeGetComposeEntry, getComposeJson, fromEntries, stripQuotes } from './logic';

export type RawValue = string | number | boolean | [string | number | boolean] | any;

export type ComposeVersion = 'latest' | 'v2x' | 'v3x';

const getServiceName = (image: string): string => {
    if (image === null || image === '' || typeof image === 'undefined') return '!!!invalid!!!';
    let name = image.includes('/') ? image.split('/').slice(-1)[0] : image;
    name = name.includes(':') ? name.split(':')[0] : name;

    return name;
};

export type ComposeFile = { composeFile: any, composeCreationComments: string };

const getComposeFileJson = (input: string, existingComposeFile: string): ComposeFile => {
    const formattedInput = input
        .replace(/\n\s*#[^\n]+/g, '')
        .replace(/\$\([^)]*\)/g, (m) => m.replace(/\s/g, '¤'))
        .replace(/\\\n/g, '')
        .replace(/(\s)+/g, ' ')
        .trim()
        .replace(/\s-p(\d)/g, ' -p $1')
        .replace(/\s\\\s/g, ' ')
        .replace(/\s*;$/g, '');
    const formattedInputArgs = formattedInput.replace(
        /^(?:\s*\$\s+)?docker\s+(run|create|container\s+run|service\s+create)/,
        '',
    );
    const parsedInput: {
        +_: Array<string>,
        +[flag: string]: RawValue,
    } = parser(formattedInputArgs, {
        configuration: {
            'halt-at-non-option': true,
            'camel-case-expansion': false,
            'boolean-negation': false,
        },
        boolean: [
            'i',
            'interactive',
            't',
            'tty',
            'd',
            'detach',
            'rm',
            'init',
            'help',
            'privileged',
            'P',
            'publish-all',
            'no-healthcheck',
            'oom-kill-disable',
            'read-only',
            'sig-proxy',
        ],
    });
    const { _: command, ...rawParams } = parsedInput;
    const cleanStringArg = (v: any) =>
        stripQuotes(String(v).trim()).replace(/\$\([^)]*\)/g, (m) => m.replace(/¤/g, ' '));
    const params = Object.fromEntries(
        Object.entries(rawParams).map(([key, value]: [string, RawValue]) => {
            if (Array.isArray(value)) {
                return [key.trim(), value.map((v) => (typeof v === 'string' ? cleanStringArg(v) : v))];
            }
            return [key.trim(), typeof value === 'string' ? cleanStringArg(value) : value];
        }),
    );
    // The service object that we'll update
    let service = {};

    // $FlowFixMe: may be do better
    const { net: netArg, network: networkArg } = params;
    const network = netArg || networkArg || 'default';

    const ignoredOptions = [];
    // Loop through the tokens and append to the service object
    Object.entries(params).forEach(([key, value]: [string, RawValue]) => {
        // https://github.com/facebook/flow/issues/2174
        // $FlowFixMe: Object.entries wipes out types ATOW
        const result = maybeGetComposeEntry(key, value);
        if (result) {
            const entries = Array.isArray(result) ? result : [result];
            entries.forEach((entry) => {
                // Store whatever the next entry will be
                const json = getComposeJson(entry, network);
                service = deepmerge(service, json);
            });
        } else {
            const dash = key.length === 1 ? '-' : '--';
            const valueString = value === true ? '' : `=${value.toString()}`;
            ignoredOptions.push(`# ${dash}${key}${valueString}`);
        }
    });

    const image = stripQuotes(command[0]?.trim());
    // $FlowFixMe: prop missing
    service.image = image;
    if (command.length > 1) {
        let argStart = 1;
        const commandArgsArray = [];
        while (argStart < command.length) {
            commandArgsArray.push(command[argStart]);
            argStart += 1;
        }
        // $FlowFixMe: prop missing
        service.command = commandArgsArray.join(' ');
    }

    // $FlowFixMe: prop missing
    if (service.network_mode === 'host') {
        // $FlowFixMe: prop missing
        delete service.ports;
    }

    const isNamedVolume = (source: string) =>
        source &&
        !source.includes('/') &&
        !source.includes('\\') &&
        !source.includes('$') &&
        !source.includes('<') &&
        !source.includes('>');
    const namedVolumes = [];
    // $FlowFixMe: prop missing
    if (service.volumes) {
        // $FlowFixMe: prop missing
        for (let volumeIndex = 0; volumeIndex < service.volumes.length; volumeIndex += 1) {
            let source;
            // $FlowFixMe: prop missing
            if (typeof service.volumes[volumeIndex] === 'string') {
                // $FlowFixMe: prop missing
                const volumeName = service.volumes[volumeIndex].split(':')[0];
                source = volumeName;
            } else {
                // $FlowFixMe: prop missing
                const volumeSource = service.volumes[volumeIndex].source;
                source = volumeSource;
            }
            if (isNamedVolume(source)) {
                namedVolumes.push([source, { external: { name: source } }]);
            }
        }
    }

    // $FlowFixMe: prop missing
    if (service.networks) {
        const isObjectEmpty = (obj: any) => obj && Object.keys(obj).length === 0 && obj.constructor === Object;
        // $FlowFixMe: prop missing
        Object.keys(service.networks).forEach((serviceNetworkName) => {
            // $FlowFixMe: prop missing
            if (isObjectEmpty(service.networks[serviceNetworkName])) {
                // $FlowFixMe: prop missing
                service.networks[serviceNetworkName] = null;
            }
        });
        // $FlowFixMe: prop missing
        if (Object.values(service.networks).every((v) => !v)) {
            // $FlowFixMe: prop missing
            service.networks = Object.keys(service.networks);
        }
    }

    const namedNetworks = [];
    // $FlowFixMe: prop missing
    if (service.networks) {
        // $FlowFixMe: prop missing
        if (Array.isArray(service.networks)) {
            // $FlowFixMe: prop missing
            for (let networkIndex = 0; networkIndex < service.networks.length; networkIndex += 1) {
                namedNetworks.push([
                    // $FlowFixMe: prop missing
                    service.networks[networkIndex],
                    // $FlowFixMe: prop missing
                    { external: true, name: service.networks[networkIndex] },
                ]);
            }
        } else {
            // $FlowFixMe: prop missing
            Object.keys(service.networks).forEach((serviceNetworkName) => {
                // TODO: supposed to be done by babel : if (service.networks.hasOwnProperty(network))
                namedNetworks.push([serviceNetworkName, { external: true, name: serviceNetworkName }]);
            });
        }
    }

    const serviceName = getServiceName(image);

    // Outer template
    let result;
    const generatedCompose = {
        version: '3',
        services: {
            [serviceName]: service,
        },
    };
    const existingCompose = Composeverter.yamlParse(existingComposeFile ?? '') ?? {};
    result = deepmerge(existingCompose, generatedCompose);

    let composeCreationComments = '';
    if (ignoredOptions.length > 0)
        composeCreationComments = `# ignored options for '${serviceName}'\n${ignoredOptions.join('\n')}\n`;

    if (namedNetworks.length > 0) {
        const networks = { networks: fromEntries(namedNetworks) };
        result = deepmerge(result, networks);

        namedNetworks.forEach(([name]) => {
            composeCreationComments += `# named network '${name}' is marked as "external" (used by service '${serviceName}'), so either remove "external" from network definition or it needs to be created using: docker network create -d bridge ${name}\n`;
        });
    }
    if (namedVolumes.length > 0) {
        const volumes = { volumes: fromEntries(namedVolumes) };
        result = deepmerge(result, volumes);

        namedVolumes.forEach(([name]) => {
            composeCreationComments += `# named volume '${name}' is marked as "external" (used by service '${serviceName}'), so either remove "external" from volume definition or it needs to be created using: docker volume create ${name}\n`;
        });
    }


    return ({
        composeFile: result,
        composeCreationComments,
    }: ComposeFile);
};

export default (
    input: string,
    existingComposeFile: string = '',
    composeVersion: 'latest' | 'v2x' | 'v3x' = 'latest',
    indent: number = 4,
): ?string => {
    const globalComposeCreationComments = [];
    let result = {};
    const dockerCommands = input.split(/^(?:\s*\$)?\s*docker\s+/gm);
    let convertedExistingComposeFile = existingComposeFile;
    if (existingComposeFile) {
        if (composeVersion === 'v2x')
            convertedExistingComposeFile = Composeverter.migrateFromV3xToV2x(convertedExistingComposeFile, { indent });
        else if (composeVersion === 'latest')
            convertedExistingComposeFile = Composeverter.migrateToCommonSpec(convertedExistingComposeFile, { indent });
    }
    dockerCommands.forEach((dockerCommand) => {
        const command = String(dockerCommand);
        if (!command) return;
        if (!command.match(/^\s*(run|create|container\s+run|service\s+create)/)) {
            globalComposeCreationComments.push(`# ignored : docker ${command}\n`);
            return;
        }
        const { composeFile, composeCreationComments } = getComposeFileJson(
            `docker ${command}`,
            convertedExistingComposeFile,
        );
        if (composeCreationComments) globalComposeCreationComments.push(composeCreationComments);

        result = deepmerge(result, composeFile);
    });
    // $FlowFixMe: prop missing
    if (!result.services)
        throw new SyntaxError('must have at least a valid docker run/create/service create/container run command');

    let finalComposeYaml = Composeverter.yamlStringify(result, { indent }).trim();
    if (composeVersion === 'v2x') finalComposeYaml = Composeverter.migrateFromV3xToV2x(finalComposeYaml, { indent });
    else if (composeVersion === 'latest')
        finalComposeYaml = Composeverter.migrateToCommonSpec(finalComposeYaml, { indent });
    else if (composeVersion !== 'v3x') throw new Error(`Unknown ComposeVersion '${composeVersion}'`);

    return globalComposeCreationComments.join('\n') + finalComposeYaml;
};
