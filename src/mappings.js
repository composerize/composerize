// @flow

// Define the "types" of data a docker cli flag can represent in yaml.
export type ArgType =
    // Used for lists of things
    // e.g. --device (https://docs.docker.com/compose/compose-file/#devices)
    | 'Array'

    // Used to store a mapping of one key to one value
    // e.g. --log-driver (https://docs.docker.com/compose/compose-file/#logging)
    | 'KeyValue'

    // Used to store a boolean value for an option
    // e.g. --privileged (https://docs.docker.com/compose/compose-file/#domainname-hostname-ipc-mac_address-privileged-read_only-shm_size-stdin_open-tty-user-working_dir)
    | 'Switch'

    // Used to store an arbitrary text value for an option
    | 'Value';

// Type to represent the structure of the docker compose mapping
export type Mapping = {
    type: ArgType,
    path: string,
};

// Type to represent a compose file entry
export type ArrayComposeEntry = {
    path: string,
    value: [string],
};

export type KVComposeEntry = {
    path: string,
    value: {
        [string]: string,
    },
};

export type SwitchComposeEntry = {
    path: string,
    value: boolean,
};

export type ValueComposeEntry = {
    path: string,
    value: string,
};

export type ComposeEntry =
    | ArrayComposeEntry
    | KVComposeEntry
    | SwitchComposeEntry
    | ValueComposeEntry;

export const getMapping = (type: ArgType, path: string): Mapping => ({
    type,
    path,
});

// docker cli -> docker-compose options
export const MAPPINGS: { [string]: Mapping } = {
    device: getMapping('Array', 'devices'),
    cap_add: getMapping('Array', 'cap_add'),
    cap_drop: getMapping('Array', 'cap_drop'),
    cgroup_parent: getMapping('Value', 'cgroup_parent'),
    dns: getMapping('Array', 'dns'),
    dns_search: getMapping('Array', 'dns_search'),
    env_file: getMapping('Array', 'env_file'),
    expose: getMapping('Array', 'expose'),
    label: getMapping('Array', 'labels'),
    link: getMapping('Array', 'links'),
    entrypoint: getMapping('Array', 'entrypoint'),
    env: getMapping('Array', 'environment'),
    name: getMapping('Value', 'container_name'),
    publish: getMapping('Array', 'ports'),
    restart: getMapping('Value', 'restart'),
    tmpfs: getMapping('Value', 'tmpfs'),
    volume: getMapping('Array', 'volumes'),
    'log-driver': getMapping('Array', 'logging/driver'),
    'log-opt': getMapping('KeyValue', 'logging/options'),
};

// Add flag mappings
MAPPINGS.v = MAPPINGS.volume;
MAPPINGS.p = MAPPINGS.publish;
MAPPINGS.e = MAPPINGS.env;
