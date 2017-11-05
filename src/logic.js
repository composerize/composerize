// @flow

import type {
    ComposeEntry,
    KVComposeEntry,
    ArrayComposeEntry,
    SwitchComposeEntry,
    ValueComposeEntry,
    Mapping,
} from './mappings';
import { MAPPINGS } from './mappings';

type RawValue = string | number | boolean | [string | number | boolean];

/**
 * Turn a mapping and the value of the mapping into a formatted json object
 */
export const getComposeEntry = (
    mapping: Mapping,
    value: RawValue,
): ComposeEntry => {
    if (mapping.type === 'KeyValue') {
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
            value: Array.isArray(value) ? value : [value],
        }: ArrayComposeEntry);
    }

    if (mapping.type === 'Switch') {
        return ({
            path: mapping.path,
            value: value === 'true',
        }: SwitchComposeEntry);
    }

    return ({
        path: mapping.path,
        value,
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
): ?ComposeEntry => {
    // The 'Mapping' object (to map from the cli key to the docker compose equivalent structure)
    const mapping = MAPPINGS[mapKey];

    if (!mapping) {
        // TODO: Throw error / warning
        return null;
    }

    // Ensure there is a value
    if (mapping.type !== 'Switch' && !value) {
        // TODO: Throw error / warning
        return null;
    }

    if (mapping && value) {
        return getComposeEntry(mapping, value);
    }

    // TODO: Throw error / warning
    return null;
};

export const getComposeJson = (entry: ComposeEntry): any =>
    entry.path
        .split('/')
        .reduceRight((prev, pathItem) => ({ [pathItem]: prev }), entry.value);
