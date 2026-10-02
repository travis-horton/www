// Fails when the built site carries package.json.
//
//   node scripts/check-bundle.mjs <dist-dir>
//
// The footer once read its version with `import { version } from
// '../../../package.json'`, and the bundler answered by shipping the WHOLE file
// to every visitor: the dependency list, the test settings, the scripts. Nothing
// in it was secret, but none of it belonged on the site, and every edit to
// package.json changed the bundle's name. This looks for two of package.json's
// own key names in every built .js file; they appear nowhere else in the site.
//
// Exit 0: at least one .js file was found and none carries a marker.
// Exit 1: a marker was found (the file is named), or there was nothing to check.
// An empty or missing folder is a failure on purpose, so a build step that
// silently produced nothing can never look like a pass.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MARKERS = ['devDependencies', 'testPathIgnorePatterns'];

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/check-bundle.mjs <dist-dir>');
  process.exit(1);
}

function jsFilesUnder(folder) {
  const found = [];
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) found.push(...jsFilesUnder(path));
    else if (entry.isFile() && entry.name.endsWith('.js')) found.push(path);
  }
  return found.sort();
}

function count(text, word) {
  return text.split(word).length - 1;
}

let files;
try {
  files = jsFilesUnder(dir);
} catch (error) {
  console.error(`FAIL  cannot read ${dir}: ${error.message}`);
  process.exit(1);
}

if (files.length === 0) {
  console.error(
    `FAIL  no .js file under ${dir}: nothing was built, so nothing was checked`,
  );
  process.exit(1);
}

let failures = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const marker of MARKERS) {
    const hits = count(text, marker);
    if (hits > 0) {
      failures += 1;
      console.error(
        `FAIL  ${file} contains "${marker}" (${hits}x): package.json is in the bundle`,
      );
    }
  }
}

if (failures > 0) {
  console.error(
    `${failures} finding(s) in ${files.length} .js file(s). Something under src/ imports package.json; read the version from the build's environment instead.`,
  );
  process.exit(1);
}

console.log(
  `OK    ${files.length} .js file(s) under ${dir}, none carries package.json`,
);
