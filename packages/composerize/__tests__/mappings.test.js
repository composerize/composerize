/* eslint-env jest */

import Composerize from '../src';

test('--privileged', () => {
    const command = 'docker run --privileged -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        baz:
            privileged: true
            ports:
                - '80:80'
            image: 'foobar/baz:latest'"
  `);
});

test('--network (https://github.com/magicmark/composerize/issues/25)', () => {
    const command =
        'docker run -d --name plex --network=host -e TZ="<timezone>" -e PLEX_CLAIM="<claimToken>" -v <path/to/plex/database>:/config -v <path/to/transcode/temp>:/transcode -v <path/to/media>:/data plexinc/pms-docker';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        pms-docker:
            container_name: plex
            network_mode: host
            environment:
                - TZ=<timezone>
                - PLEX_CLAIM=<claimToken>
            volumes:
                - '<path/to/plex/database>:/config'
                - '<path/to/transcode/temp>:/transcode'
                - '<path/to/media>:/data'
            image: plexinc/pms-docker"
  `);
});

test('--pid ', () => {
    const command = 'docker run -p 80:80 --pid="host" --name webserver nginx:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        nginx:
            ports:
                - '80:80'
            pid: host
            container_name: webserver
            image: 'nginx:latest'"
  `);
});
