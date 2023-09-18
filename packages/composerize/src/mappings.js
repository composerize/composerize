// @flow

// Define the "types" of data a docker cli flag can represent in yaml.
export type ArgType =
    // Used for lists of things
    // e.g. --device (https://docs.docker.com/compose/compose-file/#devices)
    | 'Array'

    // Used to store a mapping of one key to one value
    // e.g. --log-driver (https://docs.docker.com/compose/compose-file/#logging)
    | 'KeyValue'

    // Used to store a "limits" value of the input format: <type>=<soft limit>[:<hard limit>]
    // e.g. --ulimit
    // @see https://docs.docker.com/compose/compose-file/#ulimits
    // @see https://docs.docker.com/engine/reference/commandline/run/#set-ulimits-in-container---ulimit
    | 'Ulimits'

    // Used to store a boolean value for an option
    // e.g. --privileged (https://docs.docker.com/compose/compose-file/#domainname-hostname-ipc-mac_address-privileged-read_only-shm_size-stdin_open-tty-user-working_dir)
    | 'Switch'

    // Used to store an arbitrary text value for an option
    | 'Value'
    | 'IntValue'
    | 'FloatValue'
    | 'Networks'
    | 'MapArray'
    | 'Map'
    | 'Gpus';

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
        [string]: string | number | any,
    },
};

export type SwitchComposeEntry = {
    path: string,
    value: boolean,
};

export type ValueComposeEntry = {
    path: string,
    value: string | number | any,
};

export type IgnoreComposeEntry = {
    path: null,
    value: null,
};

export type ComposeEntry =
    | ArrayComposeEntry
    | KVComposeEntry
    | SwitchComposeEntry
    | ValueComposeEntry
    | IgnoreComposeEntry;

export const getMapping = (type: ArgType, path: string): Mapping => ({
    type,
    path,
});

// docker cli -> docker-compose options
export const MAPPINGS: { [string]: Mapping } = {
    'add-host': getMapping('Array', 'extra_hosts'),
    cap_add: getMapping('Array', 'cap_add'),
    cap_drop: getMapping('Array', 'cap_drop'),
    'cgroup-parent': getMapping('Value', 'cgroup_parent'),
    cgroupns: getMapping('Value', 'cgroup'),
    detached: getMapping('Switch', ''),
    device: getMapping('Array', 'devices'),
    dns: getMapping('Array', 'dns'),
    dns_search: getMapping('Array', 'dns_search'),
    env_file: getMapping('Array', 'env_file'),
    domainname: getMapping('Value', 'domainname'),
    expose: getMapping('Array', 'expose'),
    gpus: getMapping('Gpus', 'deploy'),
    'health-cmd': getMapping('Value', 'healthcheck/test'),
    'health-interval': getMapping('Value', 'healthcheck/interval'),
    'health-retries': getMapping('Value', 'healthcheck/retries'),
    'health-start-period': getMapping('Value', 'healthcheck/start_period'),
    'health-timeout': getMapping('Value', 'healthcheck/timeout'),
    hostname: getMapping('Value', 'hostname'),
    interactive: getMapping('Switch', 'stdin_open'),
    label: getMapping('Array', 'labels'),
    link: getMapping('Array', 'links'),
    'log-driver': getMapping('Array', 'logging/driver'),
    'log-opt': getMapping('KeyValue', 'logging/options'),
    entrypoint: getMapping('Array', 'entrypoint'),
    env: getMapping('Array', 'environment'),
    mount: getMapping('MapArray', 'volumes'),
    name: getMapping('Value', 'container_name'),
    net: getMapping('Networks', 'network_mode'), // alias for network
    'network-alias': getMapping('Array', 'networks/¤network¤/aliases'),
    network: getMapping('Networks', 'network_mode'),
    'no-healthcheck': getMapping('Switch', 'healthcheck/disable'),
    pid: getMapping('Value', 'pid'),
    privileged: getMapping('Switch', 'privileged'),
    publish: getMapping('Array', 'ports'),
    'read-only': getMapping('Switch', 'read_only'),
    restart: getMapping('Value', 'restart'),
    rm: getMapping('Switch', ''),
    tmpfs: getMapping('Value', 'tmpfs'),
    tty: getMapping('Switch', 'tty'),
    ulimit: getMapping('Ulimits', 'ulimits'),
    user: getMapping('Value', 'user'),
    volume: getMapping('Array', 'volumes'),
};

// Add flag mappings
MAPPINGS.v = MAPPINGS.volume;
MAPPINGS.p = MAPPINGS.publish;
MAPPINGS.e = MAPPINGS.env;
MAPPINGS.l = MAPPINGS.label;
MAPPINGS.h = MAPPINGS.hostname;
MAPPINGS.u = MAPPINGS.user;
MAPPINGS.t = MAPPINGS.tty;
MAPPINGS.i = MAPPINGS.interactive;
MAPPINGS.d = MAPPINGS.detached;
