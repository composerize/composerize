/* eslint-env jest */

import Composerize from '../src';

it('fails with invalid commands', () => {
    expect(() => {
        Composerize('foo bar');
    }).toThrow();
});

test('basic docker run command', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        baz:
            ports:
                - '80:80'
            image: 'foobar/baz:latest'"
  `);
});

test('basic docker create command', () => {
    const command = 'docker create -p 80:80 --name webserver nginx:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        nginx:
            ports:
                - '80:80'
            container_name: webserver
            image: 'nginx:latest'"
  `);
});

test('docker run command with options', () => {
    const command =
        'docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        nginx:
            ports:
                - '80:80'
            volumes:
                - '/var/run/docker.sock:/tmp/docker.sock:ro'
            restart: always
            logging:
                options:
                    max-size: 1g
            image: nginx"
  `);
});

test('spacing is normalized', () => {
    const command =
        ' docker   run -p 80:80  -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx    ';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        nginx:
            ports:
                - '80:80'
            volumes:
                - '/var/run/docker.sock:/tmp/docker.sock:ro'
            restart: always
            logging:
                options:
                    max-size: 1g
            image: nginx"
  `);
});

test('multiple args (https://github.com/magicmark/composerize/issues/9)', () => {
    const command =
        'docker run -t --name="youtrack" -v /data/youtrack/data/:/opt/youtrack/data/ -v /data/youtrack/backup/:/opt/youtrack/backup/ -p 80:80 -p 3232:22351 uniplug/youtrack';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        youtrack:
            container_name: youtrack
            volumes:
                - '/data/youtrack/data/:/opt/youtrack/data/'
                - '/data/youtrack/backup/:/opt/youtrack/backup/'
            ports:
                - '80:80'
                - '3232:22351'
            image: uniplug/youtrack"
  `);
});

test('testing parsing of quotes (https://github.com/magicmark/composerize/issues/10)', () => {
    const command = 'docker run --name="foobar" nginx';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        nginx:
            container_name: foobar
            image: nginx"
  `);
});
