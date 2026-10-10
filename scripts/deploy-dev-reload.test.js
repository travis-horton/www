/**
 * @jest-environment node
 */
/*
 * The sandbox deploy's nginx reload must wait for a whole config.
 *
 * deploy-to-dev.yml replaces the site's two containers and then reloads nginx
 * inside the proxy. The proxy's docker-gen, in that same container, rewrites
 * /etc/nginx/conf.d/default.conf whenever a container starts or stops, and
 * `nginx -s reload` reads that whole file before it signals anything. A reload
 * in the same moment as docker-gen's write reads a half-written file and fails:
 *
 *   nginx: [emerg] unexpected end of file, expecting ";" or "}" in
 *   /etc/nginx/conf.d/default.conf:173
 *
 * (checks run 38075573361, attempt 1, 26.1010, in the proxy rehearsal, which
 * ran the same bare reload). In the deploy that turns the job red and skips the
 * image cleanup, though the site stays up.
 *
 * Two kinds of test:
 *   1. STATIC, over both deploy workflows: no line is a bare reload, and every
 *      reload sits inside a `while` loop that runs `nginx -t` first.
 *   2. BEHAVIOURAL: the REAL script the deploy sends over ssh (the `script: |`
 *      of the step "Deploy web app to kiddspazz.com") is cut out of the
 *      workflow and run with bash against fakes. No docker is needed and none
 *      is reached. A temp directory goes FIRST on PATH, holding:
 *        - docker: after each `docker run` it is "mid-write" for the next
 *          FAKE_DOCKERGEN_BUSY nginx calls (`nginx -t` or `nginx -s reload`),
 *          each of which fails with the line above; after that the config is
 *          whole. One case also makes the first reload fail right after a
 *          passing `nginx -t` (docker-gen started writing again in between).
 *          Any call it does not know is logged as `unknown` (exit 99).
 *        - sleep: returns at once, logging its argument.
 *        - mkdir: logs, touches nothing (the script makes two directories
 *          under /var/log and /etc on the server).
 *      DOCKER_HOST points at a socket that does not exist and DOCKER_CONTEXT is
 *      removed, so even if a fake were somehow skipped no real daemon answers.
 *
 * DEPLOY_DEV_WORKFLOW=/abs/path runs both kinds against another copy of
 * deploy-to-dev.yml (e.g. a saved older version, to show these fail on it).
 * DEPLOY_DEV_TEST_KEEP=<dir> writes what each behavioural case printed and the
 * fakes' log to <dir>/<case>.txt.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const WORKFLOW_DIR = path.join(REPO, '.github', 'workflows');
const DEV_WORKFLOW =
  process.env.DEPLOY_DEV_WORKFLOW ||
  path.join(WORKFLOW_DIR, 'deploy-to-dev.yml');
const DEPLOYS = {
  'deploy-to-dev.yml': DEV_WORKFLOW,
  'deploy-to-prod.yml': path.join(WORKFLOW_DIR, 'deploy-to-prod.yml'),
};
const STEP = 'Deploy web app to kiddspazz.com';
const FAKE_SHA = '0123456789abcdef0123456789abcdef01234567';
const EMERG =
  'nginx: [emerg] unexpected end of file, expecting ";" or "}" in /etc/nginx/conf.d/default.conf:173';
// How many times the deploy tries `nginx -t` before it gives up on a reload.
const TRIES = 30;
const GIVE_UP = `nginx -t inside nginx-proxy still failing after ${TRIES} tries`;
jest.setTimeout(30000);

const linesOfFile = (file) => fs.readFileSync(file, 'utf8').split('\n');
const isComment = (line) => /^\s*#/.test(line);

// Every non-comment line that reloads nginx, and what is wrong with it (if
// anything), as "<file>:<line>  <text>  (<why>)".
const reloadProblems = (name, lines) => {
  const problems = [];
  let reloads = 0;
  lines.forEach((line, index) => {
    if (isComment(line) || !/nginx -s reload/.test(line)) return;
    reloads += 1;
    const where = `${name}:${index + 1}  ${line.trim()}`;
    if (/^\s*docker exec nginx-proxy nginx -s reload\s*$/.test(line)) {
      problems.push(`${where}  (bare reload)`);
      return;
    }
    // The innermost open `while` above this line (no `done` in between).
    let start = -1;
    for (let i = index - 1; i >= 0; i -= 1) {
      if (isComment(lines[i])) continue;
      if (/^\s*done\b/.test(lines[i])) break;
      if (/^\s*while\b/.test(lines[i])) {
        start = i;
        break;
      }
    }
    if (start === -1) {
      problems.push(`${where}  (not inside a while loop)`);
      return;
    }
    const tested = lines
      .slice(start + 1, index)
      .filter((before) => !isComment(before))
      .some((before) => /docker exec nginx-proxy nginx -t\b/.test(before));
    if (!tested) {
      problems.push(`${where}  (no nginx -t before it inside the loop)`);
    }
    const closed = lines
      .slice(index + 1)
      .filter((after) => !isComment(after))
      .some((after) => /^\s*done\b/.test(after));
    if (!closed) problems.push(`${where}  (the loop is never closed)`);
  });
  return { problems, reloads };
};

describe('the deploy workflows, read as text', () => {
  test('no deploy reloads nginx bare: every reload waits for `nginx -t` in a loop', () => {
    const problems = [];
    const counted = {};
    Object.entries(DEPLOYS).forEach(([name, file]) => {
      const found = reloadProblems(name, linesOfFile(file));
      counted[name] = found.reloads;
      problems.push(...found.problems);
    });
    // The sandbox deploy does reload by hand (the scan saw it). Production has
    // no reload of its own today (docker-gen's own does the job there); if one
    // is ever added, it is held to the same rule.
    expect(counted['deploy-to-dev.yml']).toBeGreaterThan(0);
    expect(problems).toEqual([]);
  });

  test('the rule above refuses a bare reload and one with no `nginx -t` first', () => {
    const bare = ['docker run x', 'docker exec nginx-proxy nginx -s reload'];
    expect(reloadProblems('t', bare).problems).toHaveLength(1);
    const untested = [
      'while [ "$n" -lt 3 ]; do',
      '  n=$((n + 1))',
      '  # docker exec nginx-proxy nginx -t',
      '  if docker exec nginx-proxy nginx -s reload; then break; fi',
      'done',
    ];
    expect(reloadProblems('t', untested).problems).toHaveLength(1);
    const good = [
      'while [ "$n" -lt 3 ]; do',
      '  if docker exec nginx-proxy nginx -t; then',
      '    if docker exec nginx-proxy nginx -s reload; then break; fi',
      '  fi',
      'done',
    ];
    expect(reloadProblems('t', good).problems).toEqual([]);
  });
});

// The ssh script of the deploy step: every line after `script: |` that is
// indented at least as deep as the first one, with that indent taken off.
const remoteScript = (lines) => {
  const step = lines.findIndex((line) =>
    new RegExp(`^\\s*name:\\s*${STEP}\\s*$`).test(line),
  );
  expect(step).toBeGreaterThan(-1);
  const start = lines.findIndex(
    (line, i) => i > step && /^\s*script:\s*\|\s*$/.test(line),
  );
  expect(start).toBeGreaterThan(step);
  const indent = /^(\s*)/.exec(lines[start + 1])[1].length;
  expect(indent).toBeGreaterThan(0);
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === '') {
      body.push('');
      continue;
    }
    if (/^(\s*)/.exec(line)[1].length < indent) break;
    body.push(line.slice(indent));
  }
  while (body.length && body[body.length - 1] === '') body.pop();
  return `${body.join('\n').split('${{ github.sha }}').join(FAKE_SHA)}\n`;
};

// The fakes. Plain strings (no `${`), so the shell's own syntax survives.
const FAKE_DOCKER = String.raw`#!/bin/bash
# docker, faked for scripts/deploy-dev-reload.test.js. Never talks to a daemon.
log="$FAKE_DOCKER_LOG"
state="$FAKE_DOCKER_STATE"
busy=0
if [ -f "$state" ]; then busy="$(cat "$state")"; fi
emerg='nginx: [emerg] unexpected end of file, expecting ";" or "}" in /etc/nginx/conf.d/default.conf:173'
case "$1" in
  pull)
    echo "pull" >> "$log"
    exit 0
    ;;
  rm)
    if [ "$2" = -f ]; then
      echo "rm" >> "$log"
      exit 0
    fi
    ;;
  run)
    prev=""
    last2=""
    for a in "$@"; do
      last2="$prev"
      prev="$a"
    done
    if [ "$last2" = -d ]; then
      echo "$FAKE_DOCKERGEN_BUSY" > "$state"
      echo "run" >> "$log"
      exit 0
    fi
    ;;
  inspect)
    if [ "$2" = -f ]; then
      echo "inspect" >> "$log"
      echo 0
      exit 0
    fi
    ;;
  ps)
    if [ "$2" = -q ]; then
      echo "ps -q" >> "$log"
      echo 0123456789ab
      exit 0
    fi
    if [ "$2" = -a ]; then
      echo "ps -a" >> "$log"
      exit 0
    fi
    ;;
  image)
    if [ "$2" = prune ]; then
      echo "prune" >> "$log"
      exit 0
    fi
    ;;
  exec)
    if [ "$2" = nginx-proxy ]; then
      shift 2
      case "$*" in
        "nginx -t")
          if [ "$busy" -gt 0 ]; then
            echo "t busy" >> "$log"
            echo $((busy - 1)) > "$state"
            echo "$emerg" >&2
            echo "nginx: configuration file /etc/nginx/nginx.conf test failed" >&2
            exit 1
          fi
          echo "t ok" >> "$log"
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
          # docker-gen started writing again between nginx -t and the reload.
          races=0
          if [ -f "$state.races" ]; then races="$(cat "$state.races")"; fi
          if [ "$races" -gt 0 ]; then
            echo "reload-race" >> "$log"
            echo $((races - 1)) > "$state.races"
            echo "$emerg" >&2
            exit 1
          fi
          exit 0
          ;;
        "sh -c "*vhost.d*)
          echo "write vhost" >> "$log"
          exit 0
          ;;
      esac
    fi
    ;;
esac
echo "unknown $*" >> "$log"
exit 99
`;

const FAKE_SLEEP = `#!/bin/bash
echo "sleep $*" >> "$FAKE_DOCKER_LOG"
exit 0
`;

const FAKE_MKDIR = `#!/bin/bash
echo "mkdir $*" >> "$FAKE_DOCKER_LOG"
exit 0
`;

let dir;
let bin;
let logFile;
let stateFile;
let scriptFile;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-dev-test-'));
  bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'docker'), FAKE_DOCKER, { mode: 0o755 });
  fs.writeFileSync(path.join(bin, 'sleep'), FAKE_SLEEP, { mode: 0o755 });
  fs.writeFileSync(path.join(bin, 'mkdir'), FAKE_MKDIR, { mode: 0o755 });
  logFile = path.join(dir, 'fakes.log');
  stateFile = path.join(dir, 'dockergen-busy');
  scriptFile = path.join(dir, 'deploy.sh');
  fs.writeFileSync(logFile, '');
  fs.writeFileSync(scriptFile, remoteScript(linesOfFile(DEV_WORKFLOW)));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

const fakeEnv = (busy) => {
  const env = {
    ...process.env,
    PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    DOCKER_HOST: 'unix:///nonexistent-deploy-dev-test',
    FAKE_DOCKER_LOG: logFile,
    FAKE_DOCKER_STATE: stateFile,
    FAKE_DOCKERGEN_BUSY: String(busy),
  };
  delete env.DOCKER_CONTEXT;
  return env;
};

const readLog = () =>
  fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

// What the fakes logged after the second `docker run`, up to the script's
// `sleep 5` (the pause before it checks the site is up): the reload's part.
const afterContainers = (lines) => {
  const runs = lines.reduce(
    (at, line, i) => (line === 'run' ? [...at, i] : at),
    [],
  );
  expect(runs).toHaveLength(2);
  const rest = lines.slice(runs[1] + 1);
  const pause = rest.indexOf('sleep 5');
  expect(pause).toBeGreaterThan(-1);
  return rest.slice(0, pause);
};

// races: how many reloads fail even right after a passing `nginx -t`.
const runDeploy = (name, busy, races = 0) => {
  fs.writeFileSync(`${stateFile}.races`, String(races));
  const result = spawnSync('bash', [scriptFile], {
    cwd: dir,
    env: fakeEnv(busy),
    encoding: 'utf8',
    timeout: 20000,
  });
  const output = `${result.stdout}${result.stderr}`;
  const lines = readLog();
  const keep = process.env.DEPLOY_DEV_TEST_KEEP;
  if (keep) {
    fs.mkdirSync(keep, { recursive: true });
    fs.writeFileSync(
      path.join(keep, `${name}.txt`),
      [
        `# the deploy's ssh script from ${DEV_WORKFLOW}, FAKE_DOCKERGEN_BUSY=${busy}, reload races=${races}`,
        `# exit status: ${result.status}, signal: ${result.signal}`,
        '# ---- what the script printed (stdout, then stderr)',
        output,
        '# ---- the fakes log',
        ...lines,
        '',
      ].join('\n'),
    );
  }
  // The fakes stood in for everything: nothing unknown, no real daemon.
  expect(lines.filter((line) => line.startsWith('unknown'))).toEqual([]);
  expect(lines.filter((line) => line.startsWith('mkdir'))).toHaveLength(2);
  expect(result.signal).toBeNull();
  return { result, output, lines };
};

describe("the deploy's real ssh script, against a fake docker", () => {
  test('is complete shell once the commit is filled in', () => {
    const script = fs.readFileSync(scriptFile, 'utf8');
    expect(script).not.toContain('${{');
    expect(script).toContain(`IMAGE=kiddspazz/www_web:${FAKE_SHA}`);
    expect(script).toMatch(/\nexit 0\n$/);
    const syntax = spawnSync('bash', ['-n', scriptFile], { encoding: 'utf8' });
    expect(syntax.stderr).toBe('');
    expect(syntax.status).toBe(0);
  });

  test('when docker-gen is mid-write, the reload waits for it, then the deploy succeeds', () => {
    const { result, output, lines } = runDeploy('settles', 2);
    expect(lines).not.toContain('reload-while-busy');
    expect(afterContainers(lines)).toEqual([
      't busy',
      'sleep 1',
      't busy',
      'sleep 1',
      't ok',
      'reload',
    ]);
    expect(lines.filter((line) => line === 'reload')).toHaveLength(1);
    expect(lines).toContain('prune');
    expect(output).not.toContain('DEPLOY FAILED');
    expect(result.status).toBe(0);
  });

  test('when the config never becomes valid, it gives up after a bounded wait, says why, and skips the cleanup', () => {
    const { result, output, lines } = runDeploy('never-settles', 1000);
    expect(output).toContain(GIVE_UP);
    expect(output).toContain(EMERG);
    expect(output).toContain('Skipping image cleanup');
    expect(lines.filter((line) => line.startsWith('t '))).toHaveLength(TRIES);
    // 1 s between tries, none after the last.
    expect(
      afterContainers(lines).filter((line) => line === 'sleep 1'),
    ).toHaveLength(TRIES - 1);
    // A config that never passes is never reloaded, and nothing is pruned.
    expect(lines).not.toContain('reload');
    expect(lines).not.toContain('prune');
    expect(result.status).not.toBe(0);
  });

  test('a reload that fails right after a passing `nginx -t` counts as a failed try, not the end', () => {
    const { result, output, lines } = runDeploy('reload-race', 0, 1);
    expect(afterContainers(lines)).toEqual([
      't ok',
      'reload',
      'reload-race',
      'sleep 1',
      't ok',
      'reload',
    ]);
    expect(lines).toContain('prune');
    expect(output).not.toContain('DEPLOY FAILED');
    expect(result.status).toBe(0);
  });

  test('when the config is already whole, it reloads at once', () => {
    const { result, lines } = runDeploy('already-whole', 0);
    expect(afterContainers(lines)).toEqual(['t ok', 'reload']);
    expect(lines).toContain('prune');
    expect(result.status).toBe(0);
  });
});
