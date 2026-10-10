/*
 * The guard for sitemap.xml (26.1010).
 *
 * The sitemap is written at build time by scripts/gen-sitemap.mjs from one
 * list, src/data/public-pages.json. A list kept by hand drifts: a new blog
 * post or demo would be missing from the sitemap until someone remembered it.
 * So this test reads the site's REAL routers (App.jsx and the three section
 * routers) and fails, naming the address, when a routed public page is not on
 * the list, or when the list names a page no router serves.
 *
 * It also runs the generator and reads what it writes as XML, and proves the
 * generator refuses a list that would publish a private or impossible address
 * (/journal, both calendar routes, a drill page with a `:levelId`, a wildcard,
 * a query or fragment, white space, a path without a leading slash, a
 * duplicate, a page also in "notIndexed"), and escapes the XML specials.
 *
 * The generator is plain Node (.mjs) and jest does not transform .mjs, so it
 * is never imported here: the test runs it with node, as the build does.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { Routes, Navigate, createRoutesFromChildren } from 'react-router-dom';

import App from '../src/App';
import Programming from '../src/pages/Programming';
import Blog from '../src/pages/Blog';
import Learn from '../src/pages/Learn';
import { CANONICAL_ORIGIN } from '../src/sharedComponents/DocumentHead';

const REPO = path.resolve(__dirname, '..');
const GENERATOR = path.join(REPO, 'scripts', 'gen-sitemap.mjs');
const LIST = path.join(REPO, 'src', 'data', 'public-pages.json');
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const PRIVATE_PREFIXES = ['/journal', '/gcal-hook', '/gcal-drain'];

// Every '/x/*' route in App.jsx hands the rest of the address to a section
// router. A new section must be added here, or the walk fails (it cannot
// list pages it cannot see).
const SECTIONS = {
  '/programming/*': Programming,
  '/blog/*': Blog,
  '/learn/*': Learn,
};

const readList = () => JSON.parse(fs.readFileSync(LIST, 'utf8'));

/** The <Routes> element somewhere inside a component's output. */
function findRoutes(node) {
  if (node == null || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findRoutes(child);
      if (found) return found;
    }
    return null;
  }
  if (node.type === Routes) return node;
  return findRoutes(node.props?.children);
}

/** The route objects a component declares, read the way the router reads them. */
function routesOf(Component) {
  const routesEl = findRoutes(Component());
  if (!routesEl) {
    throw new Error(`${Component.name || 'component'}: no <Routes> found`);
  }
  return createRoutesFromChildren(routesEl.props.children);
}

const join = (base, p) =>
  p.startsWith('/') ? p : `${base.replace(/\/$/, '')}/${p}`;

/** Every public address the routers serve, in router order. */
function walk(routes, base) {
  const out = [];
  for (const route of routes) {
    if (route.element?.type === Navigate) continue; // a redirect, not a page
    if (route.index) {
      out.push(base);
      continue;
    }
    const p = route.path;
    if (p === undefined || p === '*') continue; // the 404 pages
    const full = join(base, p);
    if (full.endsWith('/*')) {
      const section = SECTIONS[full];
      if (!section) {
        throw new Error(
          `App.jsx routes the section "${full}" but scripts/sitemap.test.js ` +
            'does not know its router: add it to SECTIONS',
        );
      }
      out.push(...walk(routesOf(section), full.slice(0, -2)));
      continue;
    }
    if (full.includes(':')) continue; // a drill page per level, not indexed
    if (route.children) out.push(...walk(route.children, full));
    else out.push(full);
  }
  return out;
}

function generate(args) {
  return spawnSync(process.execPath, [GENERATOR, ...args], {
    encoding: 'utf8',
  });
}

describe('the router walk', () => {
  test('every routed public page is on the list, and only those', () => {
    const walked = walk(routesOf(App), '/');
    const { pages, notIndexed } = readList();
    const listed = new Set([...pages, ...notIndexed]);
    const routed = new Set(walked);

    const missing = walked.filter((p) => !listed.has(p));
    const extra = [...listed].filter((p) => !routed.has(p));
    expect({ missingFromList: missing, notRouted: extra }).toEqual({
      missingFromList: [],
      notRouted: [],
    });
  });

  test('it skips the 404s, the /clock redirect and the drill pages', () => {
    const walked = walk(routesOf(App), '/');
    expect(walked).not.toContain('/clock');
    expect(walked.some((p) => p.includes('*') || p.includes(':'))).toBe(false);
    expect(new Set(walked).size).toBe(walked.length);
  });

  test('a section App routes but SECTIONS does not know fails by name', () => {
    expect(() => walk([{ path: '/shop/*', element: null }], '/')).toThrow(
      /"\/shop\/\*"/,
    );
  });
});

describe('the generated sitemap.xml', () => {
  const { pages, notIndexed } = fs.existsSync(LIST)
    ? readList()
    : { pages: [], notIndexed: [] };

  function parsed() {
    const run = generate(['-']);
    expect(run.stderr).toBe('');
    expect(run.status).toBe(0);
    return new DOMParser().parseFromString(run.stdout, 'application/xml');
  }

  test('is well-formed XML: a urlset in the sitemaps.org 0.9 namespace', () => {
    const doc = parsed();
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.documentElement.localName).toBe('urlset');
    expect(doc.documentElement.namespaceURI).toBe(SITEMAP_NS);
  });

  test('lists every page once, as the canonical https address', () => {
    const doc = parsed();
    const urls = [...doc.getElementsByTagNameNS(SITEMAP_NS, 'url')];
    const locs = urls.map((url) => {
      const loc = url.getElementsByTagNameNS(SITEMAP_NS, 'loc');
      expect(loc).toHaveLength(1);
      return loc[0].textContent;
    });
    expect(locs).toHaveLength(pages.length);
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs).toEqual(pages.map((p) => `${CANONICAL_ORIGIN}${p}`));
  });

  test('names no private and no unindexed page', () => {
    const locs = [...parsed().getElementsByTagNameNS(SITEMAP_NS, 'loc')].map(
      (loc) => loc.textContent,
    );
    for (const bad of [...PRIVATE_PREFIXES, ...notIndexed]) {
      expect(locs.filter((loc) => loc.includes(bad))).toEqual([]);
    }
  });
});

describe('the generator fails closed', () => {
  let dir;
  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'www-sitemap-test-'));
  });
  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const withList = (name, pages, notIndexed = []) => {
    const file = path.join(dir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify({ pages, notIndexed }));
    return generate(['--pages', file, '-']);
  };

  test('a good list passes (the control)', () => {
    const run = withList('good', ['/', '/piano'], ['/learn/x']);
    expect(run.status).toBe(0);
  });

  // Each refusal must NAME the offending address, so a refusal for some other
  // reason (a missing file, a crash) does not count as a pass. Each row trips
  // exactly one check, so removing any one check turns a row red.
  test.each([
    ['the journal', ['/', '/journal'], '/journal'],
    ['the calendar hook', ['/', '/gcal-hook/x'], '/gcal-hook/x'],
    ['the calendar drain', ['/', '/gcal-drain'], '/gcal-drain'],
    [
      'a drill page',
      ['/', '/learn/seximal/:levelId'],
      '/learn/seximal/:levelId',
    ],
    ['a bare wildcard', ['/', '*'], '*'],
    ['a wildcard inside a path', ['/', '/x*'], '/x*'],
    ['a query', ['/', '/a?b'], '/a?b'],
    ['a fragment', ['/', '/a#b'], '/a#b'],
    ['white space', ['/', '/a b'], '/a b'],
    ['a path without a leading slash', ['/', 'piano'], 'piano'],
    ['a duplicate', ['/', '/piano', '/piano'], '/piano'],
    ['a page also in notIndexed', ['/', '/piano'], '/piano', ['/piano']],
  ])('refuses %s', (name, pages, named, notIndexed = []) => {
    const run = withList(name.replace(/\W+/g, '-'), pages, notIndexed);
    expect(run.status).not.toBe(0);
    expect(run.stdout).toBe('');
    expect(run.stderr).toContain(`"${named}"`);
  });

  test('escapes the five XML special characters in an address', () => {
    const odd = `/a&b<c>d'e"f`;
    const run = withList('escape', ['/', odd]);
    expect(run.status).toBe(0);
    expect(run.stdout).toContain('/a&amp;b&lt;c&gt;d&apos;e&quot;f</loc>');
    const doc = new DOMParser().parseFromString(run.stdout, 'application/xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    const locs = [...doc.getElementsByTagNameNS(SITEMAP_NS, 'loc')];
    expect(locs.map((loc) => loc.textContent)).toEqual([
      `${CANONICAL_ORIGIN}/`,
      `${CANONICAL_ORIGIN}${odd}`,
    ]);
  });
});
