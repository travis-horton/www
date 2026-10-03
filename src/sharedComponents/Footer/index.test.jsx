/*
 * Where the footer's version comes from.
 *
 * The label is worked out ONCE, when the Footer module loads, from three values
 * the build bakes in. In the real build the bundler writes them into the code;
 * under jest they are read from the environment when the module loads. So each
 * case sets the environment and then loads a FRESH copy of the footer, with
 * React and the router loaded beside it in the same fresh registry (two copies
 * of React cannot render one tree).
 *
 * What these pin: the version comes from the build's environment and from
 * nowhere else. The footer used to import package.json for its fallback, which
 * put the whole file into the bundle visitors download. Case two is the one
 * that tells the two apart: it hands the footer a version that is NOT the one
 * in package.json and expects to see it.
 *
 * ⚠️ What these CANNOT see: whether the bundler really writes the values in.
 * jest reads the environment as it runs; the build has to be told which names
 * to write into the code. The last test here holds the list of names, and
 * scripts/check-bundle.mjs looks in a real build for the version itself.
 */
import fs from 'fs';
import path from 'path';

const KEYS = ['APP_VERSION', 'BUILD_DATE', 'npm_package_version'];
const REPO = path.resolve(__dirname, '../../..');

async function footerVersionLine(env) {
  const saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));
  let html;
  try {
    KEYS.forEach((key) => {
      if (env[key] === undefined) delete process.env[key];
      else process.env[key] = env[key];
    });
    await jest.isolateModulesAsync(async () => {
      const React = (await import('react')).default;
      const { renderToStaticMarkup } = await import('react-dom/server');
      const { StaticRouter } = await import('react-router-dom');
      const { default: Footer } = await import('./index');
      html = renderToStaticMarkup(
        <StaticRouter location="/">
          <Footer />
        </StaticRouter>,
      );
    });
  } finally {
    KEYS.forEach((key) => {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    });
  }
  const holder = document.createElement('div');
  holder.innerHTML = html;
  return holder.querySelector('.main-footer__content--static').textContent;
}

describe("the footer's version comes from the build, not from package.json", () => {
  test('a sandbox build shows the version and build time it was handed', async () => {
    expect(
      await footerVersionLine({
        APP_VERSION: '9.9.9',
        BUILD_DATE: '26.0101.0000',
        npm_package_version: '1.2.3',
      }),
    ).toBe("©'26 kiddspazz · v9.9.9+26.0101.0000");
  });

  test('with no APP_VERSION it shows the version npm hands the build', async () => {
    expect(await footerVersionLine({ npm_package_version: '1.2.3' })).toBe(
      "©'26 kiddspazz · v1.2.3+local",
    );
  });

  test("an EMPTY APP_VERSION (the Dockerfile's default) counts as none", async () => {
    expect(
      await footerVersionLine({
        APP_VERSION: '',
        BUILD_DATE: '',
        npm_package_version: '1.2.3',
      }),
    ).toBe("©'26 kiddspazz · v1.2.3+local");
  });

  test('with neither it still shows a real version number', async () => {
    expect(await footerVersionLine({})).toBe("©'26 kiddspazz · v0.0.0+local");
  });
});

/*
 * Parcel writes an environment value into the code only if its name is on the
 * list in package.json ("@parcel/transformer-js" → inlineEnvironment). A name
 * that is read but not listed becomes `undefined` in the built site, silently.
 * And once there is a list at all, NODE_ENV has to be on it: React decides
 * between its development and production builds by that name.
 */
describe("the bundler's list of environment names", () => {
  const listed = JSON.parse(
    fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'),
  )['@parcel/transformer-js'].inlineEnvironment;

  function sourceFilesUnder(folder) {
    return fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        return entry.name === 'node_modules' ? [] : sourceFilesUnder(full);
      }
      const isSource = /\.(js|jsx|ts|tsx)$/.test(entry.name);
      const isTest = /\.test\.[a-z]+$/.test(entry.name);
      return isSource && !isTest ? [full] : [];
    });
  }

  test('names every environment value the site reads, and NODE_ENV', () => {
    const read = new Set();
    sourceFilesUnder(path.join(REPO, 'src')).forEach((file) => {
      const text = fs.readFileSync(file, 'utf8');
      [...text.matchAll(/process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g)].forEach(
        (match) => read.add(match[1]),
      );
    });
    // The scan really sees the footer's three (so an empty scan cannot pass).
    expect([...read]).toEqual(expect.arrayContaining(KEYS));
    expect(listed).toEqual(expect.arrayContaining([...read]));
    expect(listed).toContain('NODE_ENV');
  });
});
