/**
 * @jest-environment node
 */
/*
 * The HTTPS check (scripts/https-check.sh), the weekly workflow that runs it
 * (.github/workflows/https-check.yml), and its step at the end of both deploys.
 *
 * Part one runs the real script against a small HTTPS server started inside
 * this test on localhost, with a certificate made here by openssl for the
 * name `localhost`, good for as many days as each case needs. The script
 * trusts that certificate through HTTPS_CHECK_CAFILE. Nothing here talks to
 * the live sites.
 *
 * ⚠️ The script runs through the ASYNC execFile (as in uptime-check.test.js):
 * a synchronous child would block the event loop, the server below could
 * never answer it, and every case would hang until it timed out.
 *
 * Part two reads the workflow files as TEXT (no YAML parser), the same way
 * repo-pins.test.js does.
 */
import { execFile, execFileSync } from 'child_process';
import fs from 'fs';
import https from 'https';
import net from 'net';
import os from 'os';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const SCRIPT = path.join(REPO, 'scripts', 'https-check.sh');
const WORKFLOW_DIR = path.join(REPO, '.github', 'workflows');

let tmp;
const certs = {};

// A self-signed certificate for `localhost`, good for `days` days.
const makeCert = (days) => {
  const dir = path.join(tmp, `cert-${days}`);
  fs.mkdirSync(dir);
  const key = path.join(dir, 'key.pem');
  const cert = path.join(dir, 'cert.pem');
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-keyout',
      key,
      '-out',
      cert,
      '-days',
      String(days),
      '-subj',
      '/CN=localhost',
      '-addext',
      'subjectAltName=DNS:localhost',
    ],
    { stdio: 'ignore' },
  );
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert), file: cert };
};

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'https-check-test-'));
  certs.long = makeCert(90);
  certs.short = makeCert(5);
});

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

let server = null;
let seen = null;

// Starts the stand-in site. `respond(res, n)` answers its n-th request.
const startServer = (cert, respond) =>
  new Promise((resolve) => {
    seen = { requests: 0, agents: [] };
    server = https.createServer(
      { key: cert.key, cert: cert.cert },
      (req, res) => {
        seen.requests += 1;
        seen.agents.push(req.headers['user-agent']);
        respond(res, seen.requests);
      },
    );
    // No host: both ::1 and 127.0.0.1, whichever `localhost` resolves to.
    server.listen(0, () => resolve(server.address().port));
  });

afterEach(
  () =>
    new Promise((resolve) => {
      if (!server) return resolve();
      server.closeAllConnections();
      server.close(() => resolve());
      server = null;
      return undefined;
    }),
);

const status =
  (code, headers = {}) =>
  (res) => {
    res.writeHead(code, headers);
    res.end('');
  };

// Runs the script; resolves with { code, out } whatever the exit status.
const run = (args, env = {}) =>
  new Promise((resolve) => {
    execFile(
      'bash',
      [SCRIPT, ...args],
      {
        env: {
          ...process.env,
          HTTPS_CHECK_RETRY_DELAY: '0',
          HTTPS_CHECK_CAFILE: certs.long.file,
          GITHUB_STEP_SUMMARY: '',
          ...env,
        },
        timeout: 60000,
      },
      (error, stdout, stderr) =>
        resolve({ code: error ? error.code : 0, out: stdout + stderr }),
    );
  });

// A port with nothing listening on it.
const closedPort = () =>
  new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });

describe('scripts/https-check.sh', () => {
  test('a site that answers 200 with a long certificate passes', async () => {
    const port = await startServer(certs.long, status(200));
    const { code, out } = await run([`localhost:${port}`]);
    expect(out).toMatch(
      /^OK {3}localhost {2}answer {2}answers 200 \(attempt 1 of 3\)$/m,
    );
    expect(out).toMatch(
      /^OK {3}localhost {2}cert {4}expires .* \((89|90) days left; the floor is 14\)$/m,
    );
    expect(code).toBe(0);
  });

  test('a redirect passes and is not followed (the bare domain answers 301)', async () => {
    const port = await startServer(
      certs.long,
      status(301, { Location: 'https://localhost:1/never-asked' }),
    );
    const { code, out } = await run([`localhost:${port}`]);
    expect(out).toMatch(/OK {3}localhost {2}answer {2}answers 301/);
    expect(seen.requests).toBe(1);
    expect(code).toBe(0);
  });

  test('a certificate within 14 days of expiring fails, even when the site answers', async () => {
    const port = await startServer(certs.short, status(200));
    const { code, out } = await run([`localhost:${port}`], {
      HTTPS_CHECK_CAFILE: certs.short.file,
    });
    expect(out).toMatch(/OK {3}localhost {2}answer/);
    expect(out).toMatch(
      /^FAIL localhost {2}cert {4}expires .* \([45] days left; the floor is 14\)/m,
    );
    expect(out).toMatch(/HTTPS CHECK FAILED/);
    expect(code).toBe(1);
  });

  test('the floor is a setting: the same certificate passes with a floor of 3', async () => {
    const port = await startServer(certs.short, status(200));
    const { code } = await run([`localhost:${port}`], {
      HTTPS_CHECK_CAFILE: certs.short.file,
      HTTPS_CHECK_MIN_DAYS: '3',
    });
    expect(code).toBe(0);
  });

  test("a 503 (the proxy's answer when the site is down) fails after every attempt", async () => {
    const port = await startServer(certs.long, status(503));
    const { code, out } = await run([`localhost:${port}`], {
      HTTPS_CHECK_ATTEMPTS: '2',
    });
    expect(out).toMatch(
      /^FAIL localhost {2}answer {2}answers 503, expected 2xx or 3xx \(attempt 2 of 2\)$/m,
    );
    expect(seen.requests).toBe(2);
    expect(code).toBe(1);
  });

  test('one bad moment is not an alarm: 503 then 200 passes on the second attempt', async () => {
    const port = await startServer(certs.long, (res, n) =>
      status(n === 1 ? 503 : 200)(res),
    );
    const { code, out } = await run([`localhost:${port}`]);
    expect(out).toMatch(
      /OK {3}localhost {2}answer {2}answers 200 \(attempt 2 of 3\)/,
    );
    expect(code).toBe(0);
  });

  test('a certificate curl does not trust is a failed handshake, not a pass', async () => {
    const port = await startServer(certs.long, status(200));
    // Trusting the OTHER certificate: this one is now unknown.
    const { code, out } = await run([`localhost:${port}`], {
      HTTPS_CHECK_CAFILE: certs.short.file,
      HTTPS_CHECK_ATTEMPTS: '1',
    });
    expect(out).toMatch(/^FAIL localhost {2}answer {2}no answer \(curl: /m);
    expect(seen.requests).toBe(0);
    expect(code).toBe(1);
  });

  test('nothing listening fails both questions, quickly, without hanging', async () => {
    const port = await closedPort();
    const { code, out } = await run([`localhost:${port}`], {
      HTTPS_CHECK_ATTEMPTS: '1',
    });
    expect(out).toMatch(/^FAIL localhost {2}answer {2}no answer/m);
    expect(out).toMatch(/^FAIL localhost {2}cert {4}no certificate came back/m);
    expect(code).toBe(1);
  });

  test('every host is asked, and one failure fails the run', async () => {
    const port = await startServer(certs.long, status(200));
    const dead = await closedPort();
    const { code, out } = await run(
      [`localhost:${port}`, `localhost:${dead}`],
      {
        HTTPS_CHECK_ATTEMPTS: '1',
      },
    );
    expect(out.match(/^OK /gm)).toHaveLength(2);
    expect(out.match(/^FAIL /gm)).toHaveLength(2);
    expect(code).toBe(1);
  });

  test("its requests carry the uptime check's name, so the visit log skips them", async () => {
    const port = await startServer(certs.long, status(200));
    await run([`localhost:${port}`]);
    // nginx/nginx.conf: the visit log skips `~^travish-uptime-check `.
    const conf = fs.readFileSync(
      path.join(REPO, 'nginx', 'nginx.conf'),
      'utf8',
    );
    expect(conf).toContain('"~^travish-uptime-check "   0;');
    expect(seen.agents).toHaveLength(1);
    expect(seen.agents[0]).toMatch(/^travish-uptime-check /);
  });

  test('called wrongly, it says so and exits 2', async () => {
    expect((await run([])).code).toBe(2);
    expect(
      (await run(['localhost'], { HTTPS_CHECK_MIN_DAYS: 'two weeks' })).code,
    ).toBe(2);
    expect((await run(['localhost'], { HTTPS_CHECK_ATTEMPTS: '0' })).code).toBe(
      2,
    );
    expect((await run(['localhost:https'])).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Part two: where the check runs.

const workflow = (name) =>
  fs.readFileSync(path.join(WORKFLOW_DIR, name), 'utf8');

// The text of the LAST step of a workflow's only job: everything after its
// last `-` step marker.
const lastStep = (text) => {
  const lines = text.split('\n');
  let start = -1;
  lines.forEach((line, i) => {
    if (/^ {6}-\s*$/.test(line) || /^ {6}- /.test(line)) start = i;
  });
  return lines.slice(start).join('\n');
};

describe('where the check runs', () => {
  test('weekly, on a schedule, with a read-only token and a short time limit', () => {
    const text = workflow('https-check.yml');
    const cron = /^\s+- cron: '([^']+)'/m.exec(text);
    expect(cron).not.toBeNull();
    const [minute, hour, dom, month, dow] = cron[1].split(' ');
    // Once a week: a fixed minute, hour and weekday; every day of the month.
    expect(minute).toMatch(/^\d+$/);
    expect(hour).toMatch(/^\d+$/);
    expect([dom, month]).toEqual(['*', '*']);
    expect(dow).toMatch(/^[0-6]$/);
    // Not on the hour, when GitHub delays and drops scheduled runs.
    expect(minute).not.toBe('0');
    expect(text).toMatch(/^ {2}workflow_dispatch:/m);
    expect(text).toMatch(/^permissions:\n {2}contents: read\n/m);
    expect(text).not.toMatch(/secrets\./);
    const limit = /timeout-minutes: (\d+)/.exec(text);
    expect(Number(limit[1])).toBeLessThanOrEqual(8);
    expect(text).toMatch(
      /run: bash scripts\/https-check\.sh travish\.com www\.travish\.com kiddspazz\.com\s*$/m,
    );
  });

  test('the sandbox deploy ends by asking its own site, after the build is marked proven', () => {
    const step = lastStep(workflow('deploy-to-dev.yml'));
    expect(step).toMatch(/name: Ask the sandbox over HTTPS/);
    expect(step).toMatch(/bash scripts\/https-check\.sh kiddspazz\.com\s*$/m);
    // www.kiddspazz.com has no DNS record: asking it would always fail.
    expect(step).not.toMatch(/^\s*run:.*www\.kiddspazz\.com/m);
  });

  test('the production deploy ends by asking both of its sites', () => {
    const step = lastStep(workflow('deploy-to-prod.yml'));
    expect(step).toMatch(/name: Ask the live site over HTTPS/);
    expect(step).toMatch(
      /bash scripts\/https-check\.sh travish\.com www\.travish\.com\s*$/m,
    );
    // A rollback checks out a commit from before this script existed: it must
    // say so and carry on, not fail the deploy it just finished.
    expect(step).toMatch(/if \[ -f scripts\/https-check\.sh \]; then/);
  });
});
