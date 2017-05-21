/**
 * This will become a seperate npm module
 */

import 'yamljs/dist/yaml.min.js';
import spawnargs from 'spawn-args';


const Argument = (type, key, value) => ({
    type, key, value,
});

const OptionType = {
    'Array': value => Argument.bind(null, 'array', value),
    'Value': value => Argument.bind(null, 'value', value),
    'Switch': value => Argument.bind(null, 'switch', value),
    'KeyValue': value => Argument.bind(null, 'keyvalue', value),
};

// docker cli -> docker-compose
const optionMap = {
    'device': OptionType.Array('devices'),
    'cap_add': OptionType.Array('cap_add'),
    'cap_drop': OptionType.Array('cap_drop'),
    'cgroup_parent': OptionType.Value('cgroup_parent'),
    'dns': OptionType.Array('dns'),
    'dns_search': OptionType.Array('dns_search'),
    'env_file': OptionType.Array('env_file'),
    'expose': OptionType.Array('expose'),
    'label': OptionType.Array('labels'),
    'link': OptionType.Array('links'),
    'entrypoint': OptionType.Array('entrypoint'),
    'env': OptionType.Array('environment'),
    'name': OptionType.Value('container_name'),
    'publish': OptionType.Array('ports'),
    'restart': OptionType.Value('restart'),
    'tmpfs': OptionType.Value('tmpfs'),
    'volume': OptionType.Array('volumes'),
    'log-driver': OptionType.Array('logging/driver'),
    'log-opt': OptionType.KeyValue('logging/options'),
};

const flagMap = {
    'v': optionMap.volume,
    'p': optionMap.publish,
    'e': optionMap.env,
};

const setObjectPath = (obj, argument) => {

	const path = argument.key.split('/');
	for (let i = 0; i < path.length - 1; i++) {
		obj[path[i]] = obj[path[i]] || {};
		obj = obj[path[i]];
	}

	if (argument.type === 'array') {
		obj[path[path.length - 1]] = obj[path[path.length - 1]] || [];
		obj[path[path.length - 1]].push(argument.value);
	}

	if (argument.type === 'value') {
		obj[path[path.length - 1]] = argument.value;
	}

	if (argument.type === 'keyvalue') {
		const splitKeyValue = argument.value.split('=');
		obj[path[path.length - 1]] = obj[path[path.length - 1]] || {};
		obj[path[path.length - 1]][splitKeyValue[0]] = splitKeyValue[1];
	}

};

export default input => {
    input = input.replace(/(\s)+/g, ' ').trim();

    const tokens = spawnargs(input, { removequotes: 'always' });

    const arrays = {};
    const values = {};
    const mappings = {};

    for (let i = 2; i < tokens.length; i++) {
        const token = tokens[i];

        // Store whatever the next mapping will be
        let argument;

        // Look up things like --restart
        if (token.startsWith('--')) {

            // Check if syntax is --restart=always
            if (token.includes('=')) {
                const splitToken = token.split('=');
                const createMapping = optionMap[splitToken[0].substr(2)];

                if (createMapping) {
                    argument = createMapping(splitToken[1]);
                }

            // Syntax is presumabely --restart true
            } else {
                const createMapping = optionMap[token.substr(2)];

                if (createMapping) {
                    argument = createMapping(tokens[i + 1])
                }
            }

        } else if (token.startsWith('-')) {
            const createMapping = flagMap[token.substr(1)];

            if (createMapping) {
                argument = createMapping(tokens[i + 1])
            }
        }

        if (argument) {
            setObjectPath(mappings, argument);
        }

    }

    const image = tokens[tokens.length - 1];
    const service = (image.includes('/')) ? image.split('/')[1] : image;

    const result = {
        version: "2",
        services: {
            [service]: {}
        }
    };

    result.services[service].image = image;

    result.services[service] = Object.assign({}, result.services[service], arrays);
    result.services[service] = Object.assign({}, result.services[service], values);
    result.services[service] = Object.assign({}, result.services[service], mappings);
    return window.YAML.stringify(result, 9, 4);
};
