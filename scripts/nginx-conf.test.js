/**
 * @jest-environment node
 */
/*
 * The shape of nginx/nginx.conf, read as TEXT on any laptop (no nginx, no
 * docker). The image check on GitHub (scripts/image-smoke.sh) asks the running
 * container what it answers; this says WHY a change would break it, before a
 * push, and names the line.
 *
 * The trap these guard against: in nginx a block that has an `add_header` of
 * its own silently DROPS every `add_header` from the level above. There is no
 * error and no warning; the header is just not sent from that block. Both
 * calendar routes have an `add_header` of their own, so a security header set
 * once at the top of the server would be missing from exactly the two routes
 * nobody looks at in a browser. So the three headers live in one small file
 * (nginx/security-headers.conf) that every location includes for itself.
 *
 * And the cache rules: a built file (its name holds a hash of its content) may
 * be kept for a year, a page must be asked for again every time, and a built
 * file that is not there must be a real 404 that carries no cache header.
 */
import fs from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(REPO, ...parts), 'utf8');

const SNIPPET = '/etc/nginx/snippets/security-headers.conf';
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "frame-ancestors 'self'",
};
// A built file's address: `.<8 hex digits>.<extension>`, or that plus `.map`.
const BUILT = '\\.[0-9a-f]{8}\\.[a-z0-9]+(\\.map)?$';
const IMMUTABLE = 'public, max-age=31536000, immutable';
// Every location of the server, in the file's order.
const LOCATIONS = [
  '^~ /gcal-hook/',
  '^~ /gcal-drain/',
  '^~ /journal',
  `~ ${BUILT}`,
  '/',
];
// What each one says about caching. Only the two calendar routes say it with
// `always` (on their 404s too); `immutable` must NEVER have it, or the 404 for
// a missing built file would be kept for a year. /journal says nothing: its
// only answer is a 410, which is final (null = no Cache-Control line at all).
const CACHE_CONTROL = {
  '^~ /gcal-hook/': ['no-store', 'always'],
  '^~ /gcal-drain/': ['no-store', 'always'],
  '^~ /journal': null,
  [`~ ${BUILT}`]: [IMMUTABLE],
  '/': ['no-cache'],
};

/*
 * A small reader for nginx's config syntax, following nginx's own rules for
 * where a word ends: at white space, `;` or `{`. A `#` at the start of a word
 * opens a comment to the end of the line; a word that starts with a quote runs
 * to the matching quote, and braces inside it are text, not blocks. (That last
 * rule is why a regex holding `{8}` has to be written in quotes.)
 *
 * Returns a tree: [{ words: [{ text, quoted }], block: [...] | null }].
 */
function parse(text) {
  let at = 0;

  function readWord() {
    const first = text[at];
    if (first === '"' || first === "'") {
      let value = '';
      at += 1;
      while (at < text.length && text[at] !== first) {
        if (text[at] === '\\' && at + 1 < text.length) {
          value += text[at] + text[at + 1];
          at += 2;
        } else {
          value += text[at];
          at += 1;
        }
      }
      if (at >= text.length) throw new Error('a quote is never closed');
      at += 1;
      return { text: value, quoted: true };
    }
    let value = '';
    while (at < text.length && !/[\s;{]/.test(text[at])) {
      value += text[at];
      at += 1;
    }
    return { text: value, quoted: false };
  }

  function readBlock(depth) {
    const directives = [];
    let words = [];
    while (at < text.length) {
      const ch = text[at];
      if (/\s/.test(ch)) {
        at += 1;
      } else if (ch === '#') {
        while (at < text.length && text[at] !== '\n') at += 1;
      } else if (ch === ';') {
        at += 1;
        directives.push({ words, block: null });
        words = [];
      } else if (ch === '{') {
        at += 1;
        directives.push({ words, block: readBlock(depth + 1) });
        words = [];
      } else if (ch === '}') {
        if (depth === 0) throw new Error('a } closes nothing');
        if (words.length > 0) throw new Error('a directive is never ended');
        at += 1;
        return directives;
      } else {
        words.push(readWord());
      }
    }
    if (depth > 0) throw new Error('a { is never closed');
    if (words.length > 0) throw new Error('a directive is never ended');
    return directives;
  }

  return readBlock(0);
}

const name = (directive) => (directive.words[0] || {}).text;
const args = (directive) => directive.words.slice(1).map((word) => word.text);

// Every directive called `wanted`, at any depth, with the blocks it sits in:
// [{ directive, inside: ['server', 'location /', 'if'] }].
function findAll(tree, wanted, inside = []) {
  const found = [];
  tree.forEach((directive) => {
    if (name(directive) === wanted) found.push({ directive, inside });
    if (directive.block) {
      const label =
        name(directive) === 'location'
          ? `location ${args(directive).join(' ')}`
          : name(directive);
      found.push(...findAll(directive.block, wanted, [...inside, label]));
    }
  });
  return found;
}

// A file the reader cannot follow reads as an empty one, and the first test
// below says why (the same reason nginx would refuse it).
let conf = [];
let confError = null;
try {
  conf = parse(read('nginx', 'nginx.conf'));
} catch (error) {
  confError = error.message;
}
const locations = findAll(conf, 'location');
const includesSnippet = (directive) =>
  name(directive) === 'include' && args(directive).join(' ') === SNIPPET;

describe('nginx.conf', () => {
  test('the reader itself: comments and quoted braces are not blocks', () => {
    const tree = parse(
      'a 1; # b { 2;\nlocation ~ "x{8}y" { c "d;e"; }\nf { g \'h}\'; }\n',
    );
    expect(tree.map(name)).toEqual(['a', 'location', 'f']);
    expect(tree[1].words[2]).toEqual({ text: 'x{8}y', quoted: true });
    expect(args(tree[1].block[0])).toEqual(['d;e']);
    expect(args(tree[2].block[0])).toEqual(['h}']);
    // An unquoted {8} is read the way nginx reads it: as the start of a block,
    // which then never closes.
    expect(() => parse('location ~ x{8}y { c 1; }\n')).toThrow(
      'a { is never closed',
    );
  });

  test('every quote and every brace in the file closes', () => {
    expect(confError).toBeNull();
  });

  test('the server has exactly the locations we think it has', () => {
    expect(findAll(conf, 'server')).toHaveLength(1);
    expect(locations.map(({ inside }) => inside)).toEqual(
      LOCATIONS.map(() => ['server']),
    );
    expect(locations.map(({ directive }) => args(directive).join(' '))).toEqual(
      LOCATIONS,
    );
  });

  test('every location includes the security headers, exactly once', () => {
    const counts = locations.map(({ directive }) => [
      args(directive).join(' '),
      directive.block.filter(includesSnippet).length,
    ]);
    expect(counts).toEqual(LOCATIONS.map((label) => [label, 1]));
    // And nowhere else: not at the top of the server, not inside an `if`.
    const anywhere = findAll(conf, 'include').filter(({ directive }) =>
      includesSnippet(directive),
    );
    expect(anywhere).toHaveLength(LOCATIONS.length);
  });

  test('no add_header sits where a location would silently drop it', () => {
    const headers = findAll(conf, 'add_header');
    // The scan saw the two that are there today (an empty list cannot pass).
    expect(headers.length).toBeGreaterThanOrEqual(2);
    const misplaced = headers
      .filter(
        ({ inside }) =>
          inside.length !== 2 ||
          inside[0] !== 'server' ||
          !inside[1].startsWith('location '),
      )
      .map(
        ({ directive, inside }) =>
          `${inside.join(' > ') || '(top of the file)'}: add_header ${args(directive).join(' ')}`,
      );
    // Directly inside a location is the only place: above it (the server, the
    // file's top) the locations drop it; below it (an `if`) it drops theirs.
    expect(misplaced).toEqual([]);
  });

  test('each location says what a browser may keep, and only `no-store` says it with `always`', () => {
    const said = Object.fromEntries(
      locations.map(({ directive }) => [
        args(directive).join(' '),
        directive.block
          .filter(
            (inner) =>
              name(inner) === 'add_header' &&
              args(inner)[0] === 'Cache-Control',
          )
          .map((inner) => args(inner).slice(1)),
      ]),
    );
    expect(said).toEqual(
      Object.fromEntries(
        Object.entries(CACHE_CONTROL).map(([label, value]) => [
          label,
          value ? [value] : [],
        ]),
      ),
    );
    // Said once more on its own, because it is the costly one: with `always`
    // the year-long header would also go on the 404 for a missing file.
    const immutableAlways = findAll(conf, 'add_header').filter(
      ({ directive }) =>
        args(directive).some((word) => word.includes('immutable')) &&
        args(directive).includes('always'),
    );
    expect(immutableAlways).toEqual([]);
  });

  test('both calendar routes are `^~`, so a regex location can never take them', () => {
    const calendar = locations
      .map(({ directive }) => args(directive))
      .filter((words) => words.some((word) => word.includes('/gcal-')));
    expect(calendar).toEqual([
      ['^~', '/gcal-hook/'],
      ['^~', '/gcal-drain/'],
    ]);
  });

  test('add_header is the only thing that says what a browser may keep', () => {
    // `expires` writes a Cache-Control (and an Expires) of its own, beside the
    // one the location already sets, and a browser would be handed two.
    expect(findAll(conf, 'expires')).toEqual([]);
  });

  test('the calendar routes do what they did: 204 for a ring, the log for the drain, 404 for anything else', () => {
    // Everything in the two locations but the security headers and the cache
    // header, which have tests of their own above. A doorbell that answers
    // anything but a 2xx makes Google drop the channel.
    const rest = (label) =>
      (
        locations.find(
          ({ directive }) => args(directive).join(' ') === label,
        ) || { directive: { block: [] } }
      ).directive.block
        .filter((inner) => !['include', 'add_header'].includes(name(inner)))
        .map((inner) => [
          name(inner),
          ...args(inner),
          ...(inner.block
            ? [inner.block.map((line) => [name(line), ...args(line)])]
            : []),
        ]);
    expect(rest('^~ /gcal-hook/')).toEqual([
      ['if', '($gcal_route', '!=', 'hook', ')', [['return', '404']]],
      [
        'access_log',
        '/var/log/gcal-hook/hits.log',
        'gcal_hook',
        'if=$gcal_log_hook',
      ],
      ['return', '204'],
    ]);
    expect(rest('^~ /gcal-drain/')).toEqual([
      ['if', '($gcal_route', '!=', 'drain', ')', [['return', '404']]],
      ['root', '/var/log/gcal-hook'],
      ['try_files', '/hits.log', '=404'],
      ['default_type', 'text/plain'],
    ]);
  });

  test('/journal answers 410 Gone (after the bare-domain redirect), and nothing else', () => {
    const journal = locations.find(
      ({ directive }) => args(directive).join(' ') === '^~ /journal',
    );
    expect(journal).toBeDefined();
    expect(
      journal.directive.block
        .filter((inner) => name(inner) !== 'include')
        .map((inner) => [
          name(inner),
          ...args(inner),
          ...(inner.block
            ? [inner.block.map((line) => [name(line), ...args(line)])]
            : []),
        ]),
    ).toEqual([
      [
        'if',
        '($host',
        '=',
        'travish.com)',
        [['return', '301', 'https://www.travish.com$request_uri']],
      ],
      ['return', '410'],
    ]);
  });

  test('compression is on at http scope, and the two font types are known', () => {
    const top = (wanted) =>
      conf.filter((directive) => name(directive) === wanted).map(args);
    expect(top('gzip')).toEqual([['on']]);
    expect(top('gzip_vary')).toEqual([['on']]);
    expect(top('gzip_types')[0]).toEqual(
      expect.arrayContaining([
        'application/javascript',
        'text/css',
        'image/svg+xml',
        'font/ttf',
        'font/otf',
      ]),
    );
    // A `types` block inside the server would REPLACE nginx's whole list.
    expect(findAll(conf, 'types').map(({ inside }) => inside)).toEqual([[]]);
    const types = conf.find((directive) => name(directive) === 'types');
    expect(types.block.map((line) => [name(line), ...args(line)])).toEqual([
      ['font/ttf', 'ttf'],
      ['font/otf', 'otf'],
    ]);
  });

  test("the uptime check's requests stay out of the visit log; every other rule is unchanged", () => {
    // The check (scripts/uptime-check.sh) names itself by User-Agent. Read the
    // name from the script itself, so the two can never drift apart unseen.
    const script = read('scripts', 'uptime-check.sh');
    const named = /^USER_AGENT='([^']+)'$/m.exec(script);
    expect(named).not.toBeNull();
    const uptimeAgent = named[1];

    // nginx's `map`, the part this file uses: an exact key is tried first,
    // then each `~` (case-sensitive) or `~*` (case-insensitive) regex in the
    // file's order, the first hit wins, and `default` answers the rest (an
    // empty string when there is none). A value that names another map's
    // variable is that map's answer.
    const maps = Object.fromEntries(
      conf
        .filter((directive) => name(directive) === 'map' && directive.block)
        .map((directive) => [
          args(directive)[1],
          {
            source: args(directive)[0],
            entries: directive.block.map((line) => [name(line), args(line)[0]]),
          },
        ]),
    );
    // The two maps the chain is made of, and what each one reads.
    expect(
      [maps.$visit_log, maps.$visit_page].map((map) => map && map.source),
    ).toEqual(['$http_user_agent', '$uri']);

    const lookup = (variable, request) => {
      const { source, entries } = maps[variable];
      const input = request[source];
      const exact = entries.find(
        ([key]) => key !== 'default' && !key.startsWith('~') && key === input,
      );
      const regex = entries.find(([key]) => {
        if (!key.startsWith('~')) return false;
        const caseless = key.startsWith('~*');
        return new RegExp(
          key.slice(caseless ? 2 : 1),
          caseless ? 'i' : '',
        ).test(input);
      });
      const fallback = entries.find(([key]) => key === 'default');
      const value = (exact || regex || fallback || ['', ''])[1];
      return maps[value] ? lookup(value, request) : value;
    };
    const logged = (uri, agent) =>
      lookup('$visit_log', { $uri: uri, $http_user_agent: agent });

    const CHROME =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
    const SAFARI =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
    expect({
      'the check, on the home page': logged('/', uptimeAgent),
      'Chrome, on the home page': logged('/', CHROME),
      'Safari, on /piano': logged('/piano', SAFARI),
      'Chrome, a built script': logged('/index.abcd1234.js', CHROME),
      'Chrome, sitemap.xml': logged('/sitemap.xml', CHROME),
      'Chrome, robots.txt': logged('/robots.txt', CHROME),
      // The name must START the User-Agent: one that merely carries it (here,
      // the check's whole User-Agent, inside a browser-shaped one) is a
      // visitor like any other.
      'a decoy that mentions the name': logged(
        '/',
        `Mozilla/5.0 (compatible; ${uptimeAgent})`,
      ),
      'no User-Agent at all': logged('/', ''),
    }).toEqual({
      'the check, on the home page': '0',
      'Chrome, on the home page': '1',
      'Safari, on /piano': '1',
      'Chrome, a built script': '0',
      'Chrome, sitemap.xml': '0',
      'Chrome, robots.txt': '0',
      'a decoy that mentions the name': '1',
      'no User-Agent at all': '1',
    });

    // And the log lines that read the chain are what they were: the stdout
    // log restated first (so `docker logs` keeps every request, the check's
    // included), then the visit log, written only when $visit_log says so.
    const page = locations.find(
      ({ directive }) => args(directive).join(' ') === '/',
    );
    expect(page).toBeDefined();
    expect(
      page.directive.block
        .filter((inner) => name(inner) === 'access_log')
        .map((inner) => [name(inner), ...args(inner)].join(' ')),
    ).toEqual([
      'access_log /var/log/nginx/access.log main',
      'access_log /var/log/www/visits.log visits if=$visit_log',
    ]);
  });

  test('the server does not print its version', () => {
    const server = findAll(conf, 'server')[0].directive.block;
    const tokens = server.filter((inner) => name(inner) === 'server_tokens');
    expect(tokens.map(args)).toEqual([['off']]);
  });

  describe("the built files' location", () => {
    const built = locations
      .map(({ directive }) => directive)
      .find((directive) => args(directive)[0] === '~') || {
      words: [],
      block: [],
    };
    const page = locations
      .map(({ directive }) => directive)
      .find((directive) => args(directive).join(' ') === '/') || {
      words: [],
      block: [],
    };
    const directives = (location, wanted) =>
      location.block.filter((inner) => name(inner) === wanted);
    const pattern = (built.words[2] || {}).text || '';

    test('its pattern is written in quotes', () => {
      // Unquoted, nginx reads the `{` of `{8}` as the start of a block.
      expect(built.words.map((word) => word.quoted)).toEqual([
        false,
        false,
        true,
      ]);
      expect(pattern).toBe(BUILT);
    });

    test('the pattern takes built files and nothing else', () => {
      const regex = new RegExp(pattern);
      const takes = (address) => pattern !== '' && regex.test(address);
      expect(
        [
          '/app.dd8b2794.js',
          '/app.dd8b2794.js.map',
          '/app.1f6d4f35.css.map',
          '/resume.e1370cb9.pdf',
          '/nasin-nanpa-4.0.2-UCSUR.792eb59e.otf',
        ].filter((address) => !takes(address)),
      ).toEqual([]);
      expect(
        [
          '/',
          '/index.html',
          '/piano',
          '/learn/toki-pona/1',
          '/blog/js-this',
          '/blog/some.thing',
          '/x.1234ABCD.js',
          '/x.1234abc.js',
          '/x.1234abcd.js/more',
        ].filter(takes),
      ).toEqual([]);
    });

    test('a file that is not there is a real 404, never the app', () => {
      expect(directives(built, 'try_files').map(args)).toEqual([
        ['$uri', '=404'],
      ]);
      expect(directives(built, 'root').map(args)).toEqual([['/var/www/html']]);
    });

    test('an unknown page address still gets the app', () => {
      expect(directives(page, 'try_files').map(args)).toEqual([
        ['$uri', '/index.html'],
      ]);
    });

    test('the bare domain is redirected from here exactly as from the pages', () => {
      const redirect = (location) =>
        directives(location, 'if').map((inner) => [
          args(inner),
          inner.block.map((line) => [name(line), ...args(line)]),
        ]);
      expect(redirect(built)).toEqual([
        [
          ['($host', '=', 'travish.com)'],
          [['return', '301', 'https://www.travish.com$request_uri']],
        ],
      ]);
      expect(redirect(built)).toEqual(redirect(page));
    });
  });
});

describe('security-headers.conf', () => {
  // A missing file reads as an empty one, so the test below says what is wrong
  // instead of the whole suite failing to load.
  const file = path.join(REPO, 'nginx', 'security-headers.conf');
  const snippet = fs.existsSync(file)
    ? parse(fs.readFileSync(file, 'utf8'))
    : [];

  test('holds exactly the three headers, each sent with `always`', () => {
    expect(snippet.map(name)).toEqual([
      'add_header',
      'add_header',
      'add_header',
    ]);
    // `always`: without it nginx leaves the header off a 404, and the refused
    // calendar routes answer 404.
    snippet.forEach((directive) => {
      expect(args(directive)).toHaveLength(3);
      expect(args(directive)[2]).toBe('always');
    });
    const sent = Object.fromEntries(
      snippet.map((directive) => [args(directive)[0], args(directive)[1]]),
    );
    expect(sent).toEqual(SECURITY_HEADERS);
  });
});

describe('the Dockerfile', () => {
  // Every instruction as one line: a `\` at a line's end continues it on the
  // next, and a line that starts with `#` is a comment.
  const instructions = read('Dockerfile')
    .replace(/\\\r?\n/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
  // COPY and ADD both put files into the image: `[--flag…] <from…> <to>`, one
  // entry per source. A copy from the build stage (`--from=…`) is read too.
  const copies = instructions
    .map((line) => /^(?:COPY|ADD)\s+(.+)$/i.exec(line))
    .filter(Boolean)
    .flatMap((match) => {
      const words = match[1]
        .split(/\s+/)
        .filter((word) => !word.startsWith('--'));
      const to = words[words.length - 1];
      return words.slice(0, -1).map((from) => ({ from, to }));
    });

  test('the reader saw the three copies that are there', () => {
    // An empty list would pass both tests below for the wrong reason.
    expect(copies.map((copy) => copy.to)).toEqual(
      expect.arrayContaining([
        '/etc/nginx/conf.d/default.conf',
        SNIPPET,
        '/var/www/html',
      ]),
    );
  });

  test('puts the headers file exactly where nginx.conf includes it', () => {
    const snippetCopies = copies.filter((copy) =>
      copy.from.endsWith('security-headers.conf'),
    );
    expect(snippetCopies).toEqual([
      { from: './nginx/security-headers.conf', to: SNIPPET },
    ]);
  });

  test('copies only nginx.conf into conf.d', () => {
    // nginx loads EVERY file under conf.d at the top level. The headers file
    // there would be read above the server, where each location with an
    // add_header of its own drops it: the trap this whole file is about.
    const intoConfD = copies.filter(
      (copy) =>
        copy.to.startsWith('/etc/nginx/conf.d') ||
        copy.from === './nginx' ||
        copy.from === './nginx/' ||
        copy.from === 'nginx' ||
        copy.from === 'nginx/',
    );
    expect(intoConfD).toEqual([
      { from: './nginx/nginx.conf', to: '/etc/nginx/conf.d/default.conf' },
    ]);
  });

  test('no other instruction reaches conf.d', () => {
    // The net under the two tests above, for a way in they do not read: a RUN
    // that copies or moves a file there, a COPY written as a JSON list.
    expect(instructions.filter((line) => line.includes('conf.d'))).toEqual([
      'COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf',
    ]);
  });
});
