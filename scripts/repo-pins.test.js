/**
 * @jest-environment node
 */
/*
 * What the build is allowed to pull in.
 *
 * These read the Dockerfile and the checks workflow as TEXT (no YAML parser)
 * and fail when a base image is named by a floating tag (`FROM node:latest`):
 * the same Dockerfile then builds a different site next month, with nothing in
 * the repo's history to say when or why.
 */
import fs from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '..');

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
