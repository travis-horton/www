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

// The `-o Name=value` options ssh was given, as { Name: value }.
const optionsOf = (argv) => {
  const options = {};
  argv.forEach((arg, i) => {
    if (argv[i - 1] !== '-o') return;
    const at = arg.indexOf('=');
    options[arg.slice(0, at)] = arg.slice(at + 1);
  });
  return options;
};

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
    const options = optionsOf(argv);
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
