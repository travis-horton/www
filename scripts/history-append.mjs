#!/usr/bin/env node
// history-append — keep HISTORY.md current, one merged PR at a time (26.0918).
//
// ⚠️ MASTER COPY: ~/.claude/skills/repo-history/history-append.mjs (backed up to
// claude-config nightly). Each repo carries an INSTALLED copy at
// scripts/history-append.mjs, because a GitHub workflow in one private repo
// cannot read another. Edit the master, then re-run the skill's install.sh in
// each repo — never edit an installed copy; the next install overwrites it.
//
// Travis, 26.0918: "do you have an automatic process to update the history
// doc? Because, if not, we should add that to any time you make a PR."
//
// THE CONTRACT. Every PR description carries its own HISTORY entry between two
// markers, written in the style of the repo-history skill's style.md:
//
//     <!-- history -->
//     **plain name of the change**
//     - New: …
//       Try it: …
//     <!-- /history -->
//
// (For a PR with several parts, the lines under the name are the parts, each
// `- **[Part](commit link)** · merged ?` — the `?` is filled in on merge.)
//
// Three modes, all driven by the GitHub event JSON at $GITHUB_EVENT_PATH:
//   --check      on an open PR: exit 1 (a red ✗) when the block is missing or
//                empty, saying exactly what to add. It cannot block the merge
//                (a private repo needs GitHub Pro for that), only flag it.
//   --append     on a merged PR: build the entry — `**praxis #N: name** ·
//                [PR #N](url) · merged YY.MMDD.HHMM` (Boise) — and put it at the
//                top of HISTORY.md, under this month's heading (made if new).
//                Idempotent: a PR already in the file is left alone. A PR with
//                no block still gets a line, marked as missing its summary, so
//                the gap is visible in the history instead of silent.
//   --self-test  the asserts, no network, no event file (smoke:history).
//
// RELEASE REPOS (www): when HISTORY_RELEASE_FROM names a branch (the repo
// variable, e.g. "dev"), a PR from that branch into the default branch is a
// RELEASE. It needs no block of its own: on merge its entry is GATHERED from
// the feature PRs it carries (each one's block becomes a part), read through
// the GitHub API with GITHUB_TOKEN. A release block, if written, supplies the
// name (a name-only block) or the whole curated body. Bot PRs (Dependabot)
// never fail the check and get a stock "automatic update" line.
//
// The PR body is DATA: it is read from the event file, never interpolated into
// a shell command.
import { readFileSync, writeFileSync, realpathSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The "<label> #N:" prefix. Default: the repo's own name (GITHUB_REPOSITORY is
// "owner/name" inside Actions); HISTORY_REPO_LABEL overrides it.
const REPO_LABEL = process.env.HISTORY_REPO_LABEL ?? (process.env.GITHUB_REPOSITORY ?? "").split("/")[1] ?? "repo";
const DOC = fileURLToPath(new URL("../HISTORY.md", import.meta.url));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** ISO instant → Boise `YY.MMDD.HHMM`, plus the month heading it belongs under. */
export function boiseStamp(iso) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Boise", year: "2-digit", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const g = (t) => parts.find((p) => p.type === t).value;
  return { stamp: `${g("year")}.${g("month")}${g("day")}.${g("hour")}${g("minute")}`, heading: `## ${MONTHS[Number(g("month")) - 1]} 20${g("year")}` };
}

/** The text between <!-- history --> and <!-- /history -->, or null. */
export function extractBlock(body) {
  const m = /<!--\s*history\s*-->[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*<!--\s*\/history\s*-->/.exec(body ?? "");
  const text = m ? m[1].replace(/\r/g, "").trim() : "";
  return text ? text : null;
}

const RELEASE_FROM = process.env.HISTORY_RELEASE_FROM || "";
/** A PR opened by a bot account (Dependabot and friends). */
export const isBot = (pr) => /\[bot\]$/.test(pr?.user?.login ?? "");
/** A release: from the release branch into another branch. */
export const isRelease = (pr, from = RELEASE_FROM) => Boolean(from) && pr?.head?.ref === from && pr?.base?.ref !== from;
const botLine = (title) => `Behind the scenes: an automatic dependency update — "${title.trim()}".`;

/** A block → its name (the leading **bold** line, else `fallback`) and its lines. */
export function parseBlock(block, fallback) {
  const bl = (block ?? "").split("\n");
  const head = /^\*\*([^*].*?)\*\*\s*$/.exec(bl[0] ?? "");
  const lines = head ? bl.slice(1) : bl;
  while (lines.length && !lines[0].trim()) lines.shift();
  return { name: head ? head[1].trim() : fallback, lines };
}

/** The finished entry for a merged PR. */
export function buildEntry({ number, title, url, mergedAt, body, label = REPO_LABEL || "repo", bot = false }) {
  const { stamp } = boiseStamp(mergedAt);
  const block = extractBlock(body);
  let name = title.trim();
  let lines;
  if (block) {
    ({ name, lines } = parseBlock(block, name));
    if (!lines.length) lines = [`- Behind the scenes: ${name}.`];
  } else if (bot) {
    lines = [`- ${botLine(name)}`];
  } else {
    lines = [`- Behind the scenes: ${name}. <!-- no plain-language history block was written for this PR -->`];
  }
  lines = lines.map((l) => l.replace(/· merged \?/g, `· merged ${stamp}`));
  return `**${label} #${number}: ${name}** · [PR #${number}](${url}) · merged ${stamp}\n${lines.join("\n")}`;
}

/** One feature PR carried by a release → its part lines (stamped with the release time). */
export function featureParts(f, stamp) {
  const title = f.title.trim();
  const block = extractBlock(f.body);
  if (!block) {
    const text = isBot(f) ? botLine(title) : `Behind the scenes: ${title}. <!-- no plain-language history block was written for PR #${f.number} -->`;
    return [`- **[${title}](${f.html_url})** · merged ${stamp}`, `  ${text}`];
  }
  const { name, lines } = parseBlock(block, title);
  if (lines.some((l) => /^- \*\*\[/.test(l))) return lines.map((l) => l.replace(/· merged \?/g, `· merged ${stamp}`));
  return [`- **[${name}](${f.html_url})** · merged ${stamp}`, ...lines.map((l) => (l.startsWith("- ") ? `  ${l.slice(2)}` : l))];
}

/** A release entry: its parts are the feature PRs it carried, newest first. */
export function buildReleaseEntry({ number, title, url, mergedAt, body, features, label = REPO_LABEL || "repo" }) {
  const { stamp } = boiseStamp(mergedAt);
  const own = extractBlock(body) ? parseBlock(extractBlock(body), null) : null;
  const names = features.map((f) => parseBlock(extractBlock(f.body) ?? "", f.title.trim()).name ?? f.title.trim());
  const name = own?.name ?? (names.length === 0 ? title.trim() : names.length <= 3 ? names.join(" · ") : `${names.slice(0, 2).join(" · ")} + ${names.length - 2} more`);
  let lines;
  if (own && own.lines.length) lines = own.lines.map((l) => l.replace(/· merged \?/g, `· merged ${stamp}`));
  else if (features.length) lines = features.flatMap((f) => featureParts(f, stamp));
  else lines = [`- Behind the scenes: ${title.trim()}. <!-- a release with no feature pull requests found -->`];
  return `**${label} #${number}: ${name}** · [PR #${number}](${url}) · merged ${stamp}\n${lines.join("\n")}`;
}

/** The feature PRs a release carried: PRs merged into the release branch that own a commit of this one. */
async function releaseFeatures(pr) {
  const repo = process.env.GITHUB_REPOSITORY;
  const gh = async (path) => {
    const r = await fetch(`https://api.github.com${path}`, { headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: "application/vnd.github+json" } });
    if (!r.ok) throw new Error(`GitHub API ${path}: HTTP ${r.status}`);
    return r.json();
  };
  const shas = [];
  for (let page = 1; page <= 3; page++) {
    const c = await gh(`/repos/${repo}/pulls/${pr.number}/commits?per_page=100&page=${page}`);
    shas.push(...c.map((x) => x.sha));
    if (c.length < 100) break;
  }
  const found = new Map();
  for (const sha of shas) {
    for (const p of await gh(`/repos/${repo}/commits/${sha}/pulls`)) {
      if (p.number !== pr.number && p.merged_at && p.base?.ref === RELEASE_FROM && !found.has(p.number)) found.set(p.number, p);
    }
  }
  return [...found.values()].sort((a, b) => b.merged_at.localeCompare(a.merged_at));
}

/** Put `entry` at the top of the newest-first document, under its month heading. */
export function insertEntry(doc, entry, mergedAt) {
  const { heading } = boiseStamp(mergedAt);
  const at = doc.search(/^## /m);
  if (at === -1) return `${doc.trimEnd()}\n\n${heading}\n\n${entry}\n`;
  const first = doc.slice(at).split("\n")[0];
  if (first === heading) {
    const after = at + first.length;
    return `${doc.slice(0, after)}\n\n${entry}\n${doc.slice(after).replace(/^\n+/, "\n")}`;
  }
  return `${doc.slice(0, at)}${heading}\n\n${entry}\n\n${doc.slice(at)}`;
}

function event() {
  const p = process.env.GITHUB_EVENT_PATH;
  if (!p) { console.error("history-append: no GITHUB_EVENT_PATH — this mode runs inside GitHub Actions."); process.exit(2); }
  return JSON.parse(readFileSync(p, "utf8")).pull_request;
}

function selfTest() {
  let pass = 0; const fails = [];
  const ok = (c, l) => (c ? pass++ : fails.push(l));
  // 20:31Z on 26.0918 is 14:31 in Boise (MDT, UTC−6); 03:00Z on 26.1001 is still 26.0930 in Boise.
  ok(boiseStamp("2026-09-18T20:31:59Z").stamp === "26.0918.1431", "stamp: UTC → Boise YY.MMDD.HHMM");
  ok(boiseStamp("2026-10-01T03:00:00Z").stamp === "26.0930.2100" && boiseStamp("2026-10-01T03:00:00Z").heading === "## September 2026", "stamp: a UTC date past midnight stays on the Boise day and month");
  ok(boiseStamp("2026-12-01T20:00:00Z").stamp === "26.1201.1300", "stamp: winter is MST (UTC−7)");
  const body = "**In plain words:** x.\n\n<!-- history -->\n**Pretty name**\n- New: a thing.\n  Try it: open http://localhost:8743\n<!-- /history -->\n\n🤖";
  ok(extractBlock(body) === "**Pretty name**\n- New: a thing.\n  Try it: open http://localhost:8743", "extract: the block between the markers, trimmed");
  ok(extractBlock("no block here") === null && extractBlock("<!-- history -->\n\n<!-- /history -->") === null, "extract: missing or empty block → null");
  ok(extractBlock("<!-- history -->\r\n**A**\r\n- New: b\r\n<!-- /history -->") === "**A**\n- New: b", "extract: CRLF bodies (GitHub's web editor) parse the same");
  const e = buildEntry({ number: 36, title: "feat: x", url: "https://github.com/travis-horton/praxis/pull/36", mergedAt: "2026-09-18T20:31:59Z", body, label: "praxis" });
  ok(e === "**praxis #36: Pretty name** · [PR #36](https://github.com/travis-horton/praxis/pull/36) · merged 26.0918.1431\n- New: a thing.\n  Try it: open http://localhost:8743", "entry: header from the block's name, stamped, lines kept verbatim");
  const parts = buildEntry({ number: 37, title: "t", url: "u", mergedAt: "2026-09-18T20:31:59Z", label: "praxis", body: "<!-- history -->\n**Two things**\n- **[One](c1)** · merged ?\n  Fixed: a.\n- **[Two](c2)** · merged ?\n  New: b.\n<!-- /history -->" });
  ok(parts.includes("- **[One](c1)** · merged 26.0918.1431") && parts.includes("- **[Two](c2)** · merged 26.0918.1431") && !parts.includes("merged ?"), "entry: every part's `merged ?` gets the merge stamp");
  const none = buildEntry({ number: 38, title: "chore: y", url: "u", mergedAt: "2026-09-18T20:31:59Z", body: "", label: "praxis" });
  ok(/^\*\*praxis #38: chore: y\*\*/.test(none) && none.includes("no plain-language history block"), "entry: no block → a visible, marked placeholder, never silence");
  ok(isBot({ user: { login: "dependabot[bot]" } }) && !isBot({ user: { login: "travis-horton" } }), "bot: a [bot] account is recognised, a person is not");
  ok(isRelease({ head: { ref: "dev" }, base: { ref: "main" } }, "dev") && !isRelease({ head: { ref: "feat/x" }, base: { ref: "dev" } }, "dev") && !isRelease({ head: { ref: "dev" }, base: { ref: "main" } }, ""), "release: dev → main is a release only when a release branch is configured");
  const dep = buildEntry({ number: 70, title: "Bump axios from 1 to 2", url: "u", mergedAt: "2026-09-18T20:31:59Z", body: "", label: "www", bot: true });
  ok(dep.endsWith('- Behind the scenes: an automatic dependency update — "Bump axios from 1 to 2".') && !dep.includes("no plain-language"), "bot: a Dependabot PR gets the stock line, not the missing-summary marker");
  const S = "26.0918.1431";
  const f1 = { number: 96, title: "feat: redirect", html_url: "https://x/pull/96", merged_at: "2026-09-17T17:00:00Z", user: { login: "t" }, body: "<!-- history -->\n**travish.com forwards to www**\n- New: the bare address forwards.\n  Try it: open https://travish.com\n<!-- /history -->" };
  ok(featureParts(f1, S).join("\n") === "- **[travish.com forwards to www](https://x/pull/96)** · merged 26.0918.1431\n  New: the bare address forwards.\n  Try it: open https://travish.com", "release part: a single-change feature becomes one part linked to its PR, labels indented");
  const f2 = { number: 91, title: "t", html_url: "https://x/pull/91", merged_at: "2026-09-17T16:00:00Z", user: { login: "t" }, body: "<!-- history -->\n**badge**\n- **[DEV badge](c1)** · merged ?\n  New: a tab.\n- **[Hidden from search](c2)** · merged ?\n  Behind the scenes: noindex.\n<!-- /history -->" };
  ok(featureParts(f2, S).join("\n") === "- **[DEV badge](c1)** · merged 26.0918.1431\n  New: a tab.\n- **[Hidden from search](c2)** · merged 26.0918.1431\n  Behind the scenes: noindex.", "release part: a feature with its own parts keeps them, stamped with the release");
  const f3 = { number: 70, title: "Bump braces", html_url: "https://x/pull/70", merged_at: "2026-09-16T00:00:00Z", user: { login: "dependabot[bot]" }, body: "" };
  const rel = buildReleaseEntry({ number: 99, title: "Merge dev", url: "https://x/pull/99", mergedAt: "2026-09-18T20:31:59Z", body: "", features: [f1, f2, f3], label: "www" });
  ok(rel.startsWith("**www #99: travish.com forwards to www · badge · Bump braces** · [PR #99](https://x/pull/99) · merged 26.0918.1431\n- **[travish.com forwards to www]") && rel.includes("- **[DEV badge](c1)**") && rel.includes("an automatic dependency update"), "release: no block of its own → named from its features, parts gathered in order");
  const rel2 = buildReleaseEntry({ number: 99, title: "Merge dev", url: "u", mergedAt: "2026-09-18T20:31:59Z", body: "<!-- history -->\n**About page rewritten**\n<!-- /history -->", features: [f1], label: "www" });
  ok(rel2.startsWith("**www #99: About page rewritten**") && rel2.includes("[travish.com forwards to www](https://x/pull/96)"), "release: a name-only block names it, the features still fill it");
  const many = buildReleaseEntry({ number: 88, title: "t", url: "u", mergedAt: "2026-09-18T20:31:59Z", body: "", features: [f1, f1, f1, f1].map((f, i) => ({ ...f, number: i })), label: "www" });
  ok(/^\*\*www #88: travish.com forwards to www · travish.com forwards to www \+ 2 more\*\*/.test(many), "release: more than three features → two names + N more");
  const doc = "# T\n\nintro\n\n## September 2026\n\n**old** · x\n- Fixed: z.\n";
  const d1 = insertEntry(doc, "**new** · y\n- New: w.", "2026-09-18T20:31:59Z");
  ok(d1 === "# T\n\nintro\n\n## September 2026\n\n**new** · y\n- New: w.\n\n**old** · x\n- Fixed: z.\n", "insert: same month → directly under the heading, one blank line either side");
  const d2 = insertEntry(doc, "**oct** · y\n- New: w.", "2026-10-02T18:00:00Z");
  ok(d2 === "# T\n\nintro\n\n## October 2026\n\n**oct** · y\n- New: w.\n\n## September 2026\n\n**old** · x\n- Fixed: z.\n", "insert: a new month → a new heading above the last one");
  console.log(fails.length ? fails.map((f) => `FAIL  ${f}`).join("\n") : "");
  console.log(`HISTORY-APPEND SMOKE ${fails.length ? "FAILED" : "PASSED"}  (${pass} passed · ${fails.length} failed · 0 skipped)`);
  process.exit(fails.length ? 1 : 0);
}

// Run the CLI only when started directly, so the builder can also be imported.
const direct = Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
const mode = direct ? process.argv[2] : null;
if (!direct) { /* imported: the exports above are the whole interface */ }
else if (mode === "--self-test") selfTest();
else if (mode === "--check") {
  const pr = event();
  if (isBot(pr)) { console.log(`history: PR #${pr.number} is an automatic update — it gets a stock line on merge ✓`); process.exit(0); }
  if (isRelease(pr)) { console.log(`history: PR #${pr.number} is a release — its entry is gathered from the feature PRs it carries ✓`); process.exit(0); }
  if (extractBlock(pr.body)) { console.log(`history: PR #${pr.number} carries its history block ✓`); process.exit(0); }
  console.error(
    `history: PR #${pr.number} has no history block. Add this to the description, in plain words (the repo-history skill's style.md, in Claude's configuration):\n\n` +
    "<!-- history -->\n**plain name of the change**\n- New: what you can now see or do.\n  Try it: the exact address or command.\n<!-- /history -->\n",
  );
  process.exit(1);
} else if (mode === "--append") {
  const pr = event();
  if (!pr.merged_at) { console.log(`history: PR #${pr.number} was closed without merging — nothing to record.`); process.exit(0); }
  // A repo installed before its backfill still records merges: start a bare file
  // rather than crash, and let the backfill fill in everything older.
  const doc = existsSync(DOC)
    ? readFileSync(DOC, "utf8")
    : `# ${REPO_LABEL || "repo"} — what changed, in plain words\n\nNewest first. Entries before the first one here are still to be written (the backfill).\n`;
  if (doc.includes(`[PR #${pr.number}](${pr.html_url})`)) { console.log(`history: PR #${pr.number} is already in HISTORY.md.`); process.exit(0); }
  const base = { number: pr.number, title: pr.title, url: pr.html_url, mergedAt: pr.merged_at, body: pr.body };
  const entry = isRelease(pr) ? buildReleaseEntry({ ...base, features: await releaseFeatures(pr) }) : buildEntry({ ...base, bot: isBot(pr) });
  writeFileSync(DOC, insertEntry(doc, entry, pr.merged_at));
  console.log(`history: PR #${pr.number} added to HISTORY.md.`);
} else {
  console.error("usage: history-append.mjs --check | --append | --self-test");
  process.exit(2);
}
