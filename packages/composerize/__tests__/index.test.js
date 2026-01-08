/* eslint-env jest */

import Composerize from '../src';

test('fails with invalid commands', () => {
    expect(() => {
  Composerize('foo bar');
}).toThrowErrorMatchingInlineSnapshot(`"must have at least a valid docker/podman run/create/service create/container run command"`

);
});

test('fails with invalid conversion', () => {
    expect(() => {
        Composerize('docker run nginx', null, 'xxx');
    }).toThrowErrorMatchingInlineSnapshot(`"Unknown ComposeVersion 'xxx'"`);
});

test('basic docker run command 2.x', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(Composerize(command, null, 'v2x')).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('basic docker run command 3.x', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(Composerize(command, null, 'v3x')).toMatchInlineSnapshot(`
        "version: \\"3\\"
        services:
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('multiple docker run command', () => {
    const command =
        'docker run -p 80:80 foobar/baz:latest\n# comment\n\ndocker run -p 80:80 foobar/buzz:latest\ndocker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx\ndocker stop\n';

    expect(Composerize(command)).toMatchInlineSnapshot(`
"# ignored : docker/podman stop

name: <your project name>
services:
    baz:
        ports:
            - 80:80
        image: foobar/baz:latest
    buzz:
        ports:
            - 80:80
        image: foobar/buzz:latest
    nginx:
        ports:
            - 80:80
        volumes:
            - /var/run/docker.sock:/tmp/docker.sock:ro
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
        "name: <your project name>
        services:
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('basic podman run command', () => {
    const command = 'podman run -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('basic docker container run command', () => {
    const command = 'docker container run -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('basic docker create command', () => {
    const command = 'docker create -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('basic docker service create command', () => {
    const command = 'docker service create -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('basic docker create command', () => {
    const command = 'docker create -p 80:80 --name webserver nginx:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                ports:
                    - 80:80
                container_name: webserver
                image: nginx:latest"
    `);
});

test('docker run command with options', () => {
    const command =
        'docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                ports:
                    - 80:80
                volumes:
                    - /var/run/docker.sock:/tmp/docker.sock:ro
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
        "name: <your project name>
        services:
            nginx:
                ports:
                    - 80:80
                volumes:
                    - /var/run/docker.sock:/tmp/docker.sock:ro
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
        "name: <your project name>
        services:
            youtrack:
                tty: true
                container_name: youtrack
                volumes:
                    - /data/youtrack/data/:/opt/youtrack/data/
                    - /data/youtrack/backup/:/opt/youtrack/backup/
                ports:
                    - 80:80
                    - 3232:22351
                image: uniplug/youtrack"
    `);
});

test('testing parsing of quotes (https://github.com/magicmark/composerize/issues/10)', () => {
    const command = 'docker run --name="foobar" nginx';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
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
        name: <your project name>
        services:
            nginx:
                container_name: foobar
                image: nginx"
    `);
});

test('testing malformed command line', () => {
    const command = 'docker run --name="foobar" --bool nginx';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "# ignored options for '!!!invalid!!!'
        # --bool=nginx
        name: <your project name>
        services:
            \\"!!!invalid!!!\\":
                container_name: foobar"
    `);
});

test('--rm', () => {
    const command = 'docker run --rm=True ubuntu';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                image: ubuntu"
    `);
});

test('basic docker run command with null existing compose', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(Composerize(command, null)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('basic docker run command with existing compose (commonspec)', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(
        Composerize(
            command,
            `
version: '3.3'
services:
    nginx:
        container_name: foobar
        image: nginx
    `,
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                container_name: foobar
                image: nginx
            baz:
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('basic docker run command with existing compose (2.x)', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(
        Composerize(
            command,
            `
version: '3.3'
services:
    nginx:
        container_name: foobar
        image: nginx
    `,
            'v2x',
        ),
    ).toMatchInlineSnapshot(`
"version: \\"2.4\\"
services:
    nginx:
        container_name: foobar
        image: nginx
    baz:
        ports:
            - 80:80
        image: foobar/baz:latest"
`);
});

test('basic docker run command with existing compose (3.x)', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(
        Composerize(
            command,
            `
version: '3.3'
services:
    nginx:
        container_name: foobar
        image: nginx
    `,
            'v3x',
        ),
    ).toMatchInlineSnapshot(`
"version: \\"3\\"
services:
    nginx:
        container_name: foobar
        image: nginx
    baz:
        ports:
            - 80:80
        image: foobar/baz:latest"
`);
});

test('basic docker run command with existing compose and named volumes', () => {
    const command = 'docker run -d  -v vol:/tmp --net othernet hello-world  --parameter';

    expect(
  Composerize(
    command,
    `
# some comment

version: '3.3'
services:
    readymedia:
        restart: unless-stopped #some other comment
        container_name: readymedia1
        network_mode: host
        networks:
            - kong-net
        volumes:
            - '/my/video/path:/media'
            - 'readymediacache:/cache'
        environment:
            - VIDEO_DIR1=/media/my_video_files
        image: ypopovych/readymedia
networks:
    kong-net:
        external:
            name: kong-net
volumes:
    readymediacache: {}

    `
  )
).toMatchInlineSnapshot(`
"# named network 'othernet' is marked as \\"external\\" (used by service 'hello-world'), so either remove \\"external\\" from network definition or it needs to be created using: docker network create -d bridge othernet
# named volume 'vol' is marked as \\"external\\" (used by service 'hello-world'), so either remove \\"external\\" from volume definition or it needs to be created using: docker volume create vol
name: <your project name>
services:
    readymedia:
        restart: unless-stopped
        container_name: readymedia1
        network_mode: host
        networks:
            - kong-net
        volumes:
            - /my/video/path:/media
            - readymediacache:/cache
        environment:
            - VIDEO_DIR1=/media/my_video_files
        image: ypopovych/readymedia
    hello-world:
        volumes:
            - vol:/tmp
        networks:
            - othernet
        image: hello-world
        command: --parameter
networks:
    kong-net:
        external: true
        name: kong-net
    othernet:
        external: true
        name: othernet
volumes:
    readymediacache: {}
    vol:
        external: true
        name: vol"
`);
});

test('testing with env special chars (https://github.com/composerize/composerize/issues/1)', () => {
    const command =
        'docker run --name="foobar" -e PS1="[\\033[01;31m\\]\\u\\[\\033[01;32m\\]@\\h\\[\\033[01;34m\\] \\w \\$\\[\\033[00m\\] " nginx';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                container_name: foobar
                environment:
                    - \\"PS1=[\\\\\\\\033[01;31m\\\\\\\\]\\\\\\\\u\\\\\\\\[\\\\\\\\033[01;32m\\\\\\\\]@\\\\\\\\h\\\\\\\\[\\\\\\\\033[01;34m\\\\\\\\]
                      \\\\\\\\w \\\\\\\\$\\\\\\\\[\\\\\\\\033[00m\\\\\\\\] \\"
                image: nginx"
    `);
});

test('basic docker run command with existing compose (invalid 1)', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(
        Composerize(
            command,
            `
version: '3.3'
services:
    `,
        ),
    ).toMatchInlineSnapshot(`
"name: <your project name>
services:
    baz:
        ports:
            - 80:80
        image: foobar/baz:latest"
`);
});

test('basic docker run command with existing compose (invalid 2)', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(
        Composerize(
            command,
            `
#aze
    `,
        ),
    ).toMatchInlineSnapshot(`
"name: <your project name>
services:
    baz:
        ports:
            - 80:80
        image: foobar/baz:latest"
`);
});

test('basic docker run command with existing compose (invalid 3)', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(
        Composerize(
            command,
            `
#aze
    `,
        ),
    ).toMatchInlineSnapshot(`
"name: <your project name>
services:
    baz:
        ports:
            - 80:80
        image: foobar/baz:latest"
`);
});

test('remove trailing \\ and handle strip quote (https://github.com/composerize/composerize/issues/676)', () => {
    expect(
        Composerize(
            `
docker run --name 'adguardhome'\\
    --restart "unless-stopped"\\
    -v '/my/own/workdir:/opt/adguardhome/work'\\
    -v /my/own/confdir:/opt/adguardhome/conf\\
    -p 53:53/tcp -p "53:53/udp"\\
    -p 67:67/udp -p 68:68/udp\\
    -p 80:80/tcp -p 443:443/tcp -p 443:443/udp -p 3000:3000/tcp\\
    -p 853:853/tcp\\
    -p 784:784/udp -p 853:853/udp -p 8853:8853/udp\\
    -p 5443:5443/tcp -p 5443:5443/udp\\
    -d "adguard/adguardhome"
`,
        ),
    ).toMatchInlineSnapshot(`
"name: <your project name>
services:
    adguardhome:
        container_name: adguardhome
        restart: unless-stopped
        volumes:
            - /my/own/workdir:/opt/adguardhome/work
            - /my/own/confdir:/opt/adguardhome/conf
        ports:
            - 53:53/tcp
            - 53:53/udp
            - 67:67/udp
            - 68:68/udp
            - 80:80/tcp
            - 443:443/tcp
            - 443:443/udp
            - 3000:3000/tcp
            - 853:853/tcp
            - 784:784/udp
            - 853:853/udp
            - 8853:8853/udp
            - 5443:5443/tcp
            - 5443:5443/udp
        image: adguard/adguardhome"
`);
});

test('carriage return in command (#678) - reverted to single line', () => {
    const command = `docker run \\
  -v <CONFIG_FILE_PATH>:/etc/alloy/config.alloy \\
  -p 12345:12345 \\
  grafana/alloy:latest \\
    run --server.http.listen-addr=0.0.0.0:12345 --storage.path=/var/lib/alloy/data \\
    /etc/alloy/config.alloy \\
    other_param`;
    expect(Composerize(command)).toMatchInlineSnapshot(`
"name: <your project name>
services:
    alloy:
        volumes:
            - <CONFIG_FILE_PATH>:/etc/alloy/config.alloy
        ports:
            - 12345:12345
        image: grafana/alloy:latest
        command: run --server.http.listen-addr=0.0.0.0:12345
            --storage.path=/var/lib/alloy/data /etc/alloy/config.alloy
            other_param"
`);
});

test('$ and ; in command (#679)', () => {
    const command = `$ docker run --detach \\
  --name openbis-db \\
  --hostname openbis-db \\
  --network openbis-network \\
  -v openbis-db-data:/var/lib/postgresql/data \\
  -e POSTGRES_PASSWORD=mysecretpassword \\
  -e PGDATA=/var/lib/postgresql/data/pgdata \\
  postgres:15;`;
    expect(Composerize(command)).toMatchInlineSnapshot(`
"# ignored options for 'postgres'
# --detach
# named network 'openbis-network' is marked as \\"external\\" (used by service 'postgres'), so either remove \\"external\\" from network definition or it needs to be created using: docker network create -d bridge openbis-network
# named volume 'openbis-db-data' is marked as \\"external\\" (used by service 'postgres'), so either remove \\"external\\" from volume definition or it needs to be created using: docker volume create openbis-db-data
name: <your project name>
services:
    postgres:
        container_name: openbis-db
        hostname: openbis-db
        networks:
            - openbis-network
        volumes:
            - openbis-db-data:/var/lib/postgresql/data
        environment:
            - POSTGRES_PASSWORD=mysecretpassword
            - PGDATA=/var/lib/postgresql/data/pgdata
        image: postgres:15
networks:
    openbis-network:
        external: true
        name: openbis-network
volumes:
    openbis-db-data:
        external: true
        name: openbis-db-data"
`);
});

test('multiline commands (#697)', () => {
    const command = `docker run -e TZ=Europe/Berlin \\
--name foobar \\
--restart=unless-stopped
--cpus=2 --memory=128m \\
-p 8082:8082 \\
-v /srv/foobar/logs:/logs \\
-v /srv/foobar/config:/config \\
foobar`;
    expect(Composerize(command)).toMatchInlineSnapshot(`
"name: <your project name>
services:
    foobar:
        environment:
            - TZ=Europe/Berlin
        container_name: foobar
        restart: unless-stopped
        deploy:
            resources:
                limits:
                    cpus: 2
                    memory: 128m
        ports:
            - 8082:8082
        volumes:
            - /srv/foobar/logs:/logs
            - /srv/foobar/config:/config
        image: foobar"
`);
});

test('shell expression in env vars [$(...)] (#744)', () => {
    const command = `docker run \
  -d \
  --name tor-relay \
  -e TZ=Europe/London \
  -e PUID=$(id -u -xxx) \
  -e PGID=$(id -g) \
  -v $(pwd)/tor/data:/data:Z \
  -p 9001:9001 \
  --restart always \
  ilshidur/tor-relay`;
    expect(Composerize(command)).toMatchInlineSnapshot(`
"name: <your project name>
services:
    tor-relay:
        container_name: tor-relay
        environment:
            - TZ=Europe/London
            - PUID=$(id -u -xxx)
            - PGID=$(id -g)
        volumes:
            - $(pwd)/tor/data:/data:Z
        ports:
            - 9001:9001
        restart: always
        image: ilshidur/tor-relay"
`);
});

test('indentation is configurable (2 spaces)', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(Composerize(command, null, 'v3x', 2)).toMatchInlineSnapshot(`
"version: \\"3\\"
services:
  baz:
    ports:
      - 80:80
    image: foobar/baz:latest"
`);
});

test('indentation is configurable (4 spaces)', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';

    expect(Composerize(command, null, 'v3x', 4)).toMatchInlineSnapshot(`
"version: \\"3\\"
services:
    baz:
        ports:
            - 80:80
        image: foobar/baz:latest"
`);
});

test('indentation is configurable (2 spaces) with multiple commands', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest\ndocker run -p 81:81 foobar/buzz:latest';

    expect(Composerize(command, null, 'latest', 2)).toMatchInlineSnapshot(`
"name: <your project name>
services:
  baz:
    ports:
      - 80:80
    image: foobar/baz:latest
  buzz:
    ports:
      - 81:81
    image: foobar/buzz:latest"
`);
});

test('indentation is configurable (2 spaces) with existing compose', () => {
    const command = 'docker run -p 80:80 foobar/baz:latest';
    const existingCompose = `
version: '3.3'
services:
  nginx:
    image: nginx
`;

    expect(Composerize(command, existingCompose, 'latest', 2)).toMatchInlineSnapshot(`
"name: <your project name>
services:
  nginx:
    image: nginx
  baz:
    ports:
      - 80:80
    image: foobar/baz:latest"
`);
});
