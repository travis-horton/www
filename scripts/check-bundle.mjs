// Two checks on the built site, both about the footer's version.
//
//   node scripts/check-bundle.mjs <dist-dir>
//
// 1. package.json is NOT in the bundle. The footer once read its version with
//    `import { version } from '../../../package.json'`, and the bundler
//    answered by shipping the WHOLE file to every visitor: the dependency list,
//    the test settings, the scripts. Nothing in it was secret, but none of it
//    belonged on the site, and every edit to package.json changed the bundle's
//    name. This looks for two of package.json's own key names in every built
//    .js file; they appear nowhere else in the site.
//
// 2. The version IS in the bundle. The footer now takes it from the build's
//    environment (APP_VERSION, else npm_package_version). The bundler writes
//    those in only because package.json's "@parcel/transformer-js" setting
//    lists them: Parcel skips every npm_* name otherwise, WITHOUT an error, and
//    the footer would say v0.0.0 while every test stayed green (the tests read
//    the environment as they run; only a real build shows what was written
//    in). So this looks for "v<version>+" in the built .js, where <version> is
//    APP_VERSION if the build was given one and package.json's otherwise.
//
// Exit 0: both hold. Exit 1: either fails (the file or the missing string is
// named), or there was nothing to check. An empty or missing folder is a
// failure on purpose, so a build that silently produced nothing cannot pass.
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

const packageVersion = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;
const wanted = `v${process.env.APP_VERSION || packageVersion}+`;

let failures = 0;
let versionSeen = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  versionSeen += count(text, wanted);
  for (const marker of MARKERS) {
    const hits = count(text, marker);
    if (hits > 0) {
      failures += 1;
      console.error(
        `FAIL  ${file} contains "${marker}" (${hits}x): package.json is in the bundle. Something under src/ imports it; read the version from the build's environment instead.`,
      );
    }
  }
}

// Only asked once the first check passes: with package.json in the bundle the
// version sits inside that file's text, in another shape, and this message
// would point the wrong way.
if (failures === 0 && versionSeen === 0) {
  failures += 1;
  console.error(
    `FAIL  no built .js file contains "${wanted}": the footer's version was not written into the bundle. Check that package.json's "@parcel/transformer-js" inlineEnvironment still lists npm_package_version and APP_VERSION, and that the build was started with npm.`,
  );
}

if (failures > 0) {
  console.error(`${failures} finding(s) in ${files.length} .js file(s).`);
  process.exit(1);
}

console.log(
  `OK    ${files.length} .js file(s) under ${dir}: none carries package.json, and "${wanted}" is there (${versionSeen}x)`,
);
