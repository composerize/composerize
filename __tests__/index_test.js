import Composerize from "../src";
import { maybeGetComposeEntry, getComposeJson } from "../src/logic";

describe("maybeGetComposeEntry", () => {
  it("works", () => {
    // test '--device foo'
    expect(maybeGetComposeEntry(["--device", "foo"], 0)).toMatchObject({
      path: "devices",
      value: ["foo"]
    });
  });
});

describe("getComposeJson", () => {
  it("works", () => {
    expect(
      getComposeJson({
        path: "devices",
        value: ["foo"]
      })
    ).toMatchObject({
      devices: ["foo"]
    });
  });
});

describe("snapshots", () => {
  const CMDS = [
    "docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx",

    // test spacing
    " docker   run -p 80:80  -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx    ",

    // test multiple args (https://github.com/magicmark/composerize/issues/9)
    'docker run -t --name="youtrack" -v /data/youtrack/data/:/opt/youtrack/data/ -v /data/youtrack/backup/:/opt/youtrack/backup/ -p 80:80 -p 3232:22351 uniplug/youtrack'
  ];

  it("match snapshots", () => {
    CMDS.forEach(cmd => {
      expect(Composerize(cmd)).toMatchSnapshot();
    });
  });
});
