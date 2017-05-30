import { maybeGetComposeEntry, getComposeJson } from '../src/index';

describe('maybeGetComposeEntry', () => {
  it('works', () => {
    // test '--device foo'
    expect(maybeGetComposeEntry(['--device', 'foo'], 0)).toMatchObject({
      path: 'devices',
      value: ['foo'],
    });
  });
});

describe('getComposeJson', () => {
  it('works', () => {
    expect(
      getComposeJson({
        path: 'devices',
        value: ['foo'],
      }),
    ).toMatchObject({
      devices: ['foo'],
    });
  });
});
