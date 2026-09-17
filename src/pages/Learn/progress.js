/*
 * Local progress for the drill engine.
 *
 * v1 is deliberately localStorage-only: no account, no API, no Zig. When scores
 * should follow you between the iPad and the laptop, that is what the backend
 * (www Phases 2-4) is for, and this module is the seam it plugs into.
 *
 * Until that lands, transfer.js carries a record between devices BY HAND. It is
 * a stopgap and is documented as one; the two fields this module stamps for it
 * (`id`, `at`) are not, and should outlive it — see below.
 */

const KEY = 'travish.learn.v1';

/** The session cap. Exported so a merge re-caps exactly the way recording does. */
export const MAX_SESSIONS = 200;

const emptyStore = () => ({ sessions: [] });

/*
 * Session identity — `id` and `at`, stamped here rather than at the three call
 * sites so every session gets them whatever drilled it.
 *
 * Nothing may REQUIRE them. Every session already on a learner's disk predates
 * this, and summarize/weakKinds/weakWords/weakRules/levelsReached must keep working
 * over that history untouched — same rule `missedWords` already follows.
 *
 * They exist for one reason: merging two devices' histories needs to tell "the
 * same session, imported twice" apart from "two different sessions that happen
 * to score alike", and an append-only list of anonymous {correct, total}
 * objects cannot. `at` is also the ordering key the eventual backend will want
 * — array position does that job today, and stops meaning anything the moment
 * two devices' arrays are interleaved.
 */
const newId = () => {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
  } catch (e) {
    // Non-secure context, or a browser without it: fall through to the shim.
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const load = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.sessions) ? parsed : emptyStore();
  } catch (e) {
    // A corrupt or unavailable store must never break the drill.
    return emptyStore();
  }
};

const save = (store) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch (e) {
    // Private browsing, quota, disabled storage: fail quiet, keep drilling.
  }
};

export const recordSession = (session) => {
  const store = load();
  const stamped = { id: newId(), at: new Date().toISOString(), ...session };
  // Keep the tail bounded; nobody needs the 500th session on a phone.
  const sessions = [...store.sessions, stamped].slice(-MAX_SESSIONS);
  save({ ...store, sessions });
};

/**
 * Overwrite the whole session list — the one write the transfer bridge needs
 * and the drills never do. Kept here so KEY and the cap stay in one file.
 */
export const commitSessions = (sessions) => {
  const store = load();
  save({ ...store, sessions: sessions.slice(-MAX_SESSIONS) });
};

/** Per-course, per-level summary: attempts, best score, most recent score. */
export const summarize = (course, levelId) => {
  const runs = load().sessions.filter(
    (s) => s.course === course && s.levelId === levelId,
  );
  if (runs.length === 0) return null;
  const best = runs.reduce((acc, s) => Math.max(acc, s.correct / s.total), 0);
  const last = runs[runs.length - 1];
  return {
    attempts: runs.length,
    best: Math.round(best * 100),
    last: Math.round((last.correct / last.total) * 100),
  };
};

/**
 * Which kinds of item are actually going wrong, newest sessions first.
 * This is the weak list, computed rather than hand-maintained.
 */
export const weakKinds = (course, limit = 20) => {
  const runs = load()
    .sessions.filter((s) => s.course === course)
    .slice(-limit);
  const tally = {};
  runs.forEach((s) => {
    (s.misses || []).forEach((kind) => {
      tally[kind] = (tally[kind] || 0) + 1;
    });
  });
  return Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .map(([kind, count]) => ({ kind, count }));
};

/*
 * Per-WORD misses, added for toki pona review mode.
 *
 * A session may carry `missedWords: ['telo', 'ijo']` alongside the older
 * `misses: ['glyph', 'word']`. Knowing the KIND that goes wrong tells you which
 * exercise to lean on; knowing the WORD tells you what to actually practise,
 * and review mode needs the second one to weight its sampling.
 *
 * The field is optional on purpose: every session already on disk predates it,
 * and a returning learner's history must keep working. Anything missing simply
 * contributes nothing to the tally.
 */
export const weakWords = (course, limit = 20) => {
  const runs = load()
    .sessions.filter((s) => s && s.course === course)
    .slice(-limit);
  const tally = {};
  runs.forEach((s) => {
    const words = Array.isArray(s.missedWords) ? s.missedWords : [];
    words.forEach((word) => {
      if (typeof word !== 'string' || word === '') return;
      tally[word] = (tally[word] || 0) + 1;
    });
  });
  return Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
};

/*
 * Per-RULE misses — the third tally, and the one a coach would actually read
 * out. The other two answer "which exercise?" (weakKinds) and "which word?"
 * (weakWords); neither can say "you dropped e after a preverb twice", which is
 * the only sentence worth saying about a grammar error.
 *
 * A session may carry `missedRules: ['no-e-after-preverb', 'li-after-noun-subject']`
 * — rule IDS, not prose, because the prose is presentation and these end up in
 * localStorage and in a hand-carried transfer code. One entry per (miss x rule);
 * an item that tests two rules charges both, so the counts here are of SUSPECTS,
 * not of questions.
 *
 * Optional in exactly the way missedWords is: every session already on disk
 * predates it and must keep working, so a missing field contributes nothing.
 */
export const weakRules = (course, limit = 20) => {
  const runs = load()
    .sessions.filter((s) => s && s.course === course)
    .slice(-limit);
  const tally = {};
  runs.forEach((s) => {
    const rules = Array.isArray(s.missedRules) ? s.missedRules : [];
    rules.forEach((rule) => {
      if (typeof rule !== 'string' || rule === '') return;
      tally[rule] = (tally[rule] || 0) + 1;
    });
  });
  return Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .map(([rule, count]) => ({ rule, count }));
};

/**
 * The highest numbered level this course has a recorded session for — i.e. how
 * far the learner has actually got, as opposed to how far they have read.
 * Non-numeric level ids (review sessions record `levelId: 'review'`) are not
 * levels and never count. Returns 0 for a course never drilled.
 */
export const levelsReached = (course) =>
  load()
    .sessions.filter((s) => s && s.course === course)
    .reduce((acc, s) => {
      const n = Number(s.levelId);
      return Number.isFinite(n) ? Math.max(acc, n) : acc;
    }, 0);
