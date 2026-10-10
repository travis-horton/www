/**
 * @jest-environment node
 */
/*
 * The uptime check (scripts/uptime-check.sh) and the workflow that runs it
 * every 30 minutes (.github/workflows/uptime.yml).
 *
 * Part one runs the real script against a small web server started inside
 * this test on 127.0.0.1, which plays the two live addresses: /www stands for
 * https://www.travish.com/ and /apex for https://travish.com/. Nothing here
 * talks to the live site.
 *
 * ⚠️ The script runs through the ASYNC execFile. A synchronous child process
 * (any of child_process's "...Sync" calls) would block this process's event
 * loop, the server below could never answer it, and every case would hang
 * until it timed out.
 *
 * Part two reads the workflow files as TEXT (no YAML parser), the same way
 * repo-pins.test.js does.
 */
import { execFile } from 'child_process';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const SCRIPT = path.join(REPO, 'scripts', 'uptime-check.sh');
const WORKFLOW_DIR = path.join(REPO, '.github', 'workflows');
const USER_AGENT =
  'travish-uptime-check (+https://github.com/travis-horton/www)';
const CANONICAL = 'https://www.travish.com/';

// What the live hosts answer, and the ways they have gone wrong.
const send = (res, status, headers, body = '') => {
  res.writeHead(status, headers);
  res.end(body);
};
const HTML = { 'Content-Type': 'text/html; charset=utf-8' };
// What the live site actually serves: Parcel's MINIFIED build of
// src/index.html, which drops attribute quotes, so the root div arrives as
// `<div id=root>`. This is dist/index.html from `npm run build` on 26.1010,
// with the import map and the hashed file names shortened.
const SITE_PAGE =
  '<!DOCTYPE html><html lang=en><link rel=stylesheet href=/index.css><meta charset=utf-8><meta name=viewport content="width=device-width, initial-scale=1"><title>Travis Horton: one human bean</title><script type=module defer src=/index.js></script><body>\n    <div id=root></div>\n  \n\n';
// The page as written in the source, quotes and all.
const SOURCE_PAGE = fs.readFileSync(
  path.join(REPO, 'src', 'index.html'),
  'utf8',
);
// After `npm run build`, the real built page (absent before a build).
const BUILT_PAGE = path.join(REPO, 'dist', 'index.html');
// nginx-proxy's own answer when the container behind a host is down.
const PROXY_503 =
  '<html><head><title>503 Service Temporarily Unavailable</title></head><body><center><h1>503 Service Temporarily Unavailable</h1></center><hr><center>nginx</center></body></html>';
// A stock nginx page: a 200 in text/html, but not the site.
const WELCOME =
  '<!DOCTYPE html><html><head><title>Welcome to nginx!</title></head><body><h1>Welcome to nginx!</h1></body></html>';

const site = (res) => send(res, 200, HTML, SITE_PAGE);
const down = (res) => send(res, 503, HTML, PROXY_503);
const welcome = (res) => send(res, 200, HTML, WELCOME);
const redirect = (res) => send(res, 301, { ...HTML, Location: CANONICAL });

let fixture = null;

// Starts the stand-in server. `routes.www` and `routes.apex` answer requests
// to /www and /apex; each is told how many requests its path has had so far.
const startFixture = (routes) =>
  new Promise((resolve) => {
    const seen = { www: 0, apex: 0, agents: [] };
    const server = http.createServer((req, res) => {
      seen.agents.push(req.headers['user-agent']);
      const key = req.url.startsWith('/www') ? 'www' : 'apex';
      seen[key] += 1;
      routes[key](res, seen[key]);
    });
    server.listen(0, '127.0.0.1', () => {
      fixture = { server, seen, port: server.address().port };
      resolve(fixture);
    });
  });

afterEach(
  () =>
    new Promise((resolve) => {
      if (!fixture) return resolve();
      fixture.server.closeAllConnections();
      fixture.server.close(() => resolve());
      fixture = null;
      return undefined;
    }),
);

// Runs the script against `port`; resolves with its exit code and its output.
const runCheck = (port, extraEnv = {}) =>
  new Promise((resolve) => {
    const env = {
      PATH: process.env.PATH,
      UPTIME_WWW_URL: `http://127.0.0.1:${port}/www`,
      UPTIME_APEX_URL: `http://127.0.0.1:${port}/apex`,
      UPTIME_EXPECT_REDIRECT: CANONICAL,
      UPTIME_ATTEMPTS: '2',
      UPTIME_RETRY_DELAY: '0',
      ...extraEnv,
    };
    execFile(
      'bash',
      [SCRIPT],
      { env, timeout: 30000 },
      (error, stdout, stderr) => {
        resolve({
          code: error ? error.code : 0,
          output: `${stdout}${stderr}`,
        });
      },
    );
  });

const SLOW = 30000;

describe('scripts/uptime-check.sh against a stand-in server', () => {
  test(
    'both hosts healthy: exit 0, and the step summary gets both lines',
    async () => {
      const { port, seen } = await startFixture({ www: site, apex: redirect });
      const summary = path.join(
        fs.mkdtempSync(path.join(os.tmpdir(), 'uptime-check-')),
        'summary.md',
      );
      const { code, output } = await runCheck(port, {
        GITHUB_STEP_SUMMARY: summary,
      });
      expect(output).toMatch(/OK\s+www/);
      expect(output).toMatch(/OK\s+apex/);
      expect(code).toBe(0);
      // One request each: a good first answer is not asked again.
      expect([seen.www, seen.apex]).toEqual([1, 1]);
      const written = fs.readFileSync(summary, 'utf8');
      expect(written).toMatch(/OK\s+www/);
      expect(written).toMatch(/OK\s+apex/);
    },
    SLOW,
  );

  test(
    'the page as src/index.html writes it (quoted root div) also passes',
    async () => {
      expect(SOURCE_PAGE).toContain('<div id="root">');
      const { port } = await startFixture({
        www: (res) => send(res, 200, HTML, SOURCE_PAGE),
        apex: redirect,
      });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/OK\s+www/);
      expect(code).toBe(0);
    },
    SLOW,
  );

  // Runs only after `npm run build` has made dist/index.html; it ties the
  // check to whatever the minifier produces today.
  (fs.existsSync(BUILT_PAGE) ? test : test.skip)(
    'the real built page (dist/index.html) passes',
    async () => {
      const built = fs.readFileSync(BUILT_PAGE, 'utf8');
      const { port } = await startFixture({
        www: (res) => send(res, 200, HTML, built),
        apex: redirect,
      });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/OK\s+www/);
      expect(code).toBe(0);
    },
    SLOW,
  );

  test(
    'a div whose id only starts with "root", or a data-id=root, is not the site',
    async () => {
      const decoys = [
        '<html><body><div id=rootless></div></body></html>',
        '<html><body><div id="root-x"></div></body></html>',
        '<html><body><div data-id=root></div></body></html>',
      ];
      const { port } = await startFixture({
        www: (res, n) => send(res, 200, HTML, decoys[(n - 1) % decoys.length]),
        apex: redirect,
      });
      const { code, output } = await runCheck(port, { UPTIME_ATTEMPTS: '3' });
      expect(output).toMatch(/FAIL\s+www.*attempt 3 of 3/);
      expect(code).toBe(1);
    },
    SLOW,
  );

  test(
    'www answers 200 with the root div but not in text/html: exit 1',
    async () => {
      const { port } = await startFixture({
        www: (res) =>
          send(res, 200, { 'Content-Type': 'text/plain' }, SITE_PAGE),
        apex: redirect,
      });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/FAIL\s+www.*text\/html.*text\/plain/);
      expect(code).toBe(1);
    },
    SLOW,
  );

  test.each([302, 303, 307, 308])(
    'the bare domain answers %i to the right place: exit 1 (only 301 counts)',
    async (status) => {
      const { port } = await startFixture({
        www: site,
        apex: (res) => send(res, status, { ...HTML, Location: CANONICAL }),
      });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(new RegExp(`FAIL\\s+apex.*status ${status}`));
      expect(code).toBe(1);
    },
    SLOW,
  );

  test(
    'every request names itself with the identifying User-Agent',
    async () => {
      const { port, seen } = await startFixture({ www: site, apex: redirect });
      await runCheck(port);
      expect(seen.agents.length).toBeGreaterThan(0);
      seen.agents.forEach((agent) => expect(agent).toBe(USER_AGENT));
    },
    SLOW,
  );

  test(
    "www answers nginx-proxy's 503 page: exit 1, www named, asked every attempt",
    async () => {
      const { port, seen } = await startFixture({ www: down, apex: redirect });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/FAIL\s+www.*503/);
      expect(output).toMatch(/OK\s+apex/);
      expect(code).toBe(1);
      expect(seen.www).toBe(2);
    },
    SLOW,
  );

  test(
    'www answers 200 html that is not the site (no root div): exit 1',
    async () => {
      const { port } = await startFixture({ www: welcome, apex: redirect });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/FAIL\s+www/);
      expect(output).toMatch(/root/);
      expect(output).toMatch(/OK\s+apex/);
      expect(code).toBe(1);
    },
    SLOW,
  );

  test(
    'the bare domain answers 503 (its container is down): exit 1, apex named',
    async () => {
      const { port } = await startFixture({ www: site, apex: down });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/OK\s+www/);
      expect(output).toMatch(/FAIL\s+apex.*503/);
      expect(code).toBe(1);
    },
    SLOW,
  );

  test(
    'the bare domain answers 200 (the redirect is lost): exit 1',
    async () => {
      const { port } = await startFixture({ www: site, apex: site });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/FAIL\s+apex.*200/);
      expect(code).toBe(1);
    },
    SLOW,
  );

  test(
    'the bare domain redirects somewhere else: exit 1',
    async () => {
      const { port } = await startFixture({
        www: site,
        apex: (res) =>
          send(res, 301, { ...HTML, Location: 'http://www.travish.com/' }),
      });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/FAIL\s+apex.*http:\/\/www\.travish\.com\//);
      expect(code).toBe(1);
    },
    SLOW,
  );

  test(
    'a flaky first answer is retried, and the first good answer ends it',
    async () => {
      const { port, seen } = await startFixture({
        www: (res, n) => (n === 1 ? down(res) : site(res)),
        apex: redirect,
      });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/OK\s+www.*attempt 2 of 2/);
      expect(code).toBe(0);
      expect(seen.www).toBe(2);
    },
    SLOW,
  );

  test(
    'nothing listening at all: exit 1 for both, quickly, never a hang',
    async () => {
      // Take a free port, then let it go, so nothing answers there.
      const port = await new Promise((resolve) => {
        const probe = http.createServer();
        probe.listen(0, '127.0.0.1', () => {
          const { port: free } = probe.address();
          probe.close(() => resolve(free));
        });
      });
      const { code, output } = await runCheck(port);
      expect(output).toMatch(/FAIL\s+www/);
      expect(output).toMatch(/FAIL\s+apex/);
      expect(code).toBe(1);
    },
    SLOW,
  );
});

describe('the uptime workflow', () => {
  const linesOf = (name) =>
    fs.readFileSync(path.join(WORKFLOW_DIR, name), 'utf8').split('\n');
  const exists = fs.existsSync(path.join(WORKFLOW_DIR, 'uptime.yml'));
  const lines = exists ? linesOf('uptime.yml') : [];

  // A five-field cron line that fires every 30 minutes, every hour of every
  // day: `*/30 * * * *`, or two minutes exactly 30 apart (`7,37 * * * *`).
  const everyHalfHour = (cron) => {
    const fields = cron.trim().split(/\s+/);
    if (fields.length !== 5) return false;
    const [minute, ...rest] = fields;
    if (rest.some((field) => field !== '*')) return false;
    if (minute === '*/30') return true;
    const pair = /^(\d{1,2}),(\d{1,2})$/.exec(minute);
    if (!pair) return false;
    const [a, b] = [Number(pair[1]), Number(pair[2])];
    return a < 60 && b < 60 && Math.abs(a - b) === 30;
  };

  test('the file exists', () => {
    expect(exists).toBe(true);
  });

  test('the half-hour rule refuses what it is there to refuse', () => {
    ['*/30 * * * *', '7,37 * * * *', '37,7 * * * *'].forEach((cron) =>
      expect([cron, everyHalfHour(cron)]).toEqual([cron, true]),
    );
    [
      '0 * * * *',
      '*/15 * * * *',
      '7,38 * * * *',
      '*/30 3 * * *',
      '*/30 * * * 1',
      '7,37 * * *',
    ].forEach((cron) =>
      expect([cron, everyHalfHour(cron)]).toEqual([cron, false]),
    );
  });

  test('it runs on a 30-minute schedule and can be started by hand', () => {
    expect(lines.some((line) => /^\s+schedule:\s*$/.test(line))).toBe(true);
    const crons = lines
      .map((line) => /^\s*-\s*cron:\s*['"]([^'"]+)['"]/.exec(line))
      .filter(Boolean)
      .map((match) => match[1]);
    expect(crons).toHaveLength(1);
    expect(everyHalfHour(crons[0])).toBe(true);
    expect(lines.some((line) => /^\s+workflow_dispatch:\s*$/.test(line))).toBe(
      true,
    );
  });

  test('it starts from a read-only token and never asks for more', () => {
    const start = lines.findIndex((line) => /^permissions:\s*$/.test(line));
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
    expect(lines.filter((line) => /:\s*write/.test(line))).toEqual([]);
  });

  test('it has a time limit and runs the script', () => {
    expect(
      lines.some((line) => /^\s+timeout-minutes:\s*\d+\s*$/.test(line)),
    ).toBe(true);
    expect(
      lines.some((line) =>
        /^\s+run:\s*bash scripts\/uptime-check\.sh\s*$/.test(line),
      ),
    ).toBe(true);
  });

  test("its time limit outlasts the script's worst case, with room to spare", () => {
    // A job cut off by its time limit is CANCELLED, not failed, and a
    // cancelled scheduled run may send no email. So the limit must cover every
    // try timing out, plus the waits between tries, plus two minutes for the
    // runner and the checkout. Read from the script, so raising a default
    // without raising the limit fails here.
    const script = fs.readFileSync(SCRIPT, 'utf8');
    const number = (re) => Number((re.exec(script) || [])[1]);
    const attempts = number(/UPTIME_ATTEMPTS:-(\d+)\}/);
    const delay = number(/UPTIME_RETRY_DELAY:-(\d+)\}/);
    const maxTime = number(/--max-time (\d+)/);
    [attempts, delay, maxTime].forEach((n) => expect(n).toBeGreaterThan(0));
    const worstSeconds = 2 * (attempts * maxTime + (attempts - 1) * delay);
    const limit = lines
      .map((line) => /^\s+timeout-minutes:\s*(\d+)\s*$/.exec(line))
      .filter(Boolean)
      .map((match) => Number(match[1]));
    expect(limit).toHaveLength(1);
    expect(limit[0] * 60).toBeGreaterThanOrEqual(worstSeconds + 120);
  });

  test('its checkout keeps no credentials and fetches no submodules', () => {
    expect(
      lines.some((line) => /^\s+persist-credentials:\s*false\s*$/.test(line)),
    ).toBe(true);
    expect(lines.filter((line) => /submodules:/.test(line))).toEqual([]);
  });

  test("every workflow file is on the checks' actionlint line", () => {
    const lintLine =
      linesOf('checks.yml').find((line) => line.includes('rhysd/actionlint')) ||
      '';
    expect(lintLine).not.toBe('');
    const workflows = fs
      .readdirSync(WORKFLOW_DIR)
      .filter((name) => /\.ya?ml$/.test(name))
      .sort();
    const unlinted = workflows.filter(
      (name) => !lintLine.includes(`.github/workflows/${name}`),
    );
    expect(unlinted).toEqual([]);
  });
});
