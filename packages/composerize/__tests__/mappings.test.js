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

test('-it image name (https://github.com/magicmark/composerize/issues/544)', () => {
    expect(Composerize('docker run -p 8000:8000 -it ctfd/ctfd')).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            ctfd:
                ports:
                    - '8000:8000'
                stdin_open: true
                tty: true
                image: ctfd/ctfd"
    `);
    });

test('command name (https://github.com/magicmark/composerize/issues/549)', () => {
    expect(
        Composerize(
            'docker run -d --name=tailscaled -v /var/lib:/var/lib -v /dev/net/tun:/dev/net/tun --network=host --privileged tailscale/tailscale tailscaled',
        ),
    ).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            tailscale:
                container_name: tailscaled
                volumes:
                    - '/var/lib:/var/lib'
                    - '/dev/net/tun:/dev/net/tun'
                network_mode: host
                privileged: true
                image: tailscale/tailscale
                command: tailscaled"
    `);
    });

test('gpus all (https://github.com/magicmark/composerize/issues/550)', () => {
    expect(Composerize('docker run -it --rm --gpus all -p 3000:3000 -v /opt/ai-art:/data overshard/ai-art'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            ai-art:
                stdin_open: true
                tty: true
                deploy:
                    resources:
                        reservations:
                            devices:
                                -
                                    driver: nvidia
                                    count: all
                                    capabilities:
                                        - gpu
                ports:
                    - '3000:3000'
                volumes:
                    - '/opt/ai-art:/data'
                image: overshard/ai-art"
    `);
    });

test('gpus 1 (https://github.com/magicmark/composerize/issues/550)', () => {
    expect(Composerize('docker run -it --rm --gpus 1 -p 3000:3000 -v /opt/ai-art:/data overshard/ai-art'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            ai-art:
                stdin_open: true
                tty: true
                deploy:
                    resources:
                        reservations:
                            devices:
                                -
                                    driver: nvidia
                                    count: 1
                                    capabilities:
                                        - gpu
                ports:
                    - '3000:3000'
                volumes:
                    - '/opt/ai-art:/data'
                image: overshard/ai-art"
    `);
    });

test('command name (https://github.com/magicmark/composerize/issues/538)', () => {
    expect(
        Composerize(
            'docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:18.0.2 start-dev',
        ),
    ).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            keycloak:
                ports:
                    - '8080:8080'
                environment:
                    - KEYCLOAK_ADMIN=admin
                    - KEYCLOAK_ADMIN_PASSWORD=admin
                image: 'quay.io/keycloak/keycloak:18.0.2'
                command: start-dev"
    `);
});

test('command args (https://github.com/magicmark/composerize/issues/484)', () => {
    expect(
        Composerize(
            'docker run --rm -it -p 50000:50000 -p 8080:8080 --name opcplc mcr.microsoft.com/iotedge/opc-plc:latest --pn=50000 --autoaccept --nospikes --nodips --nopostrend --nonegtrend --nodatavalues --sph --sn=25 --sr=10 --st=uint --fn=5 --fr=1 --ft=uint',
        ),
    ).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            iotedge:
                ports:
                    - '50000:50000'
                    - '8080:8080'
                container_name: opcplc
                image: 'mcr.microsoft.com/iotedge/opc-plc:latest'
                command: '--pn=50000 --autoaccept --nospikes --nodips --nopostrend --nonegtrend --nodatavalues --sph --sn=25 --sr=10 --st=uint --fn=5 --fr=1 --ft=uint'"
    `);
});

test('basic image (https://github.com/magicmark/composerize/issues/542)', () => {
    expect(Composerize('docker run -d ubuntu')).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            ubuntu:
                image: ubuntu"
    `);
});

test('volumes declaration (https://github.com/magicmark/composerize/issues/524)', () => {
    expect(
        Composerize(
            'docker run --restart=unless-stopped -d --name=readymedia1 --net=host -v /my/video/path:/media -v readymediacache:/cache -e VIDEO_DIR1=/media/my_video_files ypopovych/readymedia',
        ),
    ).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            readymedia:
                restart: unless-stopped
                container_name: readymedia1
                network_mode: host
                volumes:
                    - '/my/video/path:/media'
                    - 'readymediacache:/cache'
                environment:
                    - VIDEO_DIR1=/media/my_video_files
                image: ypopovych/readymedia
        volumes:
            readymediacache: {}"
    `);
});

test('tmpfs (https://github.com/magicmark/composerize/issues/536)', () => {
    expect(
        Composerize(
            'docker run -dit -p 8080:5000 --tmpfs /opt/omd/sites/cmk/tmp:uid=1000,gid=1000 -v/omd/sites --name monitoring -v/etc/localtime:/etc/localtime:ro --restart always checkmk/check-mk-raw:2.0.0-latest',
        ),
    ).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            check-mk-raw:
                stdin_open: true
                tty: true
                ports:
                    - '8080:5000'
                tmpfs: '/opt/omd/sites/cmk/tmp:uid=1000,gid=1000'
                volumes:
                    - /omd/sites
                    - '/etc/localtime:/etc/localtime:ro'
                container_name: monitoring
                restart: always
                image: 'checkmk/check-mk-raw:2.0.0-latest'"
    `);
});

test('multiline (https://github.com/magicmark/composerize/issues/120)', () => {
    expect(
        Composerize(
            `docker run -d --name kong \
     --network=kong-net \
     -e "KONG_DATABASE=postgres" \
     -e "KONG_PG_HOST=kong-database" \
     -e "KONG_CASSANDRA_CONTACT_POINTS=kong-database" \
     -e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
     -e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
     -e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
     -e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
     -e "KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl" \
     -p 8000:8000 \
     -p 8443:8443 \
     -p 8001:8001 \
     -p 8444:8444 \
     kong:latest`,
        ),
    ).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            kong:
                container_name: kong
                networks:
                    - kong-net
                environment:
                    - KONG_DATABASE=postgres
                    - KONG_PG_HOST=kong-database
                    - KONG_CASSANDRA_CONTACT_POINTS=kong-database
                    - KONG_PROXY_ACCESS_LOG=/dev/stdout
                    - KONG_ADMIN_ACCESS_LOG=/dev/stdout
                    - KONG_PROXY_ERROR_LOG=/dev/stderr
                    - KONG_ADMIN_ERROR_LOG=/dev/stderr
                    - 'KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl'
                ports:
                    - '8000:8000'
                    - '8443:8443'
                    - '8001:8001'
                    - '8444:8444'
                image: 'kong:latest'
        networks:
            kong-net:
                external:
                    name: kong-net"
    `);
});

test('mount type (https://github.com/magicmark/composerize/issues/412)', () => {
    expect(Composerize('docker run --mount type=bind,source=./logs,target=/usr/src/app/logs nginx'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            nginx:
                volumes:
                    -
                        type: bind
                        source: ./logs
                        target: /usr/src/app/logs
                image: nginx"
    `);
});
test('cgroup (https://github.com/magicmark/composerize/issues/561)', () => {
    expect(Composerize('docker run --cgroup-parent=docker.slice --cgroupns private systemd_test'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            systemd_test:
                cgroup_parent: docker.slice
                cgroup: private
                image: systemd_test"
    `);
});

test('--network-alias --link-local-ip', () => {
    expect(Composerize('docker run --net reseau --network-alias=ubuntu_res --link-local-ip 192.168.0.1 ubuntu'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            ubuntu:
                networks:
                    reseau:
                        aliases:
                            - ubuntu_res
                        link_local_ips:
                            - 192.168.0.1
                image: ubuntu
        networks:
            reseau:
                external:
                    name: reseau"
            `);
});

