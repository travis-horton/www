/**
 * @jest-environment node
 */
/*
 * scripts/proxy-smoke.sh, run for real, against a fake docker.
 *
 * The rehearsal of the proxy (checks.yml, "Rehearse the pinned proxy") writes
 * the sandbox's vhost.d files and then reloads nginx inside the proxy. The
 * proxy's docker-gen rewrites /etc/nginx/conf.d/default.conf whenever a
 * container starts or stops, and `nginx -s reload` reads that whole file
 * before it signals anything. A reload in the same moment as docker-gen's
 * write reads a half-written file and fails:
 *
 *   nginx: [emerg] unexpected end of file, expecting ";" or "}" in
 *   /etc/nginx/conf.d/default.conf:173
 *
 * which is what checks run 38075573361 (attempt 1, 26.1010) failed on, right
 * after the rehearsal replaced the site's two containers.
 *
 * No docker is needed and none is reached. A temp directory goes FIRST on
 * PATH, holding three fakes:
 *   - docker: after each `docker run` it is "mid-write" for the next
 *     FAKE_DOCKERGEN_BUSY nginx calls (`nginx -t` or `nginx -s reload`), each
 *     of which fails with the line above; after that the config is whole.
 *   - curl: always "connection refused". Every assert that asks the proxy a
 *     question therefore fails here; these tests do not look at those.
 *   - sleep: returns at once, so the script's waiting loops cost nothing.
 * DOCKER_HOST points at a socket that does not exist and DOCKER_CONTEXT is
 * removed, so even if the fake were somehow skipped no real daemon answers.
 *
 * To keep what each run printed (for a report), set PROXY_SMOKE_TEST_KEEP to
 * a directory: each case writes <case>.txt there.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const SCRIPT = path.join(REPO, 'scripts', 'proxy-smoke.sh');
const EMERG =
  'nginx: [emerg] unexpected end of file, expecting ";" or "}" in /etc/nginx/conf.d/default.conf:173';
// How many times the script tries `nginx -t` before it gives up on a reload.
const TRIES = 30;
// Every PASS or FAIL line the script prints, whatever happens.
const ASSERTS = 39;
// The script runs a few hundred tiny processes; give it room on a slow machine.
jest.setTimeout(30000);

const FIRST_WRITE_PASS =
  'PASS  docker exec nginx-proxy: wrote vhost.d/<host> for both hosts and reloaded nginx';
const FIRST_WRITE_FAIL =
  'FAIL  docker exec nginx-proxy: writing vhost.d/<host> or the reload failed';
const SECOND_WRITE_PASS =
  'PASS  the same two commands again, after the containers were replaced';
const SECOND_WRITE_FAIL =
  'FAIL  the same two commands failed after the containers were replaced';

// The fakes. Plain strings (no `${`), so the shell's own syntax survives.
const FAKE_DOCKER = String.raw`#!/bin/bash
# docker, faked for scripts/proxy-smoke.test.js. Never talks to a daemon.
log="$FAKE_DOCKER_LOG"
state="$FAKE_DOCKER_STATE"
busy=0
if [ -f "$state" ]; then busy="$(cat "$state")"; fi
emerg='nginx: [emerg] unexpected end of file, expecting ";" or "}" in /etc/nginx/conf.d/default.conf:173'
case "$1" in
  ps | compose | logs | volume)
    exit 0
    ;;
  rm)
    [ "$2" = -f ] && exit 0
    ;;
  run)
    if [ "$2" = -d ]; then
      after="$FAKE_DOCKERGEN_BUSY"
      [ -n "$after" ] || after=2
      echo "$after" > "$state"
      echo "run" >> "$log"
      exit 0
    fi
    ;;
  exec)
    if [ "$2" = nginx-proxy ]; then
      shift 2
      case "$*" in
        "nginx -v")
          echo "nginx version: nginx/1.27.3" >&2
          exit 0
          ;;
        "nginx -t" | "nginx -t "*)
          if [ "$busy" -gt 0 ]; then
            echo "t busy" >> "$log"
            echo $((busy - 1)) > "$state"
            echo "$emerg" >&2
            echo "nginx: configuration file /etc/nginx/nginx.conf test failed" >&2
            exit 1
          fi
          echo "t ok" >> "$log"
          echo "nginx: the configuration file /etc/nginx/nginx.conf syntax is ok" >&2
          echo "nginx: configuration file /etc/nginx/nginx.conf test is successful" >&2
          exit 0
          ;;
        "nginx -s reload")
          echo "reload" >> "$log"
          if [ "$busy" -gt 0 ]; then
            echo "reload-while-busy" >> "$log"
            echo $((busy - 1)) > "$state"
            echo "$emerg" >&2
            exit 1
          fi
          exit 0
          ;;
        "sh -c "*vhost.d*)
          echo "write vhost" >> "$log"
          exit 0
          ;;
        "sh -c "*)
          echo "exec sh" >> "$log"
          exit 0
          ;;
      esac
    fi
    ;;
esac
echo "unknown $*" >> "$log"
exit 99
`;

const FAKE_CURL = `#!/bin/bash
echo "curl: (7) Failed to connect (fake curl, scripts/proxy-smoke.test.js)" >&2
exit 7
`;

const FAKE_SLEEP = `#!/bin/bash
echo "sleep $*" >> "$FAKE_DOCKER_LOG"
exit 0
`;

let dir;
let bin;
let logFile;
let stateFile;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proxy-smoke-test-'));
  bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'docker'), FAKE_DOCKER, { mode: 0o755 });
  fs.writeFileSync(path.join(bin, 'curl'), FAKE_CURL, { mode: 0o755 });
  fs.writeFileSync(path.join(bin, 'sleep'), FAKE_SLEEP, { mode: 0o755 });
  logFile = path.join(dir, 'docker.log');
  stateFile = path.join(dir, 'dockergen-busy');
  fs.writeFileSync(logFile, '');
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

const fakeEnv = (busy) => {
  const env = {
    ...process.env,
    PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    DOCKER_HOST: 'unix:///nonexistent-proxy-smoke-test',
    FAKE_DOCKER_LOG: logFile,
    FAKE_DOCKER_STATE: stateFile,
    FAKE_DOCKERGEN_BUSY: String(busy),
  };
  delete env.DOCKER_CONTEXT;
  return env;
};

const readLog = () =>
  fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

// The fake docker's log, cut into one piece per write_robots call: from the
// call's second vhost.d write up to the next write or `docker run`.
const writeRobotsCalls = (lines) => {
  const calls = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i] === 'write vhost' && lines[i + 1] === 'write vhost') {
      let end = i + 2;
      while (
        end < lines.length &&
        lines[end] !== 'write vhost' &&
        lines[end] !== 'run'
      ) {
        end += 1;
      }
      calls.push(lines.slice(i + 2, end));
      i = end;
    } else {
      i += 1;
    }
  }
  return calls;
};

const tally = (output) => {
  const match = /^== (\d+) passed, (\d+) failed$/m.exec(output);
  return match ? Number(match[1]) + Number(match[2]) : null;
};

const runRehearsal = (name, busy) => {
  const result = spawnSync('bash', [SCRIPT, 'www_web:ci'], {
    cwd: REPO,
    env: fakeEnv(busy),
    encoding: 'utf8',
    timeout: 25000,
  });
  const output = `${result.stdout}${result.stderr}`;
  const lines = readLog();
  const keep = process.env.PROXY_SMOKE_TEST_KEEP;
  if (keep) {
    fs.mkdirSync(keep, { recursive: true });
    fs.writeFileSync(
      path.join(keep, `${name}.txt`),
      [
        `# bash scripts/proxy-smoke.sh www_web:ci, FAKE_DOCKERGEN_BUSY=${busy}`,
        `# exit status: ${result.status}, signal: ${result.signal}`,
        '# ---- what the script printed (stdout, then stderr)',
        output,
        '# ---- the fake docker/sleep log',
        ...lines,
        '',
      ].join('\n'),
    );
  }
  return { result, output, lines };
};

test('the fake docker fails a bare reload the way CI did, while docker-gen is mid-write', () => {
  const docker = path.join(bin, 'docker');
  const env = fakeEnv(2);
  expect(spawnSync(docker, ['run', '-d', 'x'], { env }).status).toBe(0);
  // The command the script ran before the fix, alone.
  const reload = spawnSync(
    docker,
    ['exec', 'nginx-proxy', 'nginx', '-s', 'reload'],
    {
      env,
      encoding: 'utf8',
    },
  );
  expect(reload.status).not.toBe(0);
  expect(reload.stderr).toContain(EMERG);
});

test('when docker-gen finishes writing, both reloads wait for it and succeed', () => {
  const { result, output, lines } = runRehearsal('settles', 2);

  // The fake really stood in for docker: four `docker run`s, nothing unknown.
  expect(lines.filter((line) => line === 'run')).toHaveLength(4);
  expect(lines.filter((line) => line.startsWith('unknown'))).toEqual([]);

  expect(output).toContain(FIRST_WRITE_PASS);
  expect(output).toContain(SECOND_WRITE_PASS);
  expect(lines).not.toContain('reload-while-busy');

  const calls = writeRobotsCalls(lines);
  expect(calls).toHaveLength(2);
  for (const call of calls) {
    // Waited: each failed `nginx -t` is followed by a pause, then the config
    // passes, and only then is nginx reloaded (once).
    const settled = call.indexOf('t ok');
    expect(settled).toBeGreaterThan(0);
    expect(call.slice(0, settled + 2)).toEqual([
      't busy',
      'sleep 1',
      't busy',
      'sleep 1',
      't ok',
      'reload',
    ]);
    expect(call.filter((line) => line === 'reload')).toHaveLength(1);
  }

  // The same asserts as always, however many of them curl's absence fails.
  expect(tally(output)).toBe(ASSERTS);
  expect(result.signal).toBeNull();
});

test('when the config never becomes valid, the reload gives up after a bounded wait and says why', () => {
  const { result, output, lines } = runRehearsal('never-settles', 1000);

  expect(lines.filter((line) => line.startsWith('unknown'))).toEqual([]);
  expect(output).toContain(FIRST_WRITE_FAIL);
  expect(output).toContain(SECOND_WRITE_FAIL);
  expect(output).toContain(
    `nginx -t inside nginx-proxy still failing after ${TRIES} tries`,
  );
  expect(output).toContain(EMERG);

  const calls = writeRobotsCalls(lines);
  expect(calls).toHaveLength(2);
  for (const call of calls) {
    expect(call.filter((line) => line.startsWith('t '))).toHaveLength(TRIES);
  }
  // A config that never passes is never reloaded.
  expect(lines).not.toContain('reload');
  expect(lines).not.toContain('reload-while-busy');

  expect(tally(output)).toBe(ASSERTS);
  expect(result.status).toBe(1);
  expect(result.signal).toBeNull();
});
