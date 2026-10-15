/**
 * @jest-environment node
 */
/*
 * The visit log's rotation, read as TEXT on any laptop (no logrotate, no
 * docker, no nginx here).
 *
 * nginx/nginx.conf writes one line per page visit to a file that is
 * bind-mounted from the droplet, so it outlives every deploy. Nothing ever
 * trimmed it. nginx/visits.logrotate is the droplet's logrotate rule for it,
 * installed by hand as /etc/logrotate.d/www-visits (README, "visit log"). It
 * runs on the HOST, not in the image, so no deploy and no GitHub check ever
 * reads it. This file is the only thing that does.
 *
 * What it guards, and why each one matters:
 *
 * 1. THE PATH. logrotate on the host must name the file where the HOST sees
 *    it, which is the bind mount's host side, not the path nginx uses inside
 *    the container. The two are the same today, so a slip would not show
 *    until somebody moved one of them, and then logrotate's `missingok` would
 *    skip the file in silence, every month, forever. So the right path is
 *    never written in this test. It is worked out from the files that decide
 *    it: the `access_log … visits` line of nginx.conf, and the `-v HOST:DIR`
 *    mount of BOTH site containers (`web` and `www_web`) in BOTH deploy
 *    workflows. They all have to agree.
 *
 * 2. HOW LONG IT KEEPS THINGS. Every line holds a visitor's IP address, which
 *    is personal data. Rotation is monthly and the number of old files kept is
 *    bounded by MAX_RETENTION_DAYS below, so the oldest IP on the disk is at
 *    most about four months old.
 *
 * 3. HOW NGINX KEEPS WRITING AFTERWARDS. Two nginx processes, one in each
 *    container, hold the file open at once. The usual recipe (rename the file,
 *    `create` a new one, signal nginx to reopen) would need a signal to BOTH
 *    containers by name, and it would fail during a deploy, when they are
 *    being replaced. Miss one, and that container keeps writing into the
 *    renamed file. `www_web`, which serves the canonical www.travish.com and
 *    so gets most of the visits, would be writing into visits.log.1 and then
 *    into a compressed file nobody reads. `copytruncate` copies the file and
 *    then cuts the original to zero in place, and that is safe here because
 *    nginx opens its access logs with O_APPEND: every write goes to the
 *    current end of the file, so after the cut both containers simply carry
 *    on at the new end, with no signal at all. The cost is a moment between
 *    the copy and the cut where a line can be lost, once a month. Acceptable.
 *    So: `copytruncate` is required, and `create` and every script hook are
 *    refused.
 *
 * Each check has a NEGATIVE control at the bottom: a broken config or a
 * changed workflow, run through the same checker, that must be reported. They
 * show the checker can see each mistake, not just that a file exists.
 */
import fs from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(REPO, ...parts), 'utf8');

const CONFIG = path.join('nginx', 'visits.logrotate');
const WORKFLOWS = ['deploy-to-dev.yml', 'deploy-to-prod.yml'];
// The two site containers. Both serve the site from one image, so both write
// visits (www_web most of them).
const SITE_CONTAINERS = ['web', 'www_web'];

// 🔒 Privacy bound. Lines hold visitor IPs. The current file plus the old ones
// kept may span at most this many days: the month being written plus three
// old months, at 31 days each. Raising it is a decision about how long to keep
// people's addresses, so it belongs in a PR of its own, said in plain words.
const MAX_RETENTION_DAYS = 124;
// The longest a file can grow before it is rotated, by period. Only `monthly`
// is accepted (see below); the others are listed so the message can say what
// was written instead.
const PERIOD_DAYS = {
  hourly: 1,
  daily: 1,
  weekly: 7,
  monthly: 31,
  yearly: 366,
};
// logrotate script hooks: each opens a shell script that runs to `endscript`.
const SCRIPT_HOOKS = new Set([
  'prerotate',
  'postrotate',
  'firstaction',
  'lastaction',
  'preremove',
]);
// Must all be present. missingok: no error before the first visit ever lands.
// notifempty: a quiet month does not cost one of the three old files.
// compress + delaycompress: old files are gzipped, except the newest one,
// which stays plain for one more month so it is easy to read.
const REQUIRED = [
  'copytruncate',
  'missingok',
  'notifempty',
  'compress',
  'delaycompress',
];
// Every directive the rule may hold. Anything else is reported, so a new one
// is a choice somebody makes here, with a reason, and not a drive-by.
const ALLOWED = new Set([...Object.keys(PERIOD_DAYS), 'rotate', ...REQUIRED]);

/*
 * A small reader for logrotate's config syntax: `#` starts a comment line; a
 * header of one or more paths ends with `{`; then one directive per line; `}`
 * on its own line closes the block. A script hook (postrotate …) runs to a
 * line that says `endscript`, and nothing inside it is read as a directive.
 *
 * Returns { blocks: [{ paths, directives: [{ name, args, line }], scripts,
 * line }], outside: [{ name, line }], errors: [string] }.
 */
function readLogrotate(text) {
  const blocks = [];
  const outside = [];
  const errors = [];
  let block = null;
  let script = null;
  text.split('\n').forEach((raw, index) => {
    const line = raw.trim();
    const at = index + 1;
    if (script) {
      if (line === 'endscript') script = null;
      return;
    }
    if (line === '' || line.startsWith('#')) return;
    if (block === null) {
      if (line.endsWith('{')) {
        const paths = line
          .slice(0, -1)
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((p) => p.replace(/^["']|["']$/g, ''));
        block = { paths, directives: [], scripts: [], line: at };
      } else {
        outside.push({ name: line.split(/\s+/)[0], line: at });
      }
      return;
    }
    if (line === '}') {
      blocks.push(block);
      block = null;
      return;
    }
    const [name, ...args] = line.split(/\s+/);
    if (SCRIPT_HOOKS.has(name)) {
      script = { name, line: at };
      block.scripts.push(script);
      return;
    }
    block.directives.push({ name, args, line: at });
  });
  if (script)
    errors.push(`line ${script.line}: ${script.name} never reaches endscript`);
  if (block)
    errors.push(`line ${block.line}: the block is never closed with }`);
  return { blocks, outside, errors };
}

// The visit log's path INSIDE the container: the `access_log <path> visits`
// line of nginx.conf (comment lines skipped).
function visitLogInContainer(nginxConf) {
  const found = nginxConf
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .map((line) => line.match(/^\s*access_log\s+(\S+)\s+visits(?:\s|;)/))
    .filter(Boolean)
    .map((match) => match[1]);
  return found;
}

// Every `docker create|run … --name NAME …` in a workflow, with its `-v`
// mounts. A command that runs over several lines (each ending in `\`) is read
// as one.
function containers(workflowText) {
  const joined = workflowText.replace(/\\\n\s*/g, ' ');
  const out = [];
  joined.split('\n').forEach((line) => {
    if (line.trim().startsWith('#')) return;
    if (!/\bdocker\s+(create|run)\b/.test(line)) return;
    const name = line.match(/--name[\s=]+(\S+)/);
    if (!name) return;
    const mounts = [
      ...line.matchAll(/(?:^|\s)(?:-v|--volume)[\s=]+(\S+)/g),
    ].map((m) => {
      const [host, inside] = m[1].replace(/^["']|["']$/g, '').split(':');
      return { host, inside };
    });
    out.push({ name: name[1], mounts });
  });
  return out;
}

/*
 * Where the visit log is ON THE HOST, worked out from nginx.conf and the
 * deploy workflows. Returns { hostPath, problems }; hostPath is null when the
 * files do not agree on one answer.
 */
function hostVisitLog({ nginxConf, workflows }) {
  const problems = [];
  const inContainer = visitLogInContainer(nginxConf);
  if (inContainer.length !== 1) {
    problems.push(
      `nginx.conf: expected exactly one "access_log <path> visits" line, found ${inContainer.length}`,
    );
    return { hostPath: null, problems };
  }
  const dir = path.posix.dirname(inContainer[0]);
  const file = path.posix.basename(inContainer[0]);
  const hostDirs = new Set();
  Object.entries(workflows).forEach(([workflow, text]) => {
    const made = containers(text);
    SITE_CONTAINERS.forEach((name) => {
      const runs = made.filter((c) => c.name === name);
      if (runs.length === 0) {
        problems.push(
          `${workflow}: no "docker create/run --name ${name}" found`,
        );
        return;
      }
      runs.forEach((run) => {
        const mount = run.mounts.find((m) => m.inside === dir);
        if (!mount) {
          problems.push(
            `${workflow}: container ${name} has no -v mount for ${dir}, so its visits never reach the host file`,
          );
          return;
        }
        hostDirs.add(mount.host);
      });
    });
  });
  if (hostDirs.size > 1) {
    problems.push(
      `the deploy workflows mount different host directories for ${dir}: ${[...hostDirs].join(', ')}`,
    );
  }
  if (problems.length || hostDirs.size === 0)
    return { hostPath: null, problems };
  return { hostPath: `${[...hostDirs][0]}/${file}`, problems };
}

/*
 * Every problem with a logrotate config for the visit log, as sentences. []
 * means it is right. `nginxConf` and `workflows` ({ name: text }) are what the
 * path is worked out from.
 */
function problems(configText, { nginxConf, workflows }) {
  const found = [];
  const { blocks, outside, errors } = readLogrotate(configText);
  found.push(...errors);
  outside.forEach((d) =>
    found.push(
      `line ${d.line}: "${d.name}" sits outside the block; in /etc/logrotate.d it would change every rule read after it`,
    ),
  );
  if (blocks.length !== 1) {
    found.push(`expected exactly one block, found ${blocks.length}`);
    return found;
  }
  const [block] = blocks;

  // 1. The path.
  const where = hostVisitLog({ nginxConf, workflows });
  found.push(...where.problems);
  if (where.hostPath) {
    const named = block.paths.join(' ');
    if (named !== where.hostPath) {
      found.push(
        `the block names "${named}", but the visit log is ${where.hostPath} on the host (from nginx.conf + the deploy mounts)`,
      );
    }
  }

  const names = block.directives.map((d) => d.name);
  const has = (name) => names.includes(name);

  // 2. How long it keeps things.
  const periods = names.filter((n) => n in PERIOD_DAYS);
  if (periods.length !== 1) {
    found.push(
      `expected exactly one rotation period (monthly), found ${periods.length ? periods.join(' + ') : 'none'}`,
    );
  } else if (periods[0] !== 'monthly') {
    found.push(`the rotation period is ${periods[0]}; it must be monthly`);
  }
  const rotates = block.directives.filter((d) => d.name === 'rotate');
  const kept = rotates.length === 1 ? Number(rotates[0].args[0]) : NaN;
  if (rotates.length !== 1) {
    found.push(`expected exactly one "rotate N", found ${rotates.length}`);
  } else if (!Number.isInteger(kept) || kept < 1) {
    found.push(
      `"rotate ${rotates[0].args.join(' ')}" must keep at least one old file`,
    );
  }
  if (periods.length === 1 && Number.isInteger(kept) && kept >= 1) {
    const days = PERIOD_DAYS[periods[0]] * (kept + 1);
    if (days > MAX_RETENTION_DAYS) {
      found.push(
        `${periods[0]} + rotate ${kept} keeps up to ${days} days of visitor IPs; the limit is ${MAX_RETENTION_DAYS}`,
      );
    }
  }

  // 3. How nginx keeps writing afterwards.
  if (has('create')) {
    found.push(
      '"create" makes a new file after a rename: both containers would keep writing to the old one (use copytruncate)',
    );
  }
  block.scripts.forEach((s) =>
    found.push(
      `line ${s.line}: a ${s.name} script; no signal is needed with copytruncate, and one aimed at the containers fails mid-deploy`,
    ),
  );

  REQUIRED.forEach((name) => {
    if (!has(name)) found.push(`"${name}" is missing`);
  });
  names
    .filter((name) => !ALLOWED.has(name) && name !== 'create')
    .forEach((name) =>
      found.push(`"${name}" is not an expected directive for this rule`),
    );
  return found;
}

const realContext = () => ({
  nginxConf: read('nginx', 'nginx.conf'),
  workflows: Object.fromEntries(
    WORKFLOWS.map((name) => [name, read('.github', 'workflows', name)]),
  ),
});

describe('nginx/visits.logrotate (the droplet keeps about four months of visits)', () => {
  test('the config file exists', () => {
    const present = fs.existsSync(path.join(REPO, CONFIG));
    expect(present ? 'present' : `${CONFIG} is missing`).toBe('present');
  });

  test('the shipped config has no problems (positive control)', () => {
    expect(problems(read(CONFIG), realContext())).toEqual([]);
  });

  test('nginx.conf points at the rotation rule, so a path change finds its partner', () => {
    const named = read('nginx', 'nginx.conf').includes(CONFIG);
    expect(named ? 'named' : `nginx.conf never mentions ${CONFIG}`).toBe(
      'named',
    );
  });

  test('the host path is worked out from nginx.conf and both deploy workflows', () => {
    const where = hostVisitLog(realContext());
    expect(where.problems).toEqual([]);
    const [inContainer] = visitLogInContainer(realContext().nginxConf);
    expect(path.posix.basename(where.hostPath)).toBe(
      path.posix.basename(inContainer),
    );
  });

  test('the shipped retention is inside the privacy bound', () => {
    const { blocks } = readLogrotate(read(CONFIG));
    const rotate = blocks[0].directives.find((d) => d.name === 'rotate');
    expect(
      PERIOD_DAYS.monthly * (Number(rotate.args[0]) + 1),
    ).toBeLessThanOrEqual(MAX_RETENTION_DAYS);
  });
});

/*
 * The negative controls. GOOD is a correct rule written here (not read from
 * the shipped file), so these run, and mean the same thing, even before the
 * shipped file exists. Each case breaks ONE thing and names the problem it
 * must produce.
 */
describe('the checker sees each mistake (negative controls)', () => {
  const real = realContext();
  const [inContainer] = visitLogInContainer(real.nginxConf);
  const dir = path.posix.dirname(inContainer);
  const goodPath = hostVisitLog(real).hostPath;
  const GOOD = [
    '# a correct rule',
    `${goodPath} {`,
    '    monthly',
    '    rotate 3',
    '    copytruncate',
    '    compress',
    '    delaycompress',
    '    missingok',
    '    notifempty',
    '}',
    '',
  ].join('\n');

  // Replace text, and fail loudly if the text was not there: a mutation that
  // changes nothing would make its case pass for the wrong reason.
  const swap = (text, from, to, all = false) => {
    const next = all ? text.split(from).join(to) : text.replace(from, to);
    if (next === text)
      throw new Error(`fixture mutation found nothing to change: ${from}`);
    return next;
  };
  // Drop the visit-log mount from one container's command in one workflow.
  const dropMount = (text, name) => {
    const at = text.indexOf(`--name ${name} `);
    if (at < 0) throw new Error(`no --name ${name} in the workflow`);
    const d = dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mount = new RegExp(`\\s+-v ${d}:${d}\\s*\\\\?`);
    return text.slice(0, at) + swap(text.slice(at), mount, '');
  };
  const withWorkflows = (change) => ({
    nginxConf: real.nginxConf,
    workflows: Object.fromEntries(
      Object.entries(real.workflows).map(([name, text]) => [
        name,
        change(name, text),
      ]),
    ),
  });
  // Both workflows mount a different host directory onto the same place.
  const movedHost = withWorkflows((_, text) =>
    swap(text, `-v ${dir}:`, '-v /srv/visits:', true),
  );

  test('GOOD itself has no problems (so each case below fails for its own reason)', () => {
    expect(problems(GOOD, real)).toEqual([]);
  });

  test('the path follows the mounts: GOOD moved to the new host directory is clean again', () => {
    const moved = swap(
      GOOD,
      goodPath,
      `/srv/visits/${path.posix.basename(goodPath)}`,
    );
    expect(problems(moved, movedHost)).toEqual([]);
  });

  test.each([
    [
      'the wrong path (/var/log/nginx/visits.log)',
      () => swap(GOOD, goodPath, '/var/log/nginx/visits.log'),
      () => real,
      /the block names "\/var\/log\/nginx\/visits\.log"/,
    ],
    [
      "the container's path where the host's should be",
      () => GOOD,
      () => movedHost,
      /visit log is \/srv\/visits\/visits\.log on the host/,
    ],
    [
      'copytruncate dropped',
      () => swap(GOOD, '    copytruncate\n', ''),
      () => real,
      /"copytruncate" is missing/,
    ],
    [
      'create + postrotate in place of copytruncate',
      () =>
        swap(
          GOOD,
          '    copytruncate\n',
          '    create 0640 root root\n    postrotate\n        docker exec web nginx -s reopen\n    endscript\n',
        ),
      () => real,
      /"create" makes a new file/,
    ],
    [
      'monthly + rotate 12 (a year of IPs)',
      () => swap(GOOD, 'rotate 3', 'rotate 12'),
      () => real,
      /keeps up to 403 days of visitor IPs/,
    ],
    [
      'no rotation period',
      () => swap(GOOD, '    monthly\n', ''),
      () => real,
      /exactly one rotation period \(monthly\), found none/,
    ],
    [
      'daily and monthly together',
      () => swap(GOOD, '    monthly\n', '    daily\n    monthly\n'),
      () => real,
      /found daily \+ monthly/,
    ],
    [
      'www_web has no visit-log mount (deploy-to-prod.yml)',
      () => GOOD,
      () =>
        withWorkflows((name, text) =>
          name === 'deploy-to-prod.yml' ? dropMount(text, 'www_web') : text,
        ),
      /deploy-to-prod\.yml: container www_web has no -v mount/,
    ],
    [
      'web has no visit-log mount (deploy-to-dev.yml)',
      () => GOOD,
      () =>
        withWorkflows((name, text) =>
          name === 'deploy-to-dev.yml' ? dropMount(text, 'web') : text,
        ),
      /deploy-to-dev\.yml: container web has no -v mount/,
    ],
    [
      'the two workflows mount different host directories',
      () => GOOD,
      () =>
        withWorkflows((name, text) =>
          name === 'deploy-to-prod.yml'
            ? swap(text, `-v ${dir}:`, '-v /srv/visits:', true)
            : text,
        ),
      /mount different host directories/,
    ],
    [
      'nginx writes the visit log somewhere else',
      () => GOOD,
      () => ({
        ...real,
        nginxConf: swap(real.nginxConf, inContainer, `${dir}/pages.log`, true),
      }),
      /visit log is .*\/pages\.log on the host/,
    ],
    [
      'weekly instead of monthly',
      () => swap(GOOD, 'monthly', 'weekly'),
      () => real,
      /period is weekly; it must be monthly/,
    ],
    [
      'rotate 0',
      () => swap(GOOD, 'rotate 3', 'rotate 0'),
      () => real,
      /must keep at least one/,
    ],
    [
      'compress dropped',
      () => swap(GOOD, '    compress\n', ''),
      () => real,
      /"compress" is missing/,
    ],
    [
      'a directive outside the block',
      () => `compress\n${GOOD}`,
      () => real,
      /"compress" sits outside the block/,
    ],
    [
      'an unexpected directive (su)',
      () => swap(GOOD, '    monthly\n', '    monthly\n    su root root\n'),
      () => real,
      /"su" is not an expected directive/,
    ],
    [
      'a postrotate that never reaches endscript',
      () => swap(GOOD, '    notifempty\n', '    notifempty\n    postrotate\n'),
      () => real,
      /postrotate never reaches endscript/,
    ],
  ])('%s', (_, config, context, expected) => {
    const found = problems(config(), context());
    expect(found.length).toBeGreaterThan(0);
    expect(found.join('\n')).toMatch(expected);
  });
});
