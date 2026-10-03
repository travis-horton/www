/**
 * @jest-environment node
 */
/*
 * What the build and the deploys are allowed to pull in, and with what power.
 *
 * These read the Dockerfile, the proxy's compose file and the workflow files as
 * TEXT (no YAML parser) and fail when one of five habits slips back in:
 *
 *   1. a base image named by a floating tag (`FROM node:latest`): the same
 *      Dockerfile then builds a different site next month, with nothing in the
 *      repo's history to say when or why;
 *   2. the same for the two images of the proxy in front of the site
 *      (reverse-proxy/docker-compose.yml): named bare, a server keeps whatever
 *      was newest on the day it was last pulled, and nothing says which;
 *   3. an action named by a tag (`uses: some/action@v4`): a tag can be moved to
 *      different code after the fact, a full commit cannot, and the deploy jobs
 *      hand these actions the SSH key to the servers;
 *   4. a workflow with no `permissions:` block: it then gets the repository's
 *      default token, which here can WRITE;
 *   5. production deploying with the key the sandbox also uses.
 *
 * history.yml is left out BY NAME. It is an installed copy of a file whose
 * master lives outside this repository (its own header says an edit here is
 * overwritten), so a pin made here would not last; fix it in the master.
 */
import fs from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const WORKFLOW_DIR = path.join(REPO, '.github', 'workflows');
const NOT_OURS = ['history.yml'];
const DEPLOYS = ['deploy-to-dev.yml', 'deploy-to-prod.yml'];
const OURS = ['checks.yml', ...DEPLOYS];

const linesOf = (...parts) =>
  fs.readFileSync(path.join(REPO, ...parts), 'utf8').split('\n');
const workflow = (name) => linesOf('.github', 'workflows', name);

describe('the Dockerfile', () => {
  const froms = linesOf('Dockerfile')
    .map((line) => /^\s*FROM\s+(?:--platform=\S+\s+)?(\S+)/i.exec(line))
    .filter(Boolean)
    .map((match) => match[1]);

  test('every base image names an explicit version, never `latest`', () => {
    // Both stages are there to be checked (an empty list cannot pass).
    expect(froms).toHaveLength(2);
    const floating = froms.filter((image) => {
      const tag = /^[^:@]+:([^:@]+)(@sha256:[0-9a-f]{64})?$/.exec(image);
      return !tag || tag[1] === 'latest';
    });
    expect(floating).toEqual([]);
  });

  test('the checks run on the same Node major the image is built with', () => {
    const image = froms.find((name) => name.startsWith('node:')) || '';
    const imageMajor = (/^node:(\d+)/.exec(image) || [])[1];
    const checksMajor = workflow('checks.yml')
      .map((line) => /^\s*node-version:\s*'?(\d+)/.exec(line))
      .filter(Boolean)
      .map((match) => match[1]);
    expect(imageMajor).toBeDefined();
    expect(checksMajor).toEqual([imageMajor]);
  });
});

describe("the proxy's compose file", () => {
  // No workflow deploys reverse-proxy/docker-compose.yml: it is the written
  // record of what the two proxy containers on each server should be.
  const images = linesOf('reverse-proxy', 'docker-compose.yml')
    .map((line) => /^\s*image:\s*["']?([^"'\s#]*)["']?\s*(#.*)?$/.exec(line))
    .filter(Boolean)
    .map((match) => match[1]);

  test('both proxy images name a numbered release, never bare or `latest`', () => {
    // The proxy and its certificate companion (an empty list cannot pass).
    expect(images).toHaveLength(2);
    const floating = images.filter(
      (image) =>
        !/^[^:@\s]+:\d+\.\d+\.\d+(-[a-z0-9.]+)?(@sha256:[0-9a-f]{64})?$/.test(
          image,
        ),
    );
    expect(floating).toEqual([]);
  });
});

describe('the workflows', () => {
  const files = fs
    .readdirSync(WORKFLOW_DIR)
    .filter((name) => /\.ya?ml$/.test(name) && !NOT_OURS.includes(name))
    .sort();

  test('the files being checked are the ones we think they are', () => {
    expect(files).toEqual(expect.arrayContaining(OURS));
  });

  test('every action is pinned to a full commit, with its release in a comment', () => {
    const PINNED = /^[\w.-]+\/[\w.-]+(\/[\w./-]+)?@[0-9a-f]{40}\s+#\s*v\d\S*$/;
    const loose = [];
    const counted = {};
    files.forEach((name) => {
      workflow(name).forEach((line, index) => {
        const match = /^\s*(?:-\s+)?uses:\s*(.+?)\s*$/.exec(line);
        if (!match) return;
        counted[name] = (counted[name] || 0) + 1;
        const ref = match[1];
        if (ref.startsWith('./')) return;
        if (!PINNED.test(ref)) loose.push(`${name}:${index + 1}  ${ref}`);
      });
    });
    // Each of our three workflows uses at least one action, so the scan saw them.
    OURS.forEach((name) => expect(counted[name]).toBeGreaterThan(0));
    expect(loose).toEqual([]);
  });

  test.each(OURS)('%s starts from a read-only token', (name) => {
    const lines = workflow(name);
    const start = lines.findIndex((line) => /^permissions:\s*$/.test(line));
    // A top-level block, written out (not `permissions: write-all`).
    expect(start).toBeGreaterThan(-1);
    const granted = [];
    for (let i = start + 1; i < lines.length; i += 1) {
      const entry = /^\s+([\w-]+):\s*(\S+)/.exec(lines[i]);
      if (!entry) break;
      granted.push(`${entry[1]}: ${entry[2]}`);
    }
    expect(granted.length).toBeGreaterThan(0);
    expect(granted.filter((grant) => !/: (read|none)$/.test(grant))).toEqual(
      [],
    );
    // And no job further down hands itself more.
    const writes = lines.filter((line) =>
      /^\s*(permissions:\s*write-all|[\w-]+:\s*write\s*(#.*)?$)/.test(line),
    );
    expect(writes).toEqual([]);
  });

  test("production's deploy asks for its own key first", () => {
    const keys = workflow('deploy-to-prod.yml')
      .map((line) => /^\s*key:\s*(.+?)\s*$/.exec(line))
      .filter(Boolean)
      .map((match) => match[1]);
    // The shared key stays as the fallback until the PROD secret exists; once
    // it does, GitHub picks it without another change here.
    expect(keys).toEqual([
      '${{ secrets.DIGITALOCEAN_ACCESS_TOKEN_PROD || secrets.DIGITALOCEAN_ACCESS_TOKEN }}',
    ]);
  });
});
