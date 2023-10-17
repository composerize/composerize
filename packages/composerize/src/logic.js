// @flow

import invariant from 'invariant';

import { MAPPINGS } from './mappings';
import type {
    ComposeEntry,
    KVComposeEntry,
    ArrayComposeEntry,
    SwitchComposeEntry,
    ValueComposeEntry,
    IgnoreComposeEntry,
    Mapping,
} from './mappings';

import type { RawValue } from './index';

export const fromEntries = (iterable: Iterable<any>) =>
    [...iterable].reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

const parseListAsValueComposeEntryObject = (argValue: string, listSeparator: string, entrySeparator: string) => {
    const args = argValue.split(listSeparator);

    return fromEntries(
        args.map(_arg => {
            const [k, v] = _arg.split(entrySeparator, 2);
            return [k, /^-?\d+$/.test(String(v)) ? parseInt(v, 10) : v];
        }),
    );
};

const stripQuotes = (val: string): string =>
    typeof val === 'string' && (val[0] === "'" || val[0] === '"') && val[val.length - 1] === val[0]
        ? val.substring(1, val.length - 1)
        : val;

/**
 * Turn a mapping and the value of the mapping into a formatted json object
 */
export const getComposeEntry = (mapping: Mapping, value: RawValue): ComposeEntry | Array<ComposeEntry> => {
    if (mapping.type === 'Array') {
        return ({
            path: mapping.path,
            // $FlowFixMe: TODO: Map to array of strings
            value: Array.isArray(value) ? value : [String(value)],
        }: ArrayComposeEntry);
    }

    if (mapping.type === 'Networks') {
        const stringValue = String(value);
        if (!stringValue.match(/^(host|bridge|none)$|^container:.+/)) {
            return ({
                path: 'networks',
                value: [stringValue],
            }: ValueComposeEntry);
        }

        return ({
            path: 'network_mode',
            value: stringValue,
        }: ValueComposeEntry);
    }

    if (mapping.type === 'Switch') {
        return ({
            path: mapping.path,
            value: value === 'true' || value === true,
        }: SwitchComposeEntry);
    }

    if (mapping.type === 'Gpus') {
        return ({
            path: 'deploy',
            value: {
                resources: {
                    reservations: {
                        devices: [
                            {
                                driver: 'nvidia',
                                count: value === 'all' ? 'all' : parseInt(value, 10),
                                capabilities: ['gpu'],
                            },
                        ],
                    },
                },
            },
        }: KVComposeEntry);
    }

    if (mapping.type === 'Envs') {
        const values = Array.isArray(value) ? value : [value];

        return values.map(_value => {
            const [k, v] = String(_value).split('=', 2);
            return ({
                path: mapping.path,
                value: [v ? `${k}=${stripQuotes(v)}` : k],
            }: ValueComposeEntry);
        });
    }

    if (mapping.type === 'MapArray') {
        const values = Array.isArray(value) ? value : [value];

        return values.map(
            _value =>
                ({
                    path: mapping.path,
                    value: [parseListAsValueComposeEntryObject(String(_value), ',', '=')],
                }: ValueComposeEntry),
        );
    }

    if (mapping.type === 'Map') {
        const argValue = Array.isArray(value) ? value.join(',') : value;

        return ({
            path: mapping.path,
            value: parseListAsValueComposeEntryObject(String(argValue), ',', '='),
        }: ValueComposeEntry);
    }

    if (mapping.type === 'DeviceBlockIOConfigWeight') {
        const values = Array.isArray(value) ? value : [value];

        return values.map(_value => {
            const [path, weight] = String(_value).split(':');

            return ({
                path: mapping.path,
                value: [
                    {
                        path,
                        weight: parseInt(weight, 10),
                    },
                ],
            }: ValueComposeEntry);
        });
    }

    if (mapping.type === 'DeviceBlockIOConfigRate') {
        const values = Array.isArray(value) ? value : [value];

        return values.map(_value => {
            const [path, rate] = String(_value).split(':');

            return ({
                path: mapping.path,
                value: [
                    {
                        path,
                        rate: /^-?\d+$/.test(String(rate)) ? parseInt(rate, 10) : rate,
                    },
                ],
            }: ValueComposeEntry);
        });
    }

    if (mapping.type === 'Ulimits') {
        const values = Array.isArray(value) ? value : [value];

        return values.map(_value => {
            const [limitName, limitValue] = String(_value).split('=');
            invariant(
                limitName && limitValue,
                `${mapping.type} must be in the format of: <type>=<soft limit>[:<hard limit>]`,
            );

            if (limitValue.includes(':')) {
                const [soft, hard] = limitValue.split(':');
                invariant(soft && hard, `${mapping.type} must be in the format of: <type>=<soft limit>[:<hard limit>]`);

                return ({
                    path: `${mapping.path}/${limitName}`,
                    value: {
                        soft: parseInt(soft, 10),
                        hard: parseInt(hard, 10),
                    },
                }: KVComposeEntry);
            }

            return ({
                path: `${mapping.path}/${limitName}`,
                value: parseInt(limitValue, 10),
            }: ValueComposeEntry);
        });
    }

    if (mapping.type === 'IntValue') {
        return ({
            path: mapping.path,
            value: parseInt(value, 10),
        }: ValueComposeEntry);
    }

    if (mapping.type === 'FloatValue') {
        return ({
            path: mapping.path,
            value: parseFloat(value),
        }: ValueComposeEntry);
    }

    return ({
        path: mapping.path,
        value: String(value),
    }: ValueComposeEntry);
};

/**
 * Map a token(s) to the argument type and value
 */
export const maybeGetComposeEntry = (
    /* The docker cli argument key (what to look up in the mapping objects) */
    mapKey: string,
    /* The value(s) to be applied */
    value: RawValue,
): ?ComposeEntry | ?Array<ComposeEntry> => {
    // The 'Mapping' object (to map from the cli key to the docker compose equivalent structure)
    const mapping = MAPPINGS[mapKey];

    if (!mapping) {
        return null;
    }

    if (mapping.path === '') {
        // TODO: Throw error / warning
        return ({}: IgnoreComposeEntry);
    }

    // Ensure there is a value
    /* istanbul ignore if */
    if (mapping.type !== 'Switch' && !value) {
        // TODO: Throw error / warning
        return null;
    }

    return getComposeEntry(mapping, value);
};

export const getComposeJson = (entry: ComposeEntry, network: any): any => {
    if (!entry.path) return {};

    // $FlowFixMe: used to discard IgnoreComposeEntry, path and value does not exists
    return entry.path
        .replace('¤network¤', network.toString())
        .split('/')
        .reduceRight((prev, pathItem) => ({ [pathItem]: prev }), entry.value);
};
