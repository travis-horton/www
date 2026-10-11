/**
 * @jest-environment node
 */
/*
 * The chat's image must be one the servers can actually run.
 *
 * Both droplets run Docker 20.10.7. Its default seccomp filter refuses the
 * clone3 system call, which the glibc in Debian bookworm and trixie (and
 * Ubuntu 22.04+) uses to start threads. A Node image on one of those dies on
 * its first thread ("Assertion failed: (0) == (uv_thread_create(...))", exit
 * 139) and crash-loops, while passing CI, whose Docker is new. That is what
 * the chat's first sandbox deploy did (26.1010, run 38106216193). Alpine's C
 * library does not use clone3, so react-chat builds on node:*-alpine.
 *
 * This reads the submodule's Dockerfile as text. Once both droplets run
 * Docker 20.10.10 or newer (Praxis leaf "Upgrade the droplets off Docker
 * 20.10.7"), this test can go.
 */
import fs from 'fs';
import path from 'path';

const DOCKERFILE = path.resolve(
  __dirname,
  '..',
  'services',
  'react-chat',
  'Dockerfile',
);

test('the chat image is built on Alpine, which Docker 20.10.7 can run', () => {
  const froms = fs
    .readFileSync(DOCKERFILE, 'utf8')
    .split('\n')
    .filter((line) => /^FROM\s/i.test(line));
  expect(froms.length).toBeGreaterThan(0);
  for (const from of froms) {
    expect(from).toMatch(/^FROM\s+node:[^\s]*alpine/i);
  }
});
