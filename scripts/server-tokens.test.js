/**
 * @jest-environment node
 */
/*
 * The proxy in front of the site must not print its nginx version.
 *
 * Every answer a visitor gets carries a Server header, and it is written by
 * the PROXY (nginx-proxy), not by the site's own nginx: the site's
 * `server_tokens off;` (nginx/nginx.conf, guarded by nginx-conf.test.js) never
 * reaches a visitor. nginx-proxy builds each host's server block from the
 * environment of the site container that announces the host (its
 * VIRTUAL_HOST), and since release 0.9.1 (commit fb7a1121, 2021-05) it reads
 * SERVER_TOKENS there: with `-e SERVER_TOKENS=off` on the site container, the
 * proxy writes `server_tokens off;` into that host's server block and the
 * header says `nginx`, with no version (nginx-proxy 1.11.6, nginx.tmpl, the
 * `Env.SERVER_TOKENS` lookup and the two `server_tokens` lines it feeds).
 * The 2021/2022 proxies still on the servers (nginx 1.21.1 and 1.21.6, so
 * nginx-proxy 0.9.2 or later) read it too, so it takes effect at the next
 * deploy to each server (README, "docker notes").
 *
 * These read the two deploy workflows, the proxy rehearsal and the compose
 * file as TEXT and fail when:
 *
 *   1. a site container (one with VIRTUAL_HOST) is started without
 *      `-e SERVER_TOKENS=off`, or with it twice. There are exactly four (the
 *      sandbox's web and www_web, production's web and www_web), so a change
 *      that makes the parser find none fails too;
 *   2. the chat container (no VIRTUAL_HOST, never routed by the proxy) gets
 *      it: harmless, but a sign the four above were edited by pattern, not
 *      by reading;
 *   3. anything the deploys or the rehearsal run writes the nginx directive
 *      `server_tokens` itself (the README's old alternative: vhost.d/default).
 *      The proxy includes vhost.d/<host> (or vhost.d/default) INSIDE the same
 *      server block it already wrote `server_tokens off;` into, nginx refuses
 *      a directive given twice in one block ("directive is duplicate"), and
 *      the proxy's whole config stops loading;
 *   4. the proxy rehearsal (scripts/proxy-smoke.sh) starts its site containers
 *      differently from the deploys, so it no longer proves this;
 *   5. the local compose file's `web` service loses it.
 */
import fs from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const DEPLOYS = ['deploy-to-dev.yml', 'deploy-to-prod.yml'];
const FLAG = /(^|\s)-e\s+SERVER_TOKENS=off(?=\s|$)/g;
const ANY_VALUE = /SERVER_TOKENS=/g;

const read = (...parts) => fs.readFileSync(path.join(REPO, ...parts), 'utf8');
const isComment = (line) => /^\s*#/.test(line);

// The commands of a shell script (or of a workflow's `run:`/`script:` blocks),
// one per entry: comment lines dropped, then every line that ends in a
// backslash joined to the next, as the shell would run it.
const commandsOf = (text) => {
  const commands = [];
  let current = '';
  text
    .split('\n')
    .filter((line) => !isComment(line))
    .forEach((line) => {
      const continued = /\\\s*$/.test(line);
      current += ` ${line.replace(/\\\s*$/, '').trim()}`;
      if (!continued) {
        commands.push(current.trim());
        current = '';
      }
    });
  if (current.trim()) commands.push(current.trim());
  return commands;
};

const containerCommands = (commands) =>
  commands.filter((command) => /\bdocker\s+(create|run)\b/.test(command));
const siteContainers = (commands) =>
  containerCommands(commands).filter((command) =>
    /(^|\s)-e\s+VIRTUAL_HOST=/.test(command),
  );
const nameOf = (command) => (/--name\s+(\S+)/.exec(command) || [])[1];
const hostOf = (command) => (/VIRTUAL_HOST=(\S+)/.exec(command) || [])[1];
const count = (command, re) => (command.match(re) || []).length;

// For every site container: which file, which name and host, how many times
// it says SERVER_TOKENS=off (as `-e`), and how many times SERVER_TOKENS at all.
const tally = (file, commands) =>
  siteContainers(commands).map((command) => ({
    file,
    name: nameOf(command),
    host: hostOf(command),
    off: count(command, FLAG),
    any: count(command, ANY_VALUE),
  }));

const deployCommands = Object.fromEntries(
  DEPLOYS.map((name) => [name, commandsOf(read('.github', 'workflows', name))]),
);

describe('the deploys start every site container with SERVER_TOKENS=off', () => {
  const found = DEPLOYS.flatMap((name) => tally(name, deployCommands[name]));

  test('there are exactly four site containers, and each says SERVER_TOKENS=off exactly once', () => {
    // Four, by name and host: an empty list (a parser that finds nothing)
    // cannot pass.
    expect(
      found.map(({ file, name, host }) => `${file} ${name} ${host}`),
    ).toEqual([
      'deploy-to-dev.yml web kiddspazz.com',
      'deploy-to-dev.yml www_web www.kiddspazz.com',
      'deploy-to-prod.yml web travish.com',
      'deploy-to-prod.yml www_web www.travish.com',
    ]);
    expect(
      found.map(({ file, name, off, any }) => ({ file, name, off, any })),
    ).toEqual(found.map(({ file, name }) => ({ file, name, off: 1, any: 1 })));
  });

  test('the chat container does not carry it (the proxy never routes to the chat)', () => {
    const chats = DEPLOYS.flatMap((name) =>
      containerCommands(deployCommands[name])
        .filter((command) => nameOf(command) === 'chat')
        .map((command) => ({ file: name, any: count(command, ANY_VALUE) })),
    );
    expect(chats).toEqual([
      { file: 'deploy-to-dev.yml', any: 0 },
      { file: 'deploy-to-prod.yml', any: 0 },
    ]);
  });

  test('the rule above finds a site container without the variable, and one with it twice', () => {
    const without = commandsOf(
      [
        'docker create --restart unless-stopped --name web \\',
        '  -e VIRTUAL_HOST=example.com \\',
        '  # a comment line inside the block is dropped, as in a script',
        '  -e VIRTUAL_PORT=80 \\',
        '  "$IMAGE" >/dev/null',
      ].join('\n'),
    );
    expect(tally('x', without)).toEqual([
      { file: 'x', name: 'web', host: 'example.com', off: 0, any: 0 },
    ]);
    const twice = commandsOf(
      'docker run --name web -e VIRTUAL_HOST=a.example -e SERVER_TOKENS=off -e SERVER_TOKENS=off img',
    );
    expect(tally('x', twice)[0]).toMatchObject({ off: 2, any: 2 });
    const otherValue = commandsOf(
      'docker run --name web -e VIRTUAL_HOST=a.example -e SERVER_TOKENS=on img',
    );
    expect(tally('x', otherValue)[0]).toMatchObject({ off: 0, any: 1 });
  });
});

describe('nothing writes the server_tokens directive itself', () => {
  // A non-comment line naming the nginx directive (lower case; the variable is
  // upper case) in anything that runs against the proxy. The only way such a
  // line gets there is by writing proxy config: vhost.d/<host>, vhost.d/default
  // or conf.d. The proxy already writes it, so a second copy is a duplicate
  // directive and nginx refuses the whole config.
  const writers = [
    ['.github', 'workflows', 'deploy-to-dev.yml'],
    ['.github', 'workflows', 'deploy-to-prod.yml'],
    ['scripts', 'proxy-smoke.sh'],
  ];

  const directiveLines = (label, text) =>
    text
      .split('\n')
      .map((line, index) => ({ line, at: `${label}:${index + 1}` }))
      .filter(({ line }) => !isComment(line) && /server_tokens/.test(line))
      .map(({ line, at }) => `${at}  ${line.trim()}`);

  test('no deploy step and no rehearsal step mentions `server_tokens`', () => {
    const offending = writers.flatMap((parts) =>
      directiveLines(parts.join('/'), read(...parts)),
    );
    expect(offending).toEqual([]);
  });

  test('the rule above finds a vhost.d write of the directive, and ignores comments and the variable', () => {
    const text = [
      '            # never write server_tokens into vhost.d (a comment)',
      '              -e SERVER_TOKENS=off \\',
      `            docker exec nginx-proxy sh -c "printf 'server_tokens off;\\n' > /etc/nginx/vhost.d/default"`,
    ].join('\n');
    expect(directiveLines('x', text)).toEqual([
      expect.stringMatching(
        /^x:3 {2}docker exec nginx-proxy .*vhost\.d\/default/,
      ),
    ]);
  });
});

describe('the proxy rehearsal starts the site the way the deploys do', () => {
  const script = read('scripts', 'proxy-smoke.sh');

  test('start_site() creates its container with -e SERVER_TOKENS=off', () => {
    const lines = script.split('\n');
    const start = lines.findIndex((line) => /^start_site\(\)\s*\{/.test(line));
    expect(start).toBeGreaterThanOrEqual(0);
    const end = lines.findIndex((line, i) => i > start && /^\}/.test(line));
    expect(end).toBeGreaterThan(start);
    const creates = containerCommands(
      commandsOf(lines.slice(start + 1, end).join('\n')),
    );
    expect(creates).toHaveLength(1);
    expect(count(creates[0], FLAG)).toBe(1);
  });

  test('its Server-header check passes only on a bare `nginx`', () => {
    // The case after "Server header through the proxy": its only PASS arm is
    // the exact word nginx, so a header that names any version fails.
    const lines = script.split('\n');
    const at = lines.findIndex((line) => /^case "\$server" in\s*$/.test(line));
    expect(at).toBeGreaterThanOrEqual(0);
    const end = lines.findIndex((line, i) => i > at && /^esac\s*$/.test(line));
    const arms = lines.slice(at + 1, end).map((line) => line.trim());
    expect(arms.filter((arm) => /\bpass\b/.test(arm))).toEqual([
      expect.stringMatching(/^nginx\) pass /),
    ]);
  });
});

describe('the local compose file', () => {
  test('its web service carries SERVER_TOKENS=off', () => {
    const lines = read('docker-compose.yml').split('\n');
    const web = lines.findIndex((line) => /^ {2}web:\s*$/.test(line));
    expect(web).toBeGreaterThanOrEqual(0);
    const next = lines.findIndex((line, i) => i > web && /^ {2}\S/.test(line));
    const body = lines.slice(web + 1, next === -1 ? undefined : next);
    expect(
      body.filter((line) => /^\s*-\s*SERVER_TOKENS=off\s*$/.test(line)),
    ).toHaveLength(1);
  });
});
