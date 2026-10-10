// Four checks on the built site: two about the footer's version, one about
// the built files' names, one about the Piano page's performances.
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
// 3. Every built file except index.html has a hash of its content in its name,
//    in the shape nginx/nginx.conf's built-files location matches (the pattern
//    is READ from that file, so the two cannot drift). That location tells
//    browsers to keep a file for a year without asking again, which is only
//    safe for a file whose name changes when its content does. A built file
//    the pattern does not take would be served by the pages' location instead:
//    never cached, and answered with the app's page when it is missing. So the
//    long-cache rule must cover every built file, and index.html (the one name
//    that never changes) must stay outside it.
//
// 4. No draft performance is in the bundle, and the public ones are. The Piano
//    page's list comes from src/data/performances.json, and once every visitor
//    downloaded the draft rows (with private notes) that the page only hid on
//    screen. The data file now holds public rows only, and a jest test says
//    so; this looks at what was actually BUILT, so a draft row that reached
//    the site another way is caught too. The public count must be above zero,
//    so a bundle the list fell out of cannot pass by finding nothing.
//
// Exit 0: all hold. Exit 1: one fails (the file or the missing string is
// named), or there was nothing to check. An empty or missing folder is a
// failure on purpose, so a build that silently produced nothing cannot pass.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const MARKERS = ['devDependencies', 'testPathIgnorePatterns'];
// 4. How a performance row's visibility reads in the built .js (the bundler
// keeps the JSON text as it is).
const DRAFT_ROW = '"visibility":"draft"';
const PUBLIC_ROW = '"visibility":"public"';
// The one built file whose name must NOT carry a hash.
const PAGE = 'index.html';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/check-bundle.mjs <dist-dir>');
  process.exit(1);
}

function filesUnder(folder) {
  const found = [];
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) found.push(...filesUnder(path));
    else if (entry.isFile()) found.push(path);
  }
  return found.sort();
}

function count(text, word) {
  return text.split(word).length - 1;
}

let everyFile;
try {
  everyFile = filesUnder(dir);
} catch (error) {
  console.error(`FAIL  cannot read ${dir}: ${error.message}`);
  process.exit(1);
}
const files = everyFile.filter((path) => path.endsWith('.js'));

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
let publicRows = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  versionSeen += count(text, wanted);
  publicRows += count(text, PUBLIC_ROW);
  const drafts = count(text, DRAFT_ROW);
  if (drafts > 0) {
    failures += 1;
    console.error(
      `FAIL  ${file} contains ${drafts} draft performance row(s) (${DRAFT_ROW}): every visitor would download them. src/data/performances.json must hold public rows only.`,
    );
  }
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

if (publicRows === 0) {
  failures += 1;
  console.error(
    `FAIL  no built .js file contains ${PUBLIC_ROW}: the Piano page's performances are not in the bundle, so the draft check above proved nothing.`,
  );
}

// 3. The names. The pattern comes from nginx.conf's one regex location.
const conf = readFileSync(
  new URL('../nginx/nginx.conf', import.meta.url),
  'utf8',
);
const patterns = [...conf.matchAll(/^\s*location\s+~\s+"([^"]+)"\s*\{/gm)].map(
  (match) => match[1],
);
let named = 0;
if (patterns.length !== 1) {
  failures += 1;
  console.error(
    `FAIL  nginx/nginx.conf has ${patterns.length} quoted \`location ~ "…"\` lines, and exactly one (the built files') is expected: the names could not be checked.`,
  );
} else {
  const built = new RegExp(patterns[0]);
  const addresses = everyFile.map(
    (path) => `/${relative(dir, path).split(sep).join('/')}`,
  );
  if (!addresses.includes(`/${PAGE}`)) {
    failures += 1;
    console.error(`FAIL  no ${PAGE} under ${dir}: there is no page to serve.`);
  }
  for (const address of addresses) {
    if (address === `/${PAGE}`) {
      if (built.test(address)) {
        failures += 1;
        console.error(
          `FAIL  ${address} fits the built files' pattern: the page itself would be kept for a year.`,
        );
      }
    } else if (!built.test(address)) {
      failures += 1;
      console.error(
        `FAIL  ${address} has no hash of its content in its name (it does not fit ${patterns[0]} from nginx/nginx.conf). It would be served with no long cache, and answered with the app's page when it is missing.`,
      );
    } else {
      named += 1;
    }
  }
}

if (failures > 0) {
  console.error(
    `${failures} finding(s) in ${everyFile.length} built file(s), ${files.length} of them .js.`,
  );
  process.exit(1);
}

console.log(
  `OK    ${files.length} .js file(s) under ${dir}: none carries package.json, and "${wanted}" is there (${versionSeen}x)`,
);
console.log(
  `OK    ${named} built file(s) besides ${PAGE} carry a hash of their content in their name; ${PAGE} does not`,
);
console.log(
  `OK    ${publicRows} public performance row(s) in the bundle, and no draft row`,
);
