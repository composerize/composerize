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

const parseListAsValueComposeEntryObject = (argValue: String, listSeparator: string, entrySeparator: string) => {
    const args = argValue.split(listSeparator);

    return fromEntries(
        args.map(_arg => {
            const [k, v] = _arg.split(entrySeparator, 2);
            return [k, v];
        }),
    );
};

/**
 * Turn a mapping and the value of the mapping into a formatted json object
 */
export const getComposeEntry = (mapping: Mapping, value: RawValue): ComposeEntry | Array<ComposeEntry> => {
    if (mapping.type === 'KeyValue' && typeof value === 'string') {
        return ({
            path: mapping.path,
            value: {
                [value.split('=')[0]]: value.split('=')[1],
            },
        }: KVComposeEntry);
    }

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

    if (mapping.type === 'MapArray') {
        const values = Array.isArray(value) ? value : [value];

        return values.map(
            _value =>
                ({
                    path: mapping.path,
                    value: [parseListAsValueComposeEntryObject(_value, ',', '=')],
                }: ValueComposeEntry),
        );
    }

    if (mapping.type === 'Map') {
        const argValue = Array.isArray(value) ? value.join(',') : value;

        return ({
            path: mapping.path,
            value: parseListAsValueComposeEntryObject(argValue, ',', '='),
        }: ValueComposeEntry);
    }

        const values = Array.isArray(value) ? value : [value];

        return values.map((_value) => {
            const args = String(_value).split(',');
            return ({
                path: mapping.path,
                value: [Object.fromEntries(args.map((_arg) => _arg.split('=')))],
            }: KVComposeEntry);
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
