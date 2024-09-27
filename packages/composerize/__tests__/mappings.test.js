/* eslint-env jest */

import Composerize from '../src';

test('--read-only', () => {
    const command = 'docker run --read-only -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                read_only: true
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('--privileged', () => {
    const command = 'docker run --privileged -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                privileged: true
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('--user', () => {
    const command = 'docker run --user 99:100 -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                user: 99:100
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('--label', () => {
    const command = 'docker run --label test1=value -l test2=value -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                labels:
                    - test1=value
                    - test2=value
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('--hostname --domainname', () => {
    const command = 'docker run --hostname myHostName --domainname example.org -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                hostname: myHostName
                domainname: example.org
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('-h', () => {
    const command = 'docker run -h myHostName -p 80:80 foobar/baz:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            baz:
                hostname: myHostName
                ports:
                    - 80:80
                image: foobar/baz:latest"
    `);
});

test('--network (https://github.com/magicmark/composerize/issues/25)', () => {
    const command =
        'docker run -d --name plex --network=host -e TZ="<timezone>" -e PLEX_CLAIM="<claimToken>" -v <path/to/plex/database>:/config -v <path/to/transcode/temp>:/transcode -v <path/to/media>:/data plexinc/pms-docker';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            pms-docker:
                container_name: plex
                network_mode: host
                environment:
                    - TZ=<timezone>
                    - PLEX_CLAIM=<claimToken>
                volumes:
                    - <path/to/plex/database>:/config
                    - <path/to/transcode/temp>:/transcode
                    - <path/to/media>:/data
                image: plexinc/pms-docker"
    `);
});

test('--pid ', () => {
    const command = 'docker run -p 80:80 --pid="host" --name webserver nginx:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                ports:
                    - 80:80
                pid: host
                container_name: webserver
                image: nginx:latest"
    `);
});

test('--ulimit (https://github.com/magicmark/composerize/pull/262)', () => {
    expect(Composerize('docker run --ulimit as=1024 nginx:latest')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                ulimits:
                    as: 1024
                image: nginx:latest"
    `);

    expect(Composerize('docker run --ulimit nproc=3 nginx:latest')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                ulimits:
                    nproc: 3
                image: nginx:latest"
    `);

    expect(Composerize('docker run --ulimit nofile=1023:1025 nginx:latest')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                ulimits:
                    nofile:
                        soft: 1023
                        hard: 1025
                image: nginx:latest"
    `);

    // @see https://docs.docker.com/compose/compose-file/#ulimits
    expect(Composerize('docker run --ulimit nproc=65535 --ulimit nofile=20000:40000 nginx:latest'))
        .toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                ulimits:
                    nproc: 65535
                    nofile:
                        soft: 20000
                        hard: 40000
                image: nginx:latest"
    `);
});

test('-it image name (https://github.com/magicmark/composerize/issues/544)', () => {
    expect(Composerize('docker run -p 8000:8000 -it ctfd/ctfd')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ctfd:
                ports:
                    - 8000:8000
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
        "name: <your project name>
        services:
            tailscale:
                container_name: tailscaled
                volumes:
                    - /var/lib:/var/lib
                    - /dev/net/tun:/dev/net/tun
                network_mode: host
                privileged: true
                image: tailscale/tailscale
                command: tailscaled"
    `);
});

test('gpus all (https://github.com/magicmark/composerize/issues/550)', () => {
    expect(Composerize('docker run -it --rm --gpus all -p 3000:3000 -v /opt/ai-art:/data overshard/ai-art'))
        .toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ai-art:
                stdin_open: true
                tty: true
                deploy:
                    resources:
                        reservations:
                            devices:
                                - driver: nvidia
                                  count: all
                                  capabilities:
                                      - gpu
                ports:
                    - 3000:3000
                volumes:
                    - /opt/ai-art:/data
                image: overshard/ai-art"
    `);
});

test('gpus 1 (https://github.com/magicmark/composerize/issues/550)', () => {
    expect(Composerize('docker run -it --rm --gpus 1 -p 3000:3000 -v /opt/ai-art:/data overshard/ai-art'))
        .toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ai-art:
                stdin_open: true
                tty: true
                deploy:
                    resources:
                        reservations:
                            devices:
                                - driver: nvidia
                                  count: 1
                                  capabilities:
                                      - gpu
                ports:
                    - 3000:3000
                volumes:
                    - /opt/ai-art:/data
                image: overshard/ai-art"
    `);
});

test('command name (https://github.com/magicmark/composerize/issues/538)', () => {
    expect(
        Composerize(
            'docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:18.0.2 start-dev',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            keycloak:
                ports:
                    - 8080:8080
                environment:
                    - KEYCLOAK_ADMIN=admin
                    - KEYCLOAK_ADMIN_PASSWORD=admin
                image: quay.io/keycloak/keycloak:18.0.2
                command: start-dev"
    `);
});

test('command args (https://github.com/magicmark/composerize/issues/484)', () => {
    expect(
        Composerize(
            'docker run --rm -it -p 50000:50000 -p 8080:8080 --name opcplc mcr.microsoft.com/iotedge/opc-plc:latest --pn=50000 --autoaccept --nospikes --nodips --nopostrend --nonegtrend --nodatavalues --sph --sn=25 --sr=10 --st=uint --fn=5 --fr=1 --ft=uint',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            opc-plc:
                stdin_open: true
                tty: true
                ports:
                    - 50000:50000
                    - 8080:8080
                container_name: opcplc
                image: mcr.microsoft.com/iotedge/opc-plc:latest
                command: --pn=50000 --autoaccept --nospikes --nodips --nopostrend --nonegtrend
                    --nodatavalues --sph --sn=25 --sr=10 --st=uint --fn=5 --fr=1
                    --ft=uint"
    `);
});

test('basic image (https://github.com/magicmark/composerize/issues/542)', () => {
    expect(Composerize('docker run -d ubuntu')).toMatchInlineSnapshot(`
        "name: <your project name>
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
"name: <your project name>
services:
    readymedia:
        restart: unless-stopped
        container_name: readymedia1
        network_mode: host
        volumes:
            - /my/video/path:/media
            - readymediacache:/cache
        environment:
            - VIDEO_DIR1=/media/my_video_files
        image: ypopovych/readymedia
volumes:
    readymediacache:
        external: true
        name: readymediacache"
`);
});

test('tmpfs (https://github.com/magicmark/composerize/issues/536)', () => {
    expect(
        Composerize(
            'docker run -dit -p 8080:5000 --tmpfs /opt/omd/sites/cmk/tmp:uid=1000,gid=1000 -v/omd/sites --name monitoring -v/etc/localtime:/etc/localtime:ro --restart always checkmk/check-mk-raw:2.0.0-latest',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            check-mk-raw:
                stdin_open: true
                tty: true
                ports:
                    - 8080:5000
                tmpfs: /opt/omd/sites/cmk/tmp:uid=1000,gid=1000
                volumes:
                    - /omd/sites
                    - /etc/localtime:/etc/localtime:ro
                container_name: monitoring
                restart: always
                image: checkmk/check-mk-raw:2.0.0-latest"
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
"name: <your project name>
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
            - KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl
        ports:
            - 8000:8000
            - 8443:8443
            - 8001:8001
            - 8444:8444
        image: kong:latest
networks:
    kong-net:
        external: true
        name: kong-net"
`);
});

test('mount type (https://github.com/magicmark/composerize/issues/412)', () => {
    expect(Composerize('docker run --mount type=bind,source=./logs,target=/usr/src/app/logs nginx'))
        .toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                volumes:
                    - type: bind
                      source: ./logs
                      target: /usr/src/app/logs
                image: nginx"
    `);
});

test('mount type multi (https://github.com/magicmark/composerize/issues/412)', () => {
    expect(
        Composerize(
            'docker run --mount type=bind,source=./logs,target=/usr/src/app/logs --mount type=bind,source=./data,target=/usr/src/app/data nginx',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                volumes:
                    - type: bind
                      source: ./logs
                      target: /usr/src/app/logs
                    - type: bind
                      source: ./data
                      target: /usr/src/app/data
                image: nginx"
    `);
});

test('cgroup (https://github.com/magicmark/composerize/issues/561)', () => {
    expect(Composerize('docker run --cgroup-parent=docker.slice --cgroupns private systemd_test'))
        .toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            systemd_test:
                cgroup_parent: docker.slice
                cgroup: private
                image: systemd_test"
    `);
});

test('cpu/share, ip (https://github.com/magicmark/composerize/issues/545 and https://github.com/magicmark/composerize/issues/582)', () => {
    expect(
        Composerize(
            'docker run -d --restart always -p 5432:5432 --net postgres_net --ip 172.18.0.100 --name postgres2 --cpus=3 --cpu-shares=512 --log-driver json-file --log-opt max-size=100m --log-opt max-file=10 -v /srv/postgres:/var/lib/postgresql/data postgis/postgis',
        ),
    ).toMatchInlineSnapshot(`
"name: <your project name>
services:
    postgis:
        restart: always
        ports:
            - 5432:5432
        networks:
            postgres_net:
                ipv4_address: 172.18.0.100
        container_name: postgres2
        deploy:
            resources:
                limits:
                    cpus: 3
        cpu_shares: 512
        logging:
            driver: json-file
            options:
                max-size: 100m
                max-file: 10
        volumes:
            - /srv/postgres:/var/lib/postgresql/data
        image: postgis/postgis
networks:
    postgres_net:
        external: true
        name: postgres_net"
`);
});

test('fake multiline (https://github.com/magicmark/composerize/issues/546)', () => {
    expect(Composerize('docker run -d  -v vol:/tmp  hello-world  --parameter')).toMatchInlineSnapshot(`
"name: <your project name>
services:
    hello-world:
        volumes:
            - vol:/tmp
        image: hello-world
        command: --parameter
volumes:
    vol:
        external: true
        name: vol"
`);
});

test('port no space (https://github.com/magicmark/composerize/issues/113)', () => {
    expect(
        Composerize(
            'docker run      --name testneo4j      -p7474:7474 -p7687:7687      -d      -v $HOME/neo4j/data:/data      -v $HOME/neo4j/logs:/logs      -v $HOME/neo4j/import:/var/lib/neo4j/import      -v $HOME/neo4j/plugins:/plugins      --env NEO4J_AUTH=neo4j/test      neo4j:latest',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            neo4j:
                container_name: testneo4j
                ports:
                    - 7474:7474
                    - 7687:7687
                volumes:
                    - $HOME/neo4j/data:/data
                    - $HOME/neo4j/logs:/logs
                    - $HOME/neo4j/import:/var/lib/neo4j/import
                    - $HOME/neo4j/plugins:/plugins
                environment:
                    - NEO4J_AUTH=neo4j/test
                image: neo4j:latest"
    `);
});

test('ip, mac, hostname, network (https://github.com/magicmark/composerize/issues/359)', () => {
    expect(
        Composerize(
            'docker run -d --name test --restart=always --net=homenet --ip=192.168.1.9 --ip6=xxxxx --mac-address=00:00:00:00:00:09 --hostname myhost -v /import/settings:/settings -v /import/media:/media -p 8080:8080 -e UID=1000 -e GID=1000 repo/image',
        ),
    ).toMatchInlineSnapshot(`
"name: <your project name>
services:
    image:
        container_name: test
        restart: always
        networks:
            homenet:
                ipv4_address: 192.168.1.9
                ipv6_address: xxxxx
        mac_address: 00:00:00:00:00:09
        hostname: myhost
        volumes:
            - /import/settings:/settings
            - /import/media:/media
        ports:
            - 8080:8080
        environment:
            - UID=1000
            - GID=1000
        image: repo/image
networks:
    homenet:
        external: true
        name: homenet"
`);
});

test('-w working_dir', () => {
    expect(
        Composerize(
            'docker run -ti --rm -v ~/.ivy2:/root/.ivy2 -v ~/.sbt:/root/.sbt -v $PWD:/app -w /app mozilla/sbt sbt shell',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            sbt:
                tty: true
                stdin_open: true
                volumes:
                    - ~/.ivy2:/root/.ivy2
                    - ~/.sbt:/root/.sbt
                    - $PWD:/app
                working_dir: /app
                image: mozilla/sbt
                command: sbt shell"
    `);
});

test('private registry (https://github.com/magicmark/composerize/issues/15)', () => {
    expect(
        Composerize(
            'docker run --restart=always --privileged --name jatdb -d -p 27017:27017 -p 28017:28017 -e MONGODB_PASS="somepass" -v ~/jat/mongodata:/data/db registry.cloud.local/js/mongo',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            mongo:
                restart: always
                privileged: true
                container_name: jatdb
                ports:
                    - 27017:27017
                    - 28017:28017
                environment:
                    - MONGODB_PASS=somepass
                volumes:
                    - ~/jat/mongodata:/data/db
                image: registry.cloud.local/js/mongo"
    `);
});

test('cap_add, cap_drop, pid, net, prviledged, device (https://github.com/magicmark/composerize/issues/30)', () => {
    expect(
        Composerize(
            'docker run -d --name storageos -e HOSTNAME  -e ADVERTISE_IP=xxx.xxx.xxx.xxx  -e JOIN=xxxxxxxxxxxxxxxxx  --net=host  --pid=host  --privileged  --cap-add SYS_ADMIN --cap-drop XXX --device /dev/fuse  -v /var/lib/storageos:/var/lib/storageos:rshared  -v /run/docker/plugins:/run/docker/plugins  storageos/node:0.10.0 server',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
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
                    - /var/lib/storageos:/var/lib/storageos:rshared
                    - /run/docker/plugins:/run/docker/plugins
                image: storageos/node:0.10.0
                command: server"
    `);
});

test('publish-all (https://github.com/magicmark/composerize/issues/19)', () => {
    expect(Composerize('docker run -d -P -v /var/log:/log mthenw/frontail /log/syslog')).toMatchInlineSnapshot(`
        "# ignored options for 'frontail'
        # -P
        name: <your project name>
        services:
            frontail:
                volumes:
                    - /var/log:/log
                image: mthenw/frontail
                command: /log/syslog"
    `);
});

test('storage-opt multi', () => {
    expect(Composerize('docker run --storage-opt size=120G --storage-opt dummy=xxx fedora')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            fedora:
                storage_opt:
                    size: 120G
                    dummy: xxx
                image: fedora"
    `);
});

test('storage-opt simple', () => {
    expect(Composerize('docker run --storage-opt size=120G fedora')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            fedora:
                storage_opt:
                    size: 120G
                image: fedora"
    `);
});

test('--sysctl', () => {
    expect(Composerize('docker run --sysctl net.core.somaxconn=1024 --sysctl net.ipv4.tw_reuse=1 someimage'))
        .toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            someimage:
                sysctls:
                    - net.core.somaxconn=1024
                    - net.ipv4.tw_reuse=1
                image: someimage"
    `);
});

test('dns, link, add host', () => {
    expect(
        Composerize(
            'docker run --dns 8.8.8.8 --dns 127.0.0.1 --dns-search domain.com --dns-opt attempts:10 --link other_container --add-host=2.example2.com:10.0.0.2 --add-host=3.example.com:10.0.0.3 my/container',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            container:
                dns:
                    - 8.8.8.8
                    - 127.0.0.1
                dns_search:
                    - domain.com
                dns_opt:
                    - attempts:10
                links:
                    - other_container
                extra_hosts:
                    - 2.example2.com:10.0.0.2
                    - 3.example.com:10.0.0.3
                image: my/container"
    `);
});

test('--env-file', () => {
    expect(Composerize('docker run --env-file ./env.list ubuntu bash')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                env_file:
                    - ./env.list
                image: ubuntu
                command: bash"
    `);
});

test('--expose ', () => {
    expect(Composerize('docker run --expose 1500-1505 --expose=80 ubuntu')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                expose:
                    - 1500-1505
                    - 80
                image: ubuntu"
    `);
});

test('--ipc --init --userns --uts -u --group-add --oom-kill-disable --oom-score-adj --stop-signal --stop-timeout', () => {
    expect(
        Composerize(
            'docker run --ipc shareable --init --userns host --uts uuu -u user1 --group-add groupX --oom-kill-disable --oom-score-adj xxx --stop-signal SIG_TERM --stop-timeout 2s ubuntu',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                ipc: shareable
                init: true
                userns_mode: host
                uts: uuu
                user: user1
                group_add:
                    - groupX
                oom_kill_disable: true
                oom_score_adj: xxx
                stop_signal: SIG_TERM
                stop_grace_period: 2s
                image: ubuntu"
    `);
});

test('--label', () => {
    expect(Composerize('docker run -l my-label --label com.example.foo=bar ubuntu bash')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                labels:
                    - my-label
                    - com.example.foo=bar
                image: ubuntu
                command: bash"
    `);
});

test('deploy limits', () => {
    expect(
        Composerize(
            'docker run --cpus 1.5 --pids-limit 1500 --shm-size 15G --memory 15G --memory-reservation 12G --memory-swap yyy --memory-swappiness zzz --cpu-period xxx --cpu-quota xxx --cpu-rt-period xxx --cpu-rt-runtime xxx --volumes-from other2 ubuntu',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                deploy:
                    resources:
                        limits:
                            cpus: 1.5
                            pids: 1500
                            memory: 15G
                        reservations:
                            memory: 12G
                shm_size: 15G
                memswap_limit: yyy
                mem_swappiness: zzz
                cpu_period: xxx
                cpu_quota: xxx
                cpu_rt_period: xxx
                cpu_rt_runtime: xxx
                volume_from:
                    - other2
                image: ubuntu"
    `);
});

test('--pull --runtime --platform --isolation', () => {
    expect(Composerize('docker run --pull always --runtime xxx --platform linux --isolation yyy ubuntu'))
        .toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                pull_policy: always
                runtime: xxx
                platform: linux
                isolation: yyy
                image: ubuntu"
    `);
});

test('--network-alias --link-local-ip', () => {
    expect(Composerize('docker run --net reseau --network-alias=ubuntu_res --link-local-ip 192.168.0.1 ubuntu'))
        .toMatchInlineSnapshot(`
"name: <your project name>
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
        external: true
        name: reseau"
`);
});

test('--entrypoint', () => {
    expect(Composerize('docker run --entrypoint /bin/bash --no-healthcheck ubuntu')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                entrypoint:
                    - /bin/bash
                healthcheck:
                    disable: true
                image: ubuntu"
    `);
});

test('--security-opt', () => {
    expect(Composerize('docker run --security-opt label:level:s0:c100,c200 -i -t fedora bash')).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            fedora:
                security_opt:
                    - label:level:s0:c100,c200
                stdin_open: true
                tty: true
                image: fedora
                command: bash"
    `);
});

test('blkio 1 device', () => {
    expect(
        Composerize(
            'docker run -it --blkio-weight 16 --blkio-weight-device "/dev/sda:200" --device-read-bps=/dev/sda:1mb --device-read-iops=/dev/sda:1000 --device-write-bps=/dev/sda:1mb --device-write-iops=/dev/sda:1000 ubuntu',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                stdin_open: true
                tty: true
                blkio_config:
                    weight: 16
                    weight_device:
                        - path: /dev/sda
                          weight: 200
                    device_read_bps:
                        - path: /dev/sda
                          rate: 1mb
                    device_read_iops:
                        - path: /dev/sda
                          rate: 1000
                    device_write_bps:
                        - path: /dev/sda
                          rate: 1mb
                    device_write_iops:
                        - path: /dev/sda
                          rate: 1000
                image: ubuntu"
    `);
});

test('blkio 2 device', () => {
    expect(
        Composerize(
            'docker run -it --blkio-weight 16 --blkio-weight-device "/dev/sda:200"  --blkio-weight-device "/dev/sdb:300" --device-read-bps=/dev/sda:1mb --device-read-bps=/dev/sdb:2mb --device-read-iops=/dev/sda:1000 --device-write-bps=/dev/sda:1mb --device-write-iops=/dev/sda:1000 ubuntu',
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                stdin_open: true
                tty: true
                blkio_config:
                    weight: 16
                    weight_device:
                        - path: /dev/sda
                          weight: 200
                        - path: /dev/sdb
                          weight: 300
                    device_read_bps:
                        - path: /dev/sda
                          rate: 1mb
                        - path: /dev/sdb
                          rate: 2mb
                    device_read_iops:
                        - path: /dev/sda
                          rate: 1000
                    device_write_bps:
                        - path: /dev/sda
                          rate: 1mb
                    device_write_iops:
                        - path: /dev/sda
                          rate: 1000
                image: ubuntu"
    `);
});

test('--device-cgroup-rule', () => {
    expect(Composerize('docker run -d --device-cgroup-rule="c 42:* rmw" --name my-container my-image'))
        .toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            my-image:
                device_cgroup_rules:
                    - c 42:* rmw
                container_name: my-container
                image: my-image"
    `);
});

test('--healthcheck-cmd ', () => {
    const command =
        'docker run --health-cmd=healthcheck.sh --health-interval=60s --health-timeout=10s --health-start-period=30s --health-retries=2  nginx:latest';

    expect(Composerize(command)).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            nginx:
                healthcheck:
                    test: healthcheck.sh
                    interval: 60s
                    timeout: 10s
                    start_period: 30s
                    retries: \\"2\\"
                image: nginx:latest"
    `);
});

test('--net and --log-driver bug (https://github.com/magicmark/composerize/issues/582)', () => {
    const command =
        'docker run -td --rm -p 80:80 --net=my_network --log-driver=journald --stop-signal=SIGRTMIN+3 --name my_container my_image';

    expect(Composerize(command)).toMatchInlineSnapshot(`
"name: <your project name>
services:
    my_image:
        tty: true
        ports:
            - 80:80
        networks:
            - my_network
        logging:
            driver: journald
        stop_signal: SIGRTMIN+3
        container_name: my_container
        image: my_image
networks:
    my_network:
        external: true
        name: my_network"
`);
});

test('env var with "=" (case 1) (#638)', () => {
    const command =
        'docker run -p 8080:8080 -p 50000:50000 --restart=on-failure -e JAVA_OPTS="-Dfile.encoding=utf-8 -Dsun.jnu.encoding-utf-8" jenkins/jenkins:lts-jdk17';

    expect(Composerize(command)).toMatchInlineSnapshot(`
"name: <your project name>
services:
    jenkins:
        ports:
            - 8080:8080
            - 50000:50000
        restart: on-failure
        environment:
            - JAVA_OPTS=-Dfile.encoding=utf-8 -Dsun.jnu.encoding-utf-8
        image: jenkins/jenkins:lts-jdk17"
`);
});

test('env var with "=" (case 2) (#638)', () => {
    const command =
        'docker run -p 8080:8080 -p 50000:50000 --restart=on-failure -e=JAVA_OPTS="-Dfile.encoding=utf-8 -Dsun.jnu.encoding-utf-8" jenkins/jenkins:lts-jdk17';

    expect(Composerize(command)).toMatchInlineSnapshot(`
"name: <your project name>
services:
    jenkins:
        ports:
            - 8080:8080
            - 50000:50000
        restart: on-failure
        environment:
            - JAVA_OPTS=-Dfile.encoding=utf-8 -Dsun.jnu.encoding-utf-8
        image: jenkins/jenkins:lts-jdk17"
`);
});

test('--ip (case 1), order of command options should not give different results (#637)', () => {
    const command =
        'docker run -d --name host --ip 192.168.6.120 -p 81:82 --network ipvlan -v /docker/hosted:/data --hostname host container_name --restart=always';

    expect(Composerize(command)).toMatchInlineSnapshot(`
"name: <your project name>
services:
    container_name:
        container_name: host
        networks:
            ipvlan:
                ipv4_address: 192.168.6.120
        ports:
            - 81:82
        volumes:
            - /docker/hosted:/data
        hostname: host
        image: container_name
        command: --restart=always
networks:
    ipvlan:
        external: true
        name: ipvlan"
`);
});

test('--ip (case 2), order of command options should not give different results (#637)', () => {
    const command =
        'docker run -d --name host -p 81:82 --network ipvlan --ip 192.168.6.120 -v /docker/hosted:/data --hostname host container_name --restart=always';

    expect(Composerize(command)).toMatchInlineSnapshot(`
"name: <your project name>
services:
    container_name:
        container_name: host
        ports:
            - 81:82
        networks:
            ipvlan:
                ipv4_address: 192.168.6.120
        volumes:
            - /docker/hosted:/data
        hostname: host
        image: container_name
        command: --restart=always
networks:
    ipvlan:
        external: true
        name: ipvlan"
`);
});

test('env var with ending "==" (case 1) (#639)', () => {
    const command = `docker rm -f dokemon-agent > /dev/null 2>&1
        docker run
        -e SERVER_URL=http://192.168.1.12:9090
        -e TOKEN=dQufdsfdfsfsadfsadfsdfafasdf2FDuAw==
        -v /var/run/docker.sock:/var/run/docker.sock
        --name dokemon-agent --restart unless-stopped
        -d productiveops/dokemon-agent:latest`;

    expect(Composerize(command)).toMatchInlineSnapshot(`
"# ignored : docker rm -f dokemon-agent > /dev/null 2>&1

name: <your project name>
services:
    dokemon-agent:
        environment:
            - SERVER_URL=http://192.168.1.12:9090
            - TOKEN=dQufdsfdfsfsadfsadfsdfafasdf2FDuAw==
        volumes:
            - /var/run/docker.sock:/var/run/docker.sock
        container_name: dokemon-agent
        restart: unless-stopped
        image: productiveops/dokemon-agent:latest"
`);
});

test('env var with ending "==" (case 2) (#639)', () => {
    const command = `docker rm -f dokemon-agent > /dev/null 2>&1
        docker run
        -e=SERVER_URL=http://192.168.1.12:9090
        -e=TOKEN=dQufdsfdfsfsadfsadfsdfafasdf2FDuAw==
        -v=/var/run/docker.sock:/var/run/docker.sock
        --name dokemon-agent --restart unless-stopped
        -d productiveops/dokemon-agent:latest`;

    expect(Composerize(command)).toMatchInlineSnapshot(`
"# ignored : docker rm -f dokemon-agent > /dev/null 2>&1

name: <your project name>
services:
    dokemon-agent:
        environment:
            - SERVER_URL=http://192.168.1.12:9090
            - TOKEN=dQufdsfdfsfsadfsadfsdfafasdf2FDuAw==
        volumes:
            - /var/run/docker.sock:/var/run/docker.sock
        container_name: dokemon-agent
        restart: unless-stopped
        image: productiveops/dokemon-agent:latest"
`);
});

test('remove port when --network host (https://github.com/composerize/composerize/issues/677)', () => {
    expect(
        Composerize(
            `
docker run --network host --name adguardhome\
    --restart unless-stopped\
    -v /my/own/workdir:/opt/adguardhome/work\
    -v /my/own/confdir:/opt/adguardhome/conf\
    -p 53:53/tcp -p 53:53/udp\
    -p 67:67/udp -p 68:68/udp\
    -p 80:80/tcp -p 443:443/tcp -p 443:443/udp -p 3000:3000/tcp\
    -p 853:853/tcp\
    -p 784:784/udp -p 853:853/udp -p 8853:8853/udp\
    -p 5443:5443/tcp -p 5443:5443/udp\
    -d adguard/adguardhome
`,
        ),
    ).toMatchInlineSnapshot(`
"name: <your project name>
services:
    adguardhome:
        network_mode: host
        container_name: adguardhome
        restart: unless-stopped
        volumes:
            - /my/own/workdir:/opt/adguardhome/work
            - /my/own/confdir:/opt/adguardhome/conf
        image: adguard/adguardhome"
`);
});
