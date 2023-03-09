/* eslint-env jest */

import Composerize from '../src';

test('--read-only', () => {
    const command = 'docker run --read-only -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
            "version: '3.3'
            services:
                baz:
                    read_only: true
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'"
      `);
});

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

test('--user', () => {
    const command = 'docker run --user 99:100 -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
            "version: '3.3'
            services:
                baz:
                    user: '99:100'
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'"
      `);
});

test('--label', () => {
    const command = 'docker run --label test1=value -l test2=value -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
            "version: '3.3'
            services:
                baz:
                    labels:
                        - test1=value
                        - test2=value
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'"
      `);
});

test('--hostname', () => {
    const command = 'docker run --hostname myHostName -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
            "version: '3.3'
            services:
                baz:
                    hostname: myHostName
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'"
      `);
});

test('-h', () => {
    const command = 'docker run -h myHostName -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
            "version: '3.3'
            services:
                baz:
                    hostname: myHostName
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

test('--ulimit (https://github.com/magicmark/composerize/pull/262)', () => {
    expect(Composerize('docker run --ulimit as=1024 nginx:latest')).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            nginx:
                ulimits:
                    as: 1024
                image: 'nginx:latest'"
    `);

    expect(Composerize('docker run --ulimit nproc=3 nginx:latest')).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            nginx:
                ulimits:
                    nproc: 3
                image: 'nginx:latest'"
    `);

    expect(Composerize('docker run --ulimit nofile=1023:1025 nginx:latest')).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            nginx:
                ulimits:
                    nofile:
                        soft: 1023
                        hard: 1025
                image: 'nginx:latest'"
    `);

    // @see https://docs.docker.com/compose/compose-file/#ulimits
    expect(Composerize('docker run --ulimit nproc=65535 --ulimit nofile=20000:40000 nginx:latest'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            nginx:
                ulimits:
                    nproc: 65535
                    nofile:
                        soft: 20000
                        hard: 40000
                image: 'nginx:latest'"
    `);
});
