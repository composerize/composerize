// @flow

// Define the "types" of data a docker cli flag can represent in yaml.
export type ArgType =
    // Used for lists of things
    // e.g. --device (https://docs.docker.com/compose/compose-file/#devices)
    | 'Array'

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
    | 'DeviceBlockIOConfigRate'
    | 'DeviceBlockIOConfigWeight'
    | 'Networks'
    | 'MapArray'
    | 'Map'
    | 'Envs'
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
    path?: null,
    value?: null,
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
    'blkio-weight': getMapping('IntValue', 'blkio_config/weight'),
    'blkio-weight-device': getMapping('DeviceBlockIOConfigWeight', 'blkio_config/weight_device'),
    'cap-add': getMapping('Array', 'cap_add'),
    'cap-drop': getMapping('Array', 'cap_drop'),
    'cgroup-parent': getMapping('Value', 'cgroup_parent'),
    cgroupns: getMapping('Value', 'cgroup'),
    'cpu-period': getMapping('Value', 'cpu_period'),
    'cpu-quota': getMapping('Value', 'cpu_quota'),
    'cpu-rt-period': getMapping('Value', 'cpu_rt_period'),
    'cpu-rt-runtime': getMapping('Value', 'cpu_rt_runtime'),
    'cpu-shares': getMapping('IntValue', 'cpu_shares'),
    cpus: getMapping('FloatValue', 'deploy/resources/limits/cpus'),
    detached: getMapping('Switch', ''),
    'device-cgroup-rule': getMapping('Array', 'device_cgroup_rules'),
    'device-read-bps': getMapping('DeviceBlockIOConfigRate', 'blkio_config/device_read_bps'),
    'device-read-iops': getMapping('DeviceBlockIOConfigRate', 'blkio_config/device_read_iops'),
    'device-write-bps': getMapping('DeviceBlockIOConfigRate', 'blkio_config/device_write_bps'),
    'device-write-iops': getMapping('DeviceBlockIOConfigRate', 'blkio_config/device_write_iops'),
    device: getMapping('Array', 'devices'),
    'dns-opt': getMapping('Array', 'dns_opt'),
    'dns-search': getMapping('Array', 'dns_search'),
    dns: getMapping('Array', 'dns'),
    domainname: getMapping('Value', 'domainname'),
    entrypoint: getMapping('Array', 'entrypoint'),
    'env-file': getMapping('Array', 'env_file'),
    env: getMapping('Envs', 'environment'),
    expose: getMapping('Array', 'expose'),
    gpus: getMapping('Gpus', 'deploy'),
    'group-add': getMapping('Array', 'group_add'),
    'health-cmd': getMapping('Value', 'healthcheck/test'),
    'health-interval': getMapping('Value', 'healthcheck/interval'),
    'health-retries': getMapping('Value', 'healthcheck/retries'),
    'health-start-period': getMapping('Value', 'healthcheck/start_period'),
    'health-timeout': getMapping('Value', 'healthcheck/timeout'),
    hostname: getMapping('Value', 'hostname'),
    init: getMapping('Switch', 'init'),
    interactive: getMapping('Switch', 'stdin_open'),
    ip6: getMapping('Value', 'networks/¤network¤/ipv6_address'),
    ip: getMapping('Value', 'networks/¤network¤/ipv4_address'),
    ipc: getMapping('Value', 'ipc'),
    isolation: getMapping('Value', 'isolation'),
    label: getMapping('Array', 'labels'),
    'link-local-ip': getMapping('Array', 'networks/¤network¤/link_local_ips'),
    link: getMapping('Array', 'links'),
    'log-driver': getMapping('Value', 'logging/driver'),
    'log-opt': getMapping('Map', 'logging/options'),
    'mac-address': getMapping('Value', 'mac_address'),
    'memory-reservation': getMapping('Value', 'deploy/resources/reservations/memory'),
    'memory-swap': getMapping('Value', 'memswap_limit'),
    'memory-swappiness': getMapping('Value', 'mem_swappiness'),
    memory: getMapping('Value', 'deploy/resources/limits/memory'),
    mount: getMapping('MapArray', 'volumes'),
    name: getMapping('Value', 'container_name'),
    net: getMapping('Networks', 'network_mode'), // alias for network
    'network-alias': getMapping('Array', 'networks/¤network¤/aliases'),
    network: getMapping('Networks', 'network_mode'),
    'no-healthcheck': getMapping('Switch', 'healthcheck/disable'),
    'oom-kill-disable': getMapping('Switch', 'oom_kill_disable'),
    'oom-score-adj': getMapping('Value', 'oom_score_adj'),
    pid: getMapping('Value', 'pid'),
    'pids-limit': getMapping('IntValue', 'deploy/resources/limits/pids'),
    platform: getMapping('Value', 'platform'),
    privileged: getMapping('Switch', 'privileged'),
    publish: getMapping('Array', 'ports'),
    pull: getMapping('Value', 'pull_policy'),
    'read-only': getMapping('Switch', 'read_only'),
    restart: getMapping('Value', 'restart'),
    rm: getMapping('Switch', ''),
    runtime: getMapping('Value', 'runtime'),
    'security-opt': getMapping('Array', 'security_opt'),
    'shm-size': getMapping('Value', 'shm_size'),
    'stop-signal': getMapping('Value', 'stop_signal'),
    'stop-timeout': getMapping('Value', 'stop_grace_period'),
    'storage-opt': getMapping('Map', 'storage_opt'),
    sysctl: getMapping('Array', 'sysctls'),
    tmpfs: getMapping('Value', 'tmpfs'),
    tty: getMapping('Switch', 'tty'),
    ulimit: getMapping('Ulimits', 'ulimits'),
    user: getMapping('Value', 'user'),
    userns: getMapping('Value', 'userns_mode'),
    uts: getMapping('Value', 'uts'),
    volume: getMapping('Array', 'volumes'),
    'volumes-from': getMapping('Array', 'volume_from'),
    workdir: getMapping('Value', 'working_dir'),
};

// Add flag mappings
MAPPINGS.v = MAPPINGS.volume;
MAPPINGS.p = MAPPINGS.publish;
MAPPINGS.e = MAPPINGS.env;
MAPPINGS.l = MAPPINGS.label;
MAPPINGS.h = MAPPINGS.hostname;
MAPPINGS.u = MAPPINGS.user;
MAPPINGS.w = MAPPINGS.workdir;
MAPPINGS.c = MAPPINGS['cpu-shares'];
MAPPINGS.l = MAPPINGS.label;
MAPPINGS.t = MAPPINGS.tty;
MAPPINGS.i = MAPPINGS.interactive;
MAPPINGS.m = MAPPINGS.memory;
MAPPINGS.d = MAPPINGS.detached;
