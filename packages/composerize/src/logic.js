// @flow
import type {
  ComposeEntry,
  KVComposeEntry,
  ArrayComposeEntry,
  SwitchComposeEntry,
  ValueComposeEntry,
  Mapping,
} from './mappings';
import { MAPPINGS, FLAG_MAPPINGS } from './mappings';

/**
 * Turn a mapping and the value of the mapping into a formatted json object
 */
export const getComposeEntry = (
  mapping: Mapping,
  value: string,
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
      value: [value],
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
  tokens: [string],
  idx: number,
): ?ComposeEntry => {
  // The docker cli argument key (what to look up in the mapping object)
  let mapKey;
  // The 'Mapping' object (to map from the cli key to the docker compose equivalent structure)
  let mapping;
  // The value of the argument
  let value;

  const token = tokens[idx];

  // Look up things like --restart
  if (token.startsWith('--')) {
    if (token.includes('=')) {
      // Syntax is `--restart=always`
      [mapKey, value] = token.substr(2).split('=');
    } else {
      // Syntax is presumably `--restart true`
      [mapKey, value] = [token.substr(2), tokens[idx + 1]];
    }

    mapping = MAPPINGS[mapKey];
  } else if (token.startsWith('-')) {
    // Look up things like -v
    [mapKey, value] = [token.substr(1), tokens[idx + 1]];
    mapping = FLAG_MAPPINGS[mapKey];
  }

  if (mapping && value) {
    return getComposeEntry(mapping, value);
  }

  return null;
};

export const getComposeJson = (entry: ComposeEntry): any =>
  entry.path
    .split('/')
    .reduceRight((prev, pathItem) => ({ [pathItem]: prev }), entry.value);
