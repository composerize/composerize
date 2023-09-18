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

test('--hostname --domainname', () => {
    const command = 'docker run --hostname myHostName --domainname example.org -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
            "version: '3.3'
            services:
                baz:
                    hostname: myHostName
                    domainname: example.org
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
            opc-plc:
                stdin_open: true
                tty: true
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

test('mount type multi (https://github.com/magicmark/composerize/issues/412)', () => {
    expect(Composerize('docker run --mount type=bind,source=./logs,target=/usr/src/app/logs --mount type=bind,source=./data,target=/usr/src/app/data nginx'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            nginx:
                volumes:
                    -
                        type: bind
                        source: ./logs
                        target: /usr/src/app/logs
                    -
                        type: bind
                        source: ./data
                        target: /usr/src/app/data
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

test('fake multiline (https://github.com/magicmark/composerize/issues/546)', () => {
    expect(Composerize('docker run -d \ -v vol:/tmp \ hello-world \ --parameter'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            hello-world:
                volumes:
                    - 'vol:/tmp'
                image: hello-world
                command: '--parameter'
        volumes:
            vol: {}"
    `);
});
    
test('port no space (https://github.com/magicmark/composerize/issues/113)', () => {
    expect(Composerize('docker run \     --name testneo4j \     -p7474:7474 -p7687:7687 \     -d \     -v $HOME/neo4j/data:/data \     -v $HOME/neo4j/logs:/logs \     -v $HOME/neo4j/import:/var/lib/neo4j/import \     -v $HOME/neo4j/plugins:/plugins \     --env NEO4J_AUTH=neo4j/test \     neo4j:latest'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            neo4j:
                container_name: testneo4j
                ports:
                    - '7474:7474'
                    - '7687:7687'
                volumes:
                    - '$HOME/neo4j/data:/data'
                    - '$HOME/neo4j/logs:/logs'
                    - '$HOME/neo4j/import:/var/lib/neo4j/import'
                    - '$HOME/neo4j/plugins:/plugins'
                environment:
                    - NEO4J_AUTH=neo4j/test
                image: 'neo4j:latest'"
    `);
});

test('-w working_dir', () => {
    expect(Composerize('docker run -ti --rm -v ~/.ivy2:/root/.ivy2 -v ~/.sbt:/root/.sbt -v $PWD:/app -w /app mozilla/sbt sbt shell'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            sbt:
                tty: true
                stdin_open: true
                volumes:
                    - '~/.ivy2:/root/.ivy2'
                    - '~/.sbt:/root/.sbt'
                    - '$PWD:/app'
                working_dir: /app
                image: mozilla/sbt
                command: 'sbt shell'"
    `);
});

test('private registry (https://github.com/magicmark/composerize/issues/15)', () => {
    expect(Composerize('docker run --restart=always --privileged --name jatdb -d -p 27017:27017 -p 28017:28017 -e MONGODB_PASS="somepass" -v ~/jat/mongodata:/data/db registry.cloud.local/js/mongo'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            mongo:
                restart: always
                privileged: true
                container_name: jatdb
                ports:
                    - '27017:27017'
                    - '28017:28017'
                environment:
                    - MONGODB_PASS=somepass
                volumes:
                    - '~/jat/mongodata:/data/db'
                image: registry.cloud.local/js/mongo"
    `);
});

test('cap_add, cap_drop, pid, net, prviledged, device (https://github.com/magicmark/composerize/issues/30)', () => {
    expect(Composerize('docker run -d --name storageos -e HOSTNAME  -e ADVERTISE_IP=xxx.xxx.xxx.xxx  -e JOIN=xxxxxxxxxxxxxxxxx  --net=host  --pid=host  --privileged  --cap-add SYS_ADMIN --cap-drop XXX --device /dev/fuse  -v /var/lib/storageos:/var/lib/storageos:rshared  -v /run/docker/plugins:/run/docker/plugins  storageos/node:0.10.0 server'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            node:
                container_name: storageos
                environment:
                    - HOSTNAME
                    - ADVERTISE_IP=xxx.xxx.xxx.xxx
                    - JOIN=xxxxxxxxxxxxxxxxx
                network_mode: host
                pid: host
                privileged: true
                cap_add:
                    - SYS_ADMIN
                cap_drop:
                    - XXX
                devices:
                    - /dev/fuse
                volumes:
                    - '/var/lib/storageos:/var/lib/storageos:rshared'
                    - '/run/docker/plugins:/run/docker/plugins'
                image: 'storageos/node:0.10.0'
                command: server"
    `);
});

test('publish-all (https://github.com/magicmark/composerize/issues/19)', () => {
    expect(Composerize('docker run -d -P -v /var/log:/log mthenw/frontail /log/syslog'))
        .toMatchInlineSnapshot(`
        "# ignored options for 'frontail'
        # -P
        version: '3.3'
        services:
            frontail:
                volumes:
                    - '/var/log:/log'
                image: mthenw/frontail
                command: /log/syslog"
            `);
});

test('--sysctl', () => {
    expect(Composerize('docker run --sysctl net.core.somaxconn=1024 --sysctl net.ipv4.tw_reuse=1 someimage'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            someimage:
                sysctls:
                    - net.core.somaxconn=1024
                    - net.ipv4.tw_reuse=1
                image: someimage"
            `);
});

test('--expose ', () => {
    expect(Composerize('docker run --expose 1500-1505 --expose=80 ubuntu'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            ubuntu:
                expose:
                    - 1500-1505
                    - 80
                image: ubuntu"
            `);
});

test('--label', () => {
    expect(Composerize('docker run -l my-label --label com.example.foo=bar ubuntu bash'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            ubuntu:
                labels:
                    - my-label
                    - com.example.foo=bar
                image: ubuntu
                command: bash"
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

test('--entrypoint', () => {
    expect(Composerize('docker run --entrypoint /bin/bash --no-healthcheck ubuntu'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            ubuntu:
                entrypoint:
                    - /bin/bash
                healthcheck:
                    disable: true
                image: ubuntu"
            `);
});

test('--device-cgroup-rule', () => {
    expect(Composerize('docker run -d --device-cgroup-rule="c 42:* rmw" --name my-container my-image'))
        .toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            my-image:
                device_cgroup_rules:
                    - 'c 42:* rmw'
                container_name: my-container
                image: my-image"
            `);
});

test('--healthcheck-cmd ', () => {
    const command =
        'docker run --health-cmd=healthcheck.sh --health-interval=60s --health-timeout=10s --health-start-period=30s --health-retries=2  nginx:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "version: '3.3'
        services:
            nginx:
                healthcheck:
                    test: healthcheck.sh
                    interval: 60s
                    timeout: 10s
                    start_period: 30s
                    retries: '2'
                image: 'nginx:latest'"
      `);
});