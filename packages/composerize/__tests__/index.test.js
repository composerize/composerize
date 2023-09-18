/* eslint-env jest */

import Composerize from '../src';

test('fails with invalid commands', () => {
    expect(() => {
        Composerize('foo bar');
    }).toThrow();
});

test('multiple docker run command', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest\n# comment\n\ndocker run -p 80:80 foobar/buzz:latest\ndocker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx\n';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        baz:
            ports:
                - '80:80'
            image: 'foobar/baz:latest'
        buzz:
            ports:
                - '80:80'
            image: 'foobar/buzz:latest'
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

test('basic docker container run command', () => {
    const command = 'docker container run -p 80:80 foobar/baz:latest';

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
    const command = 'docker create -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        baz:
            ports:
                - '80:80'
            image: 'foobar/baz:latest'"
  `);
});

test('basic docker service create command', () => {
    const command = 'docker service create -p 80:80 foobar/baz:latest';

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
            tty: true
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

test('testing with unknown args ()', () => {
    const command = 'docker run --name="foobar" -z machin --unknown-long truc nginx';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "# ignored options for 'nginx'
    # -z=machin
    # --unknown-long=truc
    version: '3.3'
    services:
        nginx:
            container_name: foobar
            image: nginx"
  `);
});
test('--rm', () => {
    const command = 'docker run --rm=True ubuntu';

    expect(Composerize(command)).toMatchInlineSnapshot(`
    "version: '3.3'
    services:
        ubuntu:
            image: ubuntu"
  `);
});
