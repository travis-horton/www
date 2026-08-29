/*
 * ============================================================================
 * A BRIDGE. IT IS MEANT TO BE DELETED.
 * ============================================================================
 *
 * WHAT DELETES IT: the www Zig backend, Phases 2/3/4 (API + Postgres + the
 * /learn account seam). The moment progress has a server-side home, every
 * device reads the same record and there is nothing left to carry by hand.
 * When that lands, delete this file, TransferPanel.jsx, their tests, and the
 * <ProgressTransfer /> mount in LearnHome.jsx. `commitSessions` in progress.js
 * goes with them; `id` and `at` do NOT — the backend wants both.
 *
 * WHY IT EXISTS ANYWAY: storage was never the constraint, DEVICE SYNC was.
 * /learn keeps progress in localStorage, which is per-device and per-browser:
 * a drill done on the iPad is invisible on the laptop, and clearing Safari's
 * data erases the record with no copy anywhere. The backend is the real fix
 * and it is not built. This lets a record be moved by hand in the meantime.
 *
 * ---------------------------------------------------------------------------
 * THE FORMAT: plain JSON, one line, copied as text.
 *
 * Text, not a downloaded file, because the target device is an iPad. A file
 * download there lands in Files and getting it back into another browser is a
 * share-sheet-and-picker round trip; the clipboard is the iPad's good path —
 * and between an iPad and a Mac on the same Apple ID, Universal Clipboard
 * moves this with no file, no AirDrop and no email at all. The textarea also
 * degrades honestly: if navigator.clipboard is unavailable (Safari outside a
 * secure context), the text is still sitting there, selectable.
 *
 * Plain JSON, not base64 or a compressed blob, because a bridge's payload gets
 * read by a human when something goes wrong, and by the backend importer
 * later. ~200 sessions is tens of KB — small enough that squeezing it buys
 * nothing and costs inspectability.
 *
 * ---------------------------------------------------------------------------
 * THE MERGE: importing ADDS, it never removes. Stated plainly because the
 * alternative is defensible and this is a real choice.
 *
 * Replace is predictable but destroys whatever the target device did since the
 * export — which is precisely the case this exists to serve (drills on the
 * iPad, drills on the laptop, one record wanted). Merge's usual hazard is
 * silently resurrecting deleted work, and that hazard does not exist here:
 * /learn has no delete. `recordSession` appends and nothing else ever removes
 * a session, so the history is append-only by construction and a union of two
 * append-only logs loses nothing.
 *
 * So merge is the only committing action. There is no replace button, because
 * a non-destructive import needs no destructive escape hatch, and one that
 * exists will eventually get tapped.
 *
 * ---------------------------------------------------------------------------
 * THE VERSION FIELD: `format` names the payload, `version` numbers its shape.
 *
 * A future reader (the backend importer, or a later /learn) switches on
 * `version` and refuses what it does not recognise rather than guessing:
 *
 *   v1 — { format, version, exportedAt, count, checksum, sessions: [...] }
 *        A session is { course, levelId, correct, total } plus, when the
 *        session was recorded after the bridge shipped, `id` (stable, unique)
 *        and `at` (ISO 8601). `misses: string[]` and `missedWords: string[]`
 *        are optional. Sessions predating those fields are legitimate and must
 *        keep working — see keyOf() for how they are identified.
 *
 * A code from a HIGHER version than the reader understands is refused, not
 * best-effort parsed: importing a shape you do not understand is how you drop
 * fields silently.
 */

import { MAX_SESSIONS, commitSessions, load } from './progress';

export const FORMAT = 'travish.learn.progress';
export const VERSION = 1;

/*
 * FNV-1a over the serialized session list. Not security — a hand-carried code
 * has no adversary — but truncation and mangling detection. A paste that loses
 * its tail usually fails JSON.parse first; the cases this actually catches are
 * the quiet ones, like a note-taking app helpfully converting "quotes" to
 * smart quotes, which still parses and silently changes the data.
 */
/* eslint-disable no-bitwise */
export const checksum = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};
/* eslint-enable no-bitwise */

/** True for a session object this course can actually score. */
const isUsable = (s) => Boolean(s)
  && typeof s === 'object'
  && typeof s.course === 'string' && s.course !== ''
  && (typeof s.levelId === 'string' || typeof s.levelId === 'number')
  && Number.isFinite(s.total) && s.total > 0
  && Number.isFinite(s.correct) && s.correct >= 0;

/**
 * A dedupe key for each session in ONE list.
 *
 * Sessions recorded after this bridge shipped carry a unique `id`, so a code
 * pasted twice is idempotent. Sessions from before it have no id and no
 * timestamp — nothing distinguishes two genuine 10/12 runs of level 3 from the
 * same run seen twice. They get a synthetic key from their content plus their
 * ordinal among identical-looking siblings IN THEIR OWN LIST: re-importing the
 * same legacy history is then idempotent (the Nth identical session on one
 * side keys to the Nth on the other), while two genuinely distinct legacy
 * sessions that happen to score alike stay distinct (ordinals 1 and 2).
 *
 * The counter is per-list for exactly that reason — a counter shared across
 * both lists would give the same legacy session a different ordinal on each
 * side and duplicate it on every import.
 *
 * The one thing this cannot do is tell apart two DIFFERENT devices' legacy
 * sessions that coincide exactly in course, level, score and ordinal. Those
 * merge into one. It is the single lossy corner of the bridge, it only touches
 * pre-bridge history, and the cost is an undercounted attempt tally.
 */
const keyOf = (list) => {
  const seen = {};
  return list.map((s) => {
    if (typeof s.id === 'string' && s.id !== '') return `id:${s.id}`;
    const sig = `legacy:${s.course}|${s.levelId}|${s.correct}/${s.total}`;
    seen[sig] = (seen[sig] || 0) + 1;
    return `${sig}#${seen[sig]}`;
  });
};

const atOf = (s) => (typeof s.at === 'string' && s.at !== '' ? s.at : null);

/*
 * Chronological order, which the readers in progress.js depend on: summarize()
 * calls the LAST element "last", and weakKinds/weakWords take the tail.
 *
 * Dated sessions sort by `at`. Undated ones are pre-bridge and therefore older
 * than everything dated, so they sort first, keeping the relative order they
 * arrived in — the local device's before the imported ones, so a merge is
 * deterministic rather than dependent on object key order.
 */
const chronological = (entries) => [...entries].sort((a, b) => {
  if (a.at === null && b.at === null) return a.seq - b.seq;
  if (a.at === null) return -1;
  if (b.at === null) return 1;
  if (a.at === b.at) return a.seq - b.seq;
  return a.at < b.at ? -1 : 1;
});

/**
 * Union two session lists. Pure: no storage, no clock.
 * Returns { sessions, added, alreadyHad, dropped }.
 *
 * `dropped` counts sessions cut by the MAX_SESSIONS cap — merging two full
 * histories can exceed it, and losing the OLDEST to the cap is exactly what
 * recordSession already does, so the bridge does not get to be different.
 */
export const mergeSessions = (mine, theirs) => {
  const entries = [];
  const index = {};

  const absorb = (list, offset) => {
    const keys = keyOf(list);
    let added = 0;
    let already = 0;
    list.forEach((s, i) => {
      if (index[keys[i]]) {
        already += 1;
        return;
      }
      index[keys[i]] = true;
      entries.push({ session: s, at: atOf(s), seq: offset + i });
      added += 1;
    });
    return { added, already };
  };

  absorb(mine, 0);
  const incoming = absorb(theirs, 1e6);

  const ordered = chronological(entries).map((e) => e.session);
  const capped = ordered.slice(-MAX_SESSIONS);

  return {
    sessions: capped,
    added: incoming.added,
    alreadyHad: incoming.already,
    dropped: ordered.length - capped.length,
  };
};

/** The code to hand to the other device. */
export const buildPayload = (sessions, now = new Date()) => {
  const body = JSON.stringify(sessions);
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: now.toISOString(),
    count: sessions.length,
    checksum: checksum(body),
    sessions,
  };
};

/** Read this device's record and serialize it. One line, for the clipboard. */
export const exportCode = (now = new Date()) => JSON.stringify(
  buildPayload(load().sessions, now),
);

/*
 * Parse a pasted code. Never throws, never writes, and says what is wrong in
 * words a person can act on.
 *
 * Returns { ok: true, sessions, skipped, exportedAt } or { ok: false, error }.
 * On ok:false NOTHING has been written to storage — a bad paste must not be
 * able to cost you the progress already on the device.
 */
export const parseCode = (text) => {
  const trimmed = String(text == null ? '' : text).trim();
  if (trimmed === '') {
    return { ok: false, error: 'Paste a progress code first.' };
  }

  let payload;
  try {
    payload = JSON.parse(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: 'That did not parse as a progress code. Copy the whole thing — from the first { to the last } — and paste it again.',
    };
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'That is valid JSON, but not a /learn progress code.' };
  }

  if (payload.format !== FORMAT) {
    return { ok: false, error: 'That is not a /learn progress code — it came from something else.' };
  }

  if (!Number.isFinite(payload.version)) {
    return { ok: false, error: 'That code has no version number, so there is no safe way to read it.' };
  }

  if (payload.version > VERSION) {
    return {
      ok: false,
      error: `That code came from a newer version of /learn (v${payload.version}; this device reads v${VERSION}). Update this device first — reading it here could drop what it knows.`,
    };
  }

  if (!Array.isArray(payload.sessions)) {
    return { ok: false, error: 'That code carries no sessions list.' };
  }

  if (typeof payload.checksum === 'string'
    && checksum(JSON.stringify(payload.sessions)) !== payload.checksum) {
    return {
      ok: false,
      error: 'That code looks truncated or edited — its checksum does not match its contents. Copy it again, all of it.',
    };
  }

  const sessions = payload.sessions.filter(isUsable);
  return {
    ok: true,
    sessions,
    skipped: payload.sessions.length - sessions.length,
    exportedAt: typeof payload.exportedAt === 'string' ? payload.exportedAt : null,
  };
};

const report = (parsed, mine, merged) => ({
  ok: true,
  skipped: parsed.skipped,
  exportedAt: parsed.exportedAt,
  have: mine.length,
  incoming: parsed.sessions.length,
  added: merged.added,
  alreadyHad: merged.alreadyHad,
  dropped: merged.dropped,
  total: merged.sessions.length,
});

/**
 * What WOULD happen, without doing it — so the UI can say the number out loud
 * before anything is written. Same code path as importCode(), so the preview
 * cannot drift from the act.
 */
export const previewImport = (text) => {
  const parsed = parseCode(text);
  if (!parsed.ok) return parsed;
  const mine = load().sessions;
  return report(parsed, mine, mergeSessions(mine, parsed.sessions));
};

/** Do it. Writes only on a clean parse. */
export const importCode = (text) => {
  const parsed = parseCode(text);
  if (!parsed.ok) return parsed;
  const mine = load().sessions;
  const merged = mergeSessions(mine, parsed.sessions);
  commitSessions(merged.sessions);
  return report(parsed, mine, merged);
};
