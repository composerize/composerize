/* eslint-env jest */

import Composerize from '../src';
import { composerizeCli } from '../cli-merge';

const existingNginxCompose = ['services:', '  nginx:', '    ports:', '      - 80:80', '    image: nginx:1'].join('\n');

function merge(command, existingDockerCompose, resolveConflicts) {
    return composerizeCli({
        command,
        composerize: Composerize,
        composeVersion: 'latest',
        existingDockerCompose,
        indent: 2,
        resolveConflicts,
    });
}

test('CLI merge deduplicates exact list values', async () => {
    await expect(merge('docker run -p 80:80 nginx:1', existingNginxCompose)).resolves.toMatchInlineSnapshot(`
        "name: <your project name>
        services:
          nginx:
            ports:
              - 80:80
            image: nginx:1"
    `);
});

test('CLI merge can keep both sides of list conflicts', async () => {
    await expect(
        merge('docker run -p 81:80 nginx:2', existingNginxCompose, async () => ({
            'services.nginx.ports': 'both',
            'services.nginx.image': 'old',
        })),
    ).resolves.toMatchInlineSnapshot(`
        "name: <your project name>
        services:
          nginx:
            ports:
              - 80:80
              - 81:80
            image: nginx:1"
    `);
});

test('CLI merge can use generated values for conflicts', async () => {
    await expect(
        merge('docker run -p 81:80 nginx:2', existingNginxCompose, async () => ({
            'services.nginx.ports': 'new',
            'services.nginx.image': 'new',
        })),
    ).resolves.toMatchInlineSnapshot(`
        "name: <your project name>
        services:
          nginx:
            ports:
              - 81:80
            image: nginx:2"
    `);
});
