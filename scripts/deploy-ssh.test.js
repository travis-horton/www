/**
 * @jest-environment node
 */
/*
 * The deploys' ssh step: the runner's own openssh, and the server's host key
 * checked against a pinned copy (M-168 (a), ruled 26.1009).
 *
 * Until 26.1015 both deploys used appleboy/ssh-action. It was pinned to a
 * commit, but that commit only downloads its ssh program (drone-ssh) while
 * the job runs, so the pin never covered the code that was handed the server
 * key, and neither deploy passed its `fingerprint`, so whichever machine
 * answered at the server's address was trusted.
 *
 * The step's real `run:` block is cut out of EACH deploy workflow and run with
 * bash, with a fake `ssh` first on PATH. The fake logs its arguments, saves
 * what it was sent on stdin, copies the known_hosts file it was pointed at
 * (the step deletes its own copy on exit) and exits with FAKE_SSH_RC. No
 * network is used and no server is reached.
 *
 * As in deploy-dev-reload.test.js, GitHub's `${{ }}` expressions are not
 * evaluated: the test sets the env the step would see.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { blockScalar, envOf, linesOfFile, stepLines } from './workflow-text';

const REPO = path.resolve(__dirname, '..');
const WORKFLOW_DIR = path.join(REPO, '.github', 'workflows');
const DEPLOYS = [
  [
    'deploy-to-dev.yml',
    'Deploy web app to kiddspazz.com',
    'DIGITALOCEAN_HOST_KEY',
  ],
  [
    'deploy-to-prod.yml',
    'Deploy web app to travish.com',
    'DIGITALOCEAN_HOST_KEY_PROD',
  ],
];
const HOST = '203.0.113.7';
const USER = 'deployer';
const PRIVATE_KEY =
  '-----BEGIN OPENSSH PRIVATE KEY-----\nnot-a-real-key-deploy-ssh-test\n-----END OPENSSH PRIVATE KEY-----';
const HOST_KEY_LINE = `${HOST} ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAInotarealhostkeydeployssh`;

// A plain string array (not a template literal), so the shell's own `${`
// survives as written.
const FAKE_SSH = [
  '#!/bin/bash',
  '# ssh, faked for scripts/deploy-ssh.test.js. Never opens a connection.',
  'out="$FAKE_SSH_DIR"',
  'printf "%s\\n" "$@" > "$out/argv"',
  'prev=""',
  'for a in "$@"; do',
  '  case "$a" in',
  '    UserKnownHostsFile=*) cp "${a#UserKnownHostsFile=}" "$out/known_hosts" ;;',
  '  esac',
  '  if [ "$prev" = -i ]; then',
  '    cp "$a" "$out/key"',
  '    ls -l "$a" | cut -c1-10 > "$out/key-mode"',
  '  fi',
  '  prev="$a"',
  'done',
  'cat > "$out/stdin"',
  'exit "${FAKE_SSH_RC:-0}"',
  '',
].join('\n');

let dir;
let bin;
let runnerTemp;
let sshOut;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-ssh-test-'));
  bin = path.join(dir, 'bin');
  runnerTemp = path.join(dir, 'runner-temp');
  sshOut = path.join(dir, 'ssh-out');
  [bin, runnerTemp, sshOut].forEach((d) => fs.mkdirSync(d));
  fs.writeFileSync(path.join(bin, 'ssh'), FAKE_SSH, { mode: 0o755 });
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

const readStep = (file, name) => {
  const step = stepLines(linesOfFile(path.join(WORKFLOW_DIR, file)), name);
  return {
    step,
    run: blockScalar(step, 'run'),
    remote: blockScalar(step, 'REMOTE_SCRIPT'),
    env: envOf(step),
  };
};

// Run the step's `run:` block the way GitHub does on Linux (bash -e), with
// the env the step would get. `overrides` replaces any of it.
const runStep = (file, name, overrides = {}) => {
  const { run, remote, env } = readStep(file, name);
  expect(run).not.toBeNull();
  expect(remote).not.toBeNull();
  const script = path.join(dir, 'step.sh');
  fs.writeFileSync(script, run);
  const result = spawnSync('bash', ['-e', script], {
    cwd: dir,
    env: {
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      HOME: dir,
      RUNNER_TEMP: runnerTemp,
      FAKE_SSH_DIR: sshOut,
      FAKE_SSH_RC: '0',
      DEPLOY_HOST: HOST,
      DEPLOY_USER: USER,
      DEPLOY_KEY: PRIVATE_KEY,
      DEPLOY_HOST_KEY: HOST_KEY_LINE,
      // Plain text in the workflow (the secret's NAME), so taken as written.
      HOST_KEY_SECRET: env.HOST_KEY_SECRET,
      REMOTE_SCRIPT: remote,
      ...overrides,
    },
    encoding: 'utf8',
    timeout: 20000,
  });
  const saved = (what) => {
    const file = path.join(sshOut, what);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  };
  return {
    result,
    output: `${result.stdout}${result.stderr}`,
    remote,
    argv: (saved('argv') || '').split('\n').filter(Boolean),
    saved,
  };
};

// The only `-o` options the step may give ssh. ssh takes the FIRST value it
// is given for an option, so a second `-o StrictHostKeyChecking=…` placed in
// front of `=yes` would win (ssh -G shows it: `-o StrictHostKeyChecking=false
// -o StrictHostKeyChecking=yes` → "stricthostkeychecking false"), and an
// option such as KnownHostsCommand or ProxyCommand can change what is
// trusted without touching StrictHostKeyChecking at all. Names are compared
// ignoring case, as ssh compares them.
const SSH_OPTIONS = [
  'IdentitiesOnly',
  'BatchMode',
  'StrictHostKeyChecking',
  'UserKnownHostsFile',
  'GlobalKnownHostsFile',
  'ConnectTimeout',
  'ServerAliveInterval',
];
const ALLOWED_SSH_OPTIONS = new Set(SSH_OPTIONS.map((n) => n.toLowerCase()));

// Everything wrong with the arguments ssh was given, plus its `-o` options as
// { Name: value }. Allowed: -T; -i <file>; -F /dev/null (no other file);
// -o <option> from the list above, each name once, written `Name=value` or
// `Name value`; and LAST, exactly `user@host` then `bash -s`. Anything else
// (a glued `-oName=value`, `-F <file>`, `-v`, a flag ssh might add later) is
// a problem, so a new argument has to be added here on purpose.
const sshArgsProblems = (argv) => {
  const problems = [];
  const options = {};
  const seen = new Set();
  const tail = argv.slice(-2);
  if (
    argv.length < 2 ||
    !/^[^\s@-][^\s@]*@[^\s@]+$/.test(tail[0]) ||
    tail[1] !== 'bash -s'
  ) {
    problems.push(
      `the last two arguments are not user@host, 'bash -s': ${JSON.stringify(tail)}`,
    );
  }
  const flags = argv.slice(0, -2);
  for (let i = 0; i < flags.length; i += 1) {
    const arg = flags[i];
    if (arg === '-T') continue;
    if (!['-i', '-F', '-o'].includes(arg)) {
      problems.push(`argument not allowed: ${arg}`);
      continue;
    }
    const value = flags[i + 1];
    i += 1;
    if (value === undefined) {
      problems.push(`${arg} has no value`);
      continue;
    }
    if (arg === '-i') continue;
    if (arg === '-F') {
      if (value !== '/dev/null')
        problems.push(`-F ${value} (only -F /dev/null)`);
      continue;
    }
    // -o: `Name=value` or `Name value`, split on the first `=` or space.
    const at = value.search(/[=\s]/);
    const name = at === -1 ? value : value.slice(0, at);
    const key = name.toLowerCase();
    if (!ALLOWED_SSH_OPTIONS.has(key)) {
      problems.push(`option not allowed: -o ${value}`);
      continue;
    }
    if (seen.has(key)) problems.push(`option given twice: -o ${value}`);
    seen.add(key);
    options[name] = at === -1 ? '' : value.slice(at + 1);
  }
  return { problems, options };
};

// The rule above, on made-up argument lists: the clean one passes, and every
// way found (26.1015, review of PR #179) to outvote or sidestep
// StrictHostKeyChecking=yes is refused.
test('the ssh argument rule refuses repeated, unknown and glued options, and -F <file>', () => {
  const clean = [
    '-F',
    '/dev/null',
    '-T',
    '-i',
    '/tmp/deploy-ssh.X/key',
    '-o',
    'IdentitiesOnly=yes',
    '-o',
    'BatchMode=yes',
    '-o',
    'StrictHostKeyChecking=yes',
    '-o',
    'UserKnownHostsFile=/tmp/deploy-ssh.X/known_hosts',
    '-o',
    'GlobalKnownHostsFile=/dev/null',
    '-o',
    'ConnectTimeout=30',
    '-o',
    'ServerAliveInterval=30',
    'deployer@203.0.113.7',
    'bash -s',
  ];
  expect(sshArgsProblems(clean).problems).toEqual([]);
  // Each bad list is the clean one with something put in front of
  // `-o StrictHostKeyChecking=yes` (where ssh would read it first), or with
  // the -F file swapped.
  const strict = clean.indexOf('StrictHostKeyChecking=yes') - 1;
  const before = (...args) => [
    ...clean.slice(0, strict),
    ...args,
    ...clean.slice(strict),
  ];
  const bad = {
    'the same option again, other case': before(
      '-o',
      'stricthostkeychecking=no',
    ),
    'the space form': before('-o', 'StrictHostKeyChecking no'),
    'a glued -o': before('-oStrictHostKeyChecking=no'),
    KnownHostsCommand: before('-o', 'KnownHostsCommand=/bin/echo %H %t %K'),
    ProxyCommand: before('-o', 'ProxyCommand=nc %h %p'),
    '-F another file': ['-F', '~/cfg', ...clean.slice(2)],
  };
  Object.entries(bad).forEach(([why, argv]) =>
    expect([why, sshArgsProblems(argv).problems.length > 0]).toEqual([
      why,
      true,
    ]),
  );
});

describe.each(DEPLOYS)('%s, step "%s"', (file, name, secret) => {
  test('the step is a plain run block, and the env names its own host-key secret', () => {
    const { run, remote, env } = readStep(file, name);
    expect(run).not.toBeNull();
    expect(remote).not.toBeNull();
    expect(env.DEPLOY_HOST_KEY).toBe(`\${{ secrets.${secret} }}`);
    expect(env.HOST_KEY_SECRET).toBe(secret);
    expect(env.REMOTE_SCRIPT).toBe('|');
  });

  test('the step needs no file from the checkout (a rollback checks out an older commit)', () => {
    const { run } = readStep(file, name);
    expect(run).not.toBeNull();
    // No repo script, no relative path, no workspace path.
    expect(run).not.toMatch(/scripts\/|\.\/|GITHUB_WORKSPACE/);
  });

  test('the ssh step refuses to run without a host key', () => {
    const { result, output, saved } = runStep(file, name, {
      DEPLOY_HOST_KEY: '',
    });
    expect(result.status).not.toBe(0);
    expect(result.signal).toBeNull();
    // ssh was never called, and the error says which secret is missing.
    expect(saved('argv')).toBeNull();
    expect(output).toMatch(/::error::/);
    expect(output).toContain(secret);
    expect(output).toMatch(/[Nn]othing was deployed/);
    expect(fs.readdirSync(runnerTemp)).toEqual([]);
  });

  test('ssh checks the host key strictly, against the pinned line only', () => {
    const { result, argv, saved } = runStep(file, name);
    expect(result.status).toBe(0);
    // Only the arguments on the list, each option once (ssh takes the FIRST
    // value of a repeated one), so nothing can outvote the values below.
    const { problems, options } = sshArgsProblems(argv);
    expect(problems).toEqual([]);
    expect(options).toEqual(
      expect.objectContaining({
        StrictHostKeyChecking: 'yes',
        BatchMode: 'yes',
        IdentitiesOnly: 'yes',
        GlobalKnownHostsFile: '/dev/null',
        ConnectTimeout: '30',
        ServerAliveInterval: '30',
      }),
    );
    expect(argv).toContain('-T');
    // No ssh config file is read (not the runner's ~/.ssh/config, not
    // /etc/ssh/ssh_config): the options above are the whole configuration.
    expect(argv.indexOf('-F')).toBeGreaterThan(-1);
    expect(argv[argv.indexOf('-F') + 1]).toBe('/dev/null');
    // The known_hosts file it was pointed at holds exactly the secret.
    expect(saved('known_hosts')).toBe(`${HOST_KEY_LINE}\n`);
    // The key it was given is the secret, readable by its owner only.
    expect(saved('key')).toBe(`${PRIVATE_KEY}\n`);
    expect(saved('key-mode')).toBe('-rw-------\n');
    // Who, where, and what runs there.
    expect(argv.slice(-2)).toEqual([`${USER}@${HOST}`, 'bash -s']);
  });

  test('the remote script goes over stdin, unchanged', () => {
    const { result, remote, saved } = runStep(file, name);
    expect(result.status).toBe(0);
    expect(saved('stdin')).toBe(remote);
  });

  test("the remote script's exit status is the step's", () => {
    expect(runStep(file, name, { FAKE_SSH_RC: '3' }).result.status).toBe(3);
    expect(runStep(file, name, { FAKE_SSH_RC: '0' }).result.status).toBe(0);
  });

  test('the key and known_hosts are removed when the step ends, pass or fail', () => {
    runStep(file, name, { FAKE_SSH_RC: '0' });
    expect(fs.readdirSync(runnerTemp)).toEqual([]);
    runStep(file, name, { FAKE_SSH_RC: '3' });
    expect(fs.readdirSync(runnerTemp)).toEqual([]);
  });

  test('the private key is never printed', () => {
    const { output } = runStep(file, name, { FAKE_SSH_RC: '3' });
    expect(output).not.toContain('not-a-real-key-deploy-ssh-test');
  });
});
