/*
 * Small readers for the workflow files, read as TEXT (no YAML parser), shared
 * by the tests that check the deploy steps (repo-pins, deploy-ssh,
 * deploy-dev-reload). Not a test file itself: jest only runs *.test.js.
 *
 * They understand just the shapes the deploy workflows use: steps that start
 * with a bare `-` line, `key: value` lines, and `key: |` block scalars.
 */
import fs from 'fs';

export const linesOfFile = (file) => fs.readFileSync(file, 'utf8').split('\n');

const indentOf = (line) => /^(\s*)/.exec(line)[1].length;
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The lines of the step called `name`: from its `name:` line up to the next
// bare `-` (the start of the next step), or the end of the file. [] if there
// is no such step.
export const stepLines = (lines, name) => {
  const nameLine = new RegExp(`^\\s*name:\\s*${escapeRegExp(name)}\\s*$`);
  const at = lines.findIndex((line) => nameLine.test(line));
  if (at === -1) return [];
  let end = lines.length;
  for (let i = at + 1; i < lines.length; i += 1) {
    if (/^\s*-\s*$/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(at, end);
};

// The text of the first `key: |` block scalar in `lines`, as YAML gives it to
// the program: the common indent taken off, trailing blank lines dropped, one
// final newline. null when there is no such block.
export const blockScalar = (lines, key) => {
  const head = new RegExp(`^(\\s*)${escapeRegExp(key)}:\\s*\\|\\s*$`);
  const start = lines.findIndex((line) => head.test(line));
  if (start === -1) return null;
  const keyIndent = indentOf(lines[start]);
  const first = lines.findIndex((line, i) => i > start && line.trim() !== '');
  if (first === -1 || indentOf(lines[first]) <= keyIndent) return null;
  const indent = indentOf(lines[first]);
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === '') {
      body.push('');
      continue;
    }
    if (indentOf(line) < indent) break;
    body.push(line.slice(indent));
  }
  while (body.length && body[body.length - 1] === '') body.pop();
  return `${body.join('\n')}\n`;
};

// The step's `env:` block as { NAME: 'value as written' }. A block-scalar
// entry (`NAME: |`) is listed with the value '|'; read it with blockScalar.
export const envOf = (step) => {
  const start = step.findIndex((line) => /^\s*env:\s*$/.test(line));
  if (start === -1) return {};
  const envIndent = indentOf(step[start]);
  const env = {};
  let entryIndent = null;
  for (let i = start + 1; i < step.length; i += 1) {
    const line = step[i];
    if (line.trim() === '' || /^\s*#/.test(line)) continue;
    const indent = indentOf(line);
    if (indent <= envIndent) break;
    if (entryIndent === null) entryIndent = indent;
    if (indent !== entryIndent) continue;
    const entry = /^\s*([A-Za-z_][A-Za-z0-9_]*):\s*(.*?)\s*$/.exec(line);
    if (entry) env[entry[1]] = entry[2];
  }
  return env;
};
