/*
 * Writes sitemap.xml, the list of pages search engines are told to read
 * (26.1010).
 *
 * Until now the sitemap was a file kept by hand (nginx/sitemap.xml). A list
 * kept by hand drifts: a new blog post, demo or course page would be missing
 * from it until someone remembered. Now the Docker build runs this script, and
 * the pages come from one list, src/data/public-pages.json:
 *   "pages"       the addresses to list, in the order they are listed;
 *   "notIndexed"  pages the routers serve that are deliberately left out.
 *
 * The guard is scripts/sitemap.test.js. It reads the site's real routers and
 * fails, naming the address, when a routed page is on neither list or a
 * listed page is not routed. So a new page must be added to one of the two
 * lists before the tests pass.
 *
 * This script refuses (exit 1, naming the address) any list that would publish
 * a private or impossible address: the journal, the calendar routes, a drill
 * page with a `:levelId`, a wildcard, a query or fragment, a double slash, a
 * %-escape, a '.' or '..' segment (nginx would normalise those three onto
 * another address, a private one included), a duplicate, or a page that is
 * also in "notIndexed". No <lastmod>: there is no truthful date
 * per page, and the field is optional in the sitemaps.org protocol.
 *
 *   node scripts/gen-sitemap.mjs <out-file>      write the file
 *   node scripts/gen-sitemap.mjs -               print it
 *   node scripts/gen-sitemap.mjs --pages <list.json> <out-file | ->
 *
 * Plain Node, no dependencies: it runs in the build stage before Parcel.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Must equal CANONICAL_ORIGIN in src/sharedComponents/DocumentHead (the
// canonical host). scripts/sitemap.test.js fails if the two differ.
const ORIGIN = 'https://www.travish.com';

// Never listed, at any depth: the journal answers 410, and the two calendar
// routes are capability URLs for Google's push channel.
const PRIVATE_PREFIXES = ['/journal', '/gcal-hook', '/gcal-drain'];

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_LIST = path.join(REPO, 'src', 'data', 'public-pages.json');

function fail(message) {
  process.stderr.write(`gen-sitemap: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  let list = DEFAULT_LIST;
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--pages') {
      list = argv[i + 1];
      if (!list) fail('--pages needs a file');
      i += 1;
    } else {
      rest.push(argv[i]);
    }
  }
  if (rest.length !== 1) {
    fail('usage: gen-sitemap.mjs [--pages <list.json>] <out-file | ->');
  }
  return { list, out: rest[0] };
}

function readList(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    fail(`cannot read ${file}: ${err.message}`);
  }
  const { pages, notIndexed = [] } = data ?? {};
  const strings = (xs) =>
    Array.isArray(xs) && xs.every((x) => typeof x === 'string');
  if (!strings(pages) || pages.length === 0) {
    fail(`${file}: "pages" must be a non-empty list of strings`);
  }
  if (!strings(notIndexed)) {
    fail(`${file}: "notIndexed" must be a list of strings`);
  }
  return { pages, notIndexed };
}

/** Why a path may not be listed, or null if it may. */
function problem(p, seen, notIndexed) {
  if (!p.startsWith('/')) return 'does not start with /';
  if (/[:*?#\s]/.test(p)) return 'holds one of : * ? # or white space';
  // nginx normalises an address before it matches a location: it merges
  // slashes, decodes %XX and resolves '.' and '..'. So //journal, /%6Aournal
  // and /x/../journal all reach /journal, and a text-only prefix check below
  // would let them through. No real page needs these shapes: refuse them
  // outright (fail closed). Three checks, so each can be removed alone.
  if (p.includes('//')) return 'holds an empty segment (//)';
  if (p.includes('%')) return 'holds a %-escape';
  if (p.split('/').some((s) => s === '.' || s === '..')) {
    return 'holds a . or .. segment';
  }
  for (const prefix of PRIVATE_PREFIXES) {
    if (p.startsWith(prefix)) return `is under the private ${prefix}`;
  }
  if (seen.has(p)) return 'is listed twice';
  if (notIndexed.has(p)) return 'is also in "notIndexed"';
  return null;
}

const escapeXml = (s) =>
  s.replace(
    /[&<>'"]/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&apos;',
        '"': '&quot;',
      })[c],
  );

function sitemap(pages) {
  const urls = pages.map(
    (p) => `  <url><loc>${escapeXml(`${ORIGIN}${p}`)}</loc></url>`,
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

const { list, out } = parseArgs(process.argv.slice(2));
const { pages, notIndexed } = readList(list);
const skipped = new Set(notIndexed);
const seen = new Set();
for (const p of pages) {
  const why = problem(p, seen, skipped);
  if (why) fail(`refusing "${p}": it ${why} (${list})`);
  seen.add(p);
}

const xml = sitemap(pages);
if (out === '-') process.stdout.write(xml);
else fs.writeFileSync(out, xml);
