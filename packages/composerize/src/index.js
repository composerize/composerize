// @flow
import yamljs from 'yamljs';
import spawnargs from 'spawn-args';

import { maybeGetComposeEntry, getComposeJson } from './logic';

export default (input: string): ?string => {
  const formattedInput = input.replace(/(\s)+/g, ' ').trim();
  const tokens = spawnargs(formattedInput, { removequotes: 'always' });

  if (tokens[0] !== 'docker' || tokens[1] !== 'run') {
    throw new SyntaxError('must be a valid docker run command');
  }

  // remove 'docker run'
  tokens.splice(0, 2);

  // The service object that we'll update
  let service = {};

  // Loop through the tokens and append to the service object
  tokens.forEach((token, idx) => {
    const composeEntry = maybeGetComposeEntry(tokens, idx);
    if (composeEntry) {
      // Store whatever the next entry will be
      const json = getComposeJson(composeEntry);
      service = Object.assign({}, service, json);
    }
  });

  const image = tokens[tokens.length - 1];
  const serviceName = image.includes('/') ? image.split('/')[1] : image;

  // Outer template
  const result = {
    version: 3,
    services: {
      [serviceName]: service,
    },
  };

  return yamljs.stringify(result, 9, 4).trim();
};
