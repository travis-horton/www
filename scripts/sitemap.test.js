/*
 * The guard for sitemap.xml (26.1010).
 *
 * The sitemap is written at build time by scripts/gen-sitemap.mjs from one
 * list, src/data/public-pages.json. A list kept by hand drifts: a new blog
 * post or demo would be missing from the sitemap until someone remembered it.
 * So this test reads the site's REAL routers (App.jsx and the three section
 * routers) and fails, naming the address, when a routed public page is not on
 * the list, or when the list names a page no router serves. It walks into
 * pathless layout routes, and it matches each section by the component App
 * actually routes there (loading the lazy ones), not by its path.
 *
 * It also runs the generator and reads what it writes as XML, and proves the
 * generator refuses a list that would publish a private or impossible address
 * (/journal, both calendar routes, a drill page with a `:levelId`, a wildcard,
 * a query or fragment, white space, a path without a leading slash, a double
 * slash, a %-escape, a '.' or '..' segment, a duplicate, a page also in
 * "notIndexed"), and escapes the XML specials.
 *
 * The generator is plain Node (.mjs) and jest does not transform .mjs, so it
 * is never imported here: the test runs it with node, as the build does.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { lazy } from 'react';
import {
  Routes,
  Route,
  Navigate,
  createRoutesFromChildren,
} from 'react-router-dom';

import App from '../src/App';
import Programming from '../src/pages/Programming';
import Blog from '../src/pages/Blog';
import Learn from '../src/pages/Learn';
import Contact from '../src/pages/Contact';
import { CANONICAL_ORIGIN } from '../src/sharedComponents/DocumentHead';

const REPO = path.resolve(__dirname, '..');
const GENERATOR = path.join(REPO, 'scripts', 'gen-sitemap.mjs');
const LIST = path.join(REPO, 'src', 'data', 'public-pages.json');
const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const PRIVATE_PREFIXES = ['/journal', '/gcal-hook', '/gcal-drain'];

// Every '/x/*' route in App.jsx hands the rest of the address to a section
// router: the component it routes there. The walk follows THAT component, so
// a section path pointed at some other page fails instead of passing on the
// old router's pages. A new section router must be added here, or the walk
// fails (it cannot list pages it cannot see).
const SECTION_ROUTERS = new Set([Programming, Blog, Learn]);

const REACT_LAZY = Symbol.for('react.lazy');

/**
 * The component an element type stands for. Programming and Learn are
 * React.lazy in App.jsx, so the type App routes is a lazy wrapper, not the
 * component. React 19 keeps the loader on the wrapper: `_init(_payload)`
 * starts the import and throws the pending promise; once that has settled it
 * returns the module's default export, the same object this file imports.
 * The beforeAll below settles App's lazy routes first, so this stays
 * synchronous. Anything that does not resolve to a function gives null, and
 * walk() then throws naming the path: it fails closed, never skips. These are
 * React internals; an upgrade that changes them makes the walk throw loudly.
 */
function componentOf(type) {
  if (type?.$$typeof !== REACT_LAZY) return type;
  try {
    const resolved = type._init(type._payload);
    return typeof resolved === 'function' ? resolved : null;
  } catch {
    return null;
  }
}

/** Start every lazy route's import and wait for it, so componentOf() can read it. */
async function settleLazyRoutes(routes) {
  for (const route of routes) {
    const type = route.element?.type;
    if (type?.$$typeof === REACT_LAZY) {
      try {
        type._init(type._payload);
      } catch (pending) {
        if (typeof pending?.then === 'function') {
          await Promise.resolve(pending).catch(() => {});
        }
      }
    }
    if (route.children) await settleLazyRoutes(route.children);
  }
}

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
    if (p === undefined) {
      // A pathless layout route (<Route element={<Layout />}>) adds nothing
      // to the address: its children are pages at the same base.
      if (route.children) out.push(...walk(route.children, base));
      continue;
    }
    if (p === '*') continue; // the 404 pages
    const full = join(base, p);
    if (full.endsWith('/*')) {
      const section = componentOf(route.element?.type);
      if (!SECTION_ROUTERS.has(section)) {
        const what = section
          ? `<${section.name || 'an unnamed component'}>`
          : 'a component that does not load';
        throw new Error(
          `App.jsx routes the section "${full}" to ${what}, which ` +
            'scripts/sitemap.test.js does not know as a section router: ' +
            'add it to SECTION_ROUTERS',
        );
      }
      out.push(...walk(routesOf(section), full.slice(0, -2)));
      continue;
    }
    // Deliberate: a route with a `:param` (today the drill page per level,
    // not indexed) is never REQUIRED on the list by this walk, because it
    // stands for pages the walk cannot name. So if one ever serves public
    // pages (a future /blog/:slug, say), its real addresses must be added to
    // public-pages.json by hand; the generator refuses ':' so the pattern
    // itself can never be listed.
    if (full.includes(':')) continue;
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
  beforeAll(() => settleLazyRoutes(routesOf(App)));

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

  test('a section whose router SECTION_ROUTERS does not know fails by name', () => {
    expect(() => walk([{ path: '/shop/*', element: null }], '/')).toThrow(
      /"\/shop\/\*"/,
    );
  });

  test("a pathless layout route's children are walked with the same base", () => {
    // <Route element={<Layout />}> wraps pages without adding to the address.
    const routes = createRoutesFromChildren(
      <Route element={<div />}>
        <Route path="/brand-new-page" element={<Contact />} />
        <Route index element={<Contact />} />
      </Route>,
    );
    expect(walk(routes, '/')).toEqual(['/brand-new-page', '/']);
  });

  test('a section path re-pointed at another component fails by name', () => {
    expect(() =>
      walk([{ path: '/blog/*', element: <Contact /> }], '/'),
    ).toThrow(/"\/blog\/\*"/);
  });

  test('a section is walked by the component routed, under the routed path', () => {
    const walked = walk([{ path: '/blog/*', element: <Learn /> }], '/');
    expect(walked).toContain('/blog/toki-pona');
    expect(walked).not.toContain('/blog/js-this');
  });

  test('a lazy section that cannot be loaded fails by name, never skipped', () => {
    const NeverLoads = lazy(() => new Promise(() => {}));
    expect(() =>
      walk([{ path: '/blog/*', element: <NeverLoads /> }], '/'),
    ).toThrow(/"\/blog\/\*"/);
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
    // nginx normalises these shapes (to /journal, /piano) before it matches
    // a location, so the generator refuses the shape itself.
    ['a double slash', ['/', '//journal'], '//journal'],
    [
      'a percent-escape',
      ['/', '/%6Aournal/26/10/261010'],
      '/%6Aournal/26/10/261010',
    ],
    ['a dot-dot segment', ['/', '/x/../journal'], '/x/../journal'],
    ['a dot segment', ['/', '/./piano'], '/./piano'],
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
