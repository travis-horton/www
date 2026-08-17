/*
 * Local progress for the drill engine.
 *
 * v1 is deliberately localStorage-only: no account, no API, no Zig. When scores
 * should follow you between the iPad and the laptop, that is what the backend
 * (www Phases 2-4) is for, and this module is the seam it plugs into.
 */

const KEY = 'travish.learn.v1';

const emptyStore = () => ({ sessions: [] });

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
  // Keep the tail bounded; nobody needs the 500th session on a phone.
  const sessions = [...store.sessions, session].slice(-200);
  save({ ...store, sessions });
};

/** Per-course, per-level summary: attempts, best score, most recent score. */
export const summarize = (course, levelId) => {
  const runs = load().sessions
    .filter((s) => s.course === course && s.levelId === levelId);
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
  const runs = load().sessions
    .filter((s) => s.course === course)
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
  const runs = load().sessions
    .filter((s) => s && s.course === course)
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

/**
 * The highest numbered level this course has a recorded session for — i.e. how
 * far the learner has actually got, as opposed to how far they have read.
 * Non-numeric level ids (review sessions record `levelId: 'review'`) are not
 * levels and never count. Returns 0 for a course never drilled.
 */
export const levelsReached = (course) => load().sessions
  .filter((s) => s && s.course === course)
  .reduce((acc, s) => {
    const n = Number(s.levelId);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
