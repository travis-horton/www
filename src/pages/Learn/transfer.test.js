/* eslint-env jest */
/*
 * The device-transfer bridge. Temporary code, but the thing it is trusted with
 * — the only copy of a learner's history — is not, so these tests lean hardest
 * on the two promises in transfer.js's header:
 *
 *   an import ADDS and never removes, and
 *   a bad paste writes NOTHING.
 *
 * The second is asserted as "the store is byte-identical afterwards" rather
 * than "an error was returned", because returning an error while having
 * already clobbered the store is exactly the failure worth guarding.
 */

import {
  FORMAT, VERSION, buildPayload, checksum, exportCode, importCode,
  mergeSessions, parseCode, previewImport,
} from './transfer';
import { MAX_SESSIONS, load, recordSession } from './progress';

const KEY = 'travish.learn.v1';

const raw = () => window.localStorage.getItem(KEY);
const seed = (sessions) => window.localStorage.setItem(KEY, JSON.stringify({ sessions }));
const run = (over) => ({
  course: 'toki-pona', levelId: '1', total: 12, correct: 9, ...over,
});

beforeEach(() => {
  window.localStorage.clear();
});

describe('the payload', () => {
  test('it is versioned, named, and counted', () => {
    recordSession(run());
    const payload = JSON.parse(exportCode());

    expect(payload.format).toBe(FORMAT);
    expect(payload.version).toBe(VERSION);
    expect(payload.count).toBe(1);
    expect(typeof payload.checksum).toBe('string');
    expect(payload.sessions).toHaveLength(1);
  });

  test('it is one line, so a select-all copy cannot take half of it', () => {
    recordSession(run());
    expect(exportCode()).not.toContain('\n');
  });

  test('every recorded session carries the id and timestamp a merge needs', () => {
    recordSession(run());
    const [s] = load().sessions;
    expect(typeof s.id).toBe('string');
    expect(s.id).not.toBe('');
    expect(Number.isNaN(Date.parse(s.at))).toBe(false);
  });
});

describe('a round trip', () => {
  test('what comes out of one device goes into an empty one unchanged', () => {
    recordSession(run({ levelId: '1' }));
    recordSession(run({ levelId: '2', correct: 12 }));
    const code = exportCode();
    const sent = load().sessions;

    window.localStorage.clear();
    const outcome = importCode(code);

    expect(outcome.ok).toBe(true);
    expect(outcome.added).toBe(2);
    expect(load().sessions).toEqual(sent);
  });
});

describe('merge semantics — it adds, it never removes', () => {
  test('the target device keeps everything it already had', () => {
    recordSession(run({ levelId: '5' }));
    const code = exportCode();

    window.localStorage.clear();
    recordSession(run({ levelId: '9' }));
    const before = load().sessions;

    importCode(code);
    const after = load().sessions;

    before.forEach((s) => expect(after).toContainEqual(s));
    expect(after).toHaveLength(2);
  });

  test('importing the same code twice is idempotent', () => {
    recordSession(run({ levelId: '3' }));
    const code = exportCode();
    window.localStorage.clear();

    const first = importCode(code);
    const second = importCode(code);

    expect(first.added).toBe(1);
    expect(second.added).toBe(0);
    expect(second.alreadyHad).toBe(1);
    expect(load().sessions).toHaveLength(1);
  });

  test('the merged list stays chronological, so "last" still means last', () => {
    const older = { ...run({ levelId: '1', correct: 3 }), id: 'a', at: '2026-01-01T00:00:00.000Z' };
    const newer = { ...run({ levelId: '1', correct: 11 }), id: 'b', at: '2026-06-01T00:00:00.000Z' };

    // The newer session is the one already here; the older one arrives by paste.
    seed([newer]);
    importCode(JSON.stringify(buildPayload([older])));

    expect(load().sessions.map((s) => s.id)).toEqual(['a', 'b']);
  });

  test('a merge that overflows the cap loses the OLDEST, exactly as recording does', () => {
    const many = (n, prefix, month) => Array.from({ length: n }, (_, i) => ({
      ...run(),
      id: `${prefix}${i}`,
      at: `2026-${month}-01T00:00:00.000Z`,
    }));

    const merged = mergeSessions(many(150, 'old', '01'), many(150, 'new', '02'));

    expect(merged.sessions).toHaveLength(MAX_SESSIONS);
    expect(merged.dropped).toBe(100);
    expect(merged.sessions[merged.sessions.length - 1].id).toBe('new149');
    expect(merged.sessions.some((s) => s.id === 'old0')).toBe(false);
  });
});

describe('sessions from before the bridge existed (no id, no timestamp)', () => {
  const legacy = {
    course: 'seximal', levelId: '2', total: 10, correct: 7,
  };

  test('they survive an export and an import', () => {
    seed([legacy]);
    const code = exportCode();
    window.localStorage.clear();

    expect(importCode(code).added).toBe(1);
    expect(load().sessions).toEqual([legacy]);
  });

  test('re-importing the same legacy history does not duplicate it', () => {
    seed([legacy, legacy]);
    const code = exportCode();

    const outcome = importCode(code);

    expect(outcome.added).toBe(0);
    expect(outcome.alreadyHad).toBe(2);
    expect(load().sessions).toHaveLength(2);
  });

  test('two genuinely distinct legacy sessions that score alike stay distinct', () => {
    // Same course, level and score, recorded twice on ONE device: both real.
    const merged = mergeSessions([legacy, legacy], []);
    expect(merged.sessions).toHaveLength(2);
  });

  test('undated sessions sort before dated ones — they are older by construction', () => {
    const dated = { ...run(), id: 'z', at: '2026-01-01T00:00:00.000Z' };
    const merged = mergeSessions([dated], [legacy]);
    expect(merged.sessions[0]).toEqual(legacy);
  });
});

describe('a corrupt paste is visible and costs nothing', () => {
  const survives = (text) => {
    recordSession(run());
    const before = raw();

    const outcome = importCode(text);

    expect(outcome.ok).toBe(false);
    expect(typeof outcome.error).toBe('string');
    expect(outcome.error.length).toBeGreaterThan(0);
    // The whole point: the store is untouched, not merely "not emptied".
    expect(raw()).toBe(before);
    return outcome.error;
  };

  test('an empty paste asks for one rather than erroring', () => {
    expect(survives('   ')).toMatch(/Paste a progress code/);
  });

  test('a truncated paste that no longer parses says so', () => {
    recordSession(run());
    const half = exportCode().slice(0, 60);
    window.localStorage.clear();
    expect(survives(half)).toMatch(/did not parse/);
  });

  test('valid JSON that is not a progress code is refused', () => {
    expect(survives('{"hello":"world"}')).toMatch(/not a \/learn progress code/);
    expect(survives('[1,2,3]')).toMatch(/not a \/learn progress code/);
  });

  test('an edited payload is caught by the checksum even though it parses', () => {
    const payload = buildPayload([run({ id: 'a', at: '2026-01-01T00:00:00.000Z' })]);
    payload.sessions[0].correct = 12; // "improve" the score by hand

    expect(survives(JSON.stringify(payload))).toMatch(/truncated or edited/);
  });

  test('a code from a newer version is refused, not half-read', () => {
    const payload = { ...buildPayload([run()]), version: VERSION + 1 };
    const error = survives(JSON.stringify(payload));

    expect(error).toMatch(new RegExp(`v${VERSION + 1}`));
    expect(error).toMatch(/Update this device/);
  });

  test('a code with no version number is refused', () => {
    const payload = buildPayload([run()]);
    delete payload.version;
    expect(survives(JSON.stringify(payload))).toMatch(/no version number/);
  });

  test('a code with no sessions list is refused', () => {
    expect(survives(JSON.stringify({ format: FORMAT, version: VERSION }))).toMatch(/no sessions list/);
  });
});

describe('individually broken sessions are skipped, not fatal', () => {
  test('the good ones land and the bad ones are counted', () => {
    const payload = buildPayload([
      run({ id: 'good', at: '2026-01-01T00:00:00.000Z' }),
      {
        course: 'toki-pona', levelId: '1', total: 0, correct: 0,
      }, // unscoreable
      {
        course: '', levelId: '1', total: 5, correct: 1,
      }, // no course
      null,
      'nonsense',
    ]);

    const outcome = importCode(JSON.stringify(payload));

    expect(outcome.ok).toBe(true);
    expect(outcome.added).toBe(1);
    expect(outcome.skipped).toBe(4);
    expect(load().sessions.map((s) => s.id)).toEqual(['good']);
  });
});

describe('the preview tells the truth before anything is written', () => {
  test('its counts are the ones the import then produces', () => {
    recordSession(run({ levelId: '4' }));
    const code = exportCode();
    window.localStorage.clear();
    recordSession(run({ levelId: '7' }));

    const before = raw();
    const preview = previewImport(code);
    // Previewing must not itself write.
    expect(raw()).toBe(before);

    const outcome = importCode(code);
    expect(preview.added).toBe(outcome.added);
    expect(preview.alreadyHad).toBe(outcome.alreadyHad);
    expect(preview.total).toBe(outcome.total);
    expect(outcome.total).toBe(2);
  });

  test('it reports a bad code the same way the import would', () => {
    expect(previewImport('nope').ok).toBe(false);
    expect(previewImport('nope').error).toBe(parseCode('nope').error);
  });
});

describe('the checksum', () => {
  test('it changes when the content does', () => {
    expect(checksum('a')).not.toBe(checksum('b'));
    expect(checksum('a')).toBe(checksum('a'));
  });

  test('it is stable-width hex, so a truncated one is obvious', () => {
    expect(checksum('anything')).toMatch(/^[0-9a-f]{8}$/);
  });
});
