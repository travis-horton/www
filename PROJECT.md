# www Backend Project

Personal website for Travis Horton at travish.com. Currently a static React app deployed via Docker + nginx-proxy on DigitalOcean. Backend is the active project: a Zig API server with PostgreSQL, magic link auth, and a journal sync pipeline.

**Why Zig:** Learning project — Travis knows Zig's creator one-friend-removed.
**Frontend:** JS, React 18, Parcel 2, React Router v6. Deployed via Docker + GitHub Actions.
**Stage:** kiddspazz.com (`dev` branch) | **Prod:** travish.com (`main` branch)
**Journal data:** ~2,918 daily HTML entries (Oct 2017–present) in `~/journal/`, structured **`YY/MM/YYMMDD.html`** (e.g. `26/06/260625.html` — note the two nesting levels: year dir, then month dir, then 6-digit day file). ⚠️ **Also a real `04/` dir of genuine 2004 entries** — the journal predates the daily run, so the parser must handle years 2004 + 2017→present, not just "from 2017." Currently baked into the frontend as a JSON blob. Entries from ~2020 onward have structured metrics; earlier ones less so. *(The old Node prep script `clean_blog_data.mjs` — written for the pre-rename `blog/YYMM/` layout (one level, 4-digit names) — is **archived in `_archive/`**, defunct after the blog→journal rename. Its job is superseded by the Phase 2/3 Zig migration + journal API below, so it's intentionally not being fixed.)*

**Division of labor:** Travis writes code himself — Zig, infra, all of it. Claude is tutor, not author.

---

## Status

- Frontend: deployed, stable
- Backend: not started
- Frontend TODOs: add blog posts, write tests (expand beyond smoke tests — priorities: Image lazy-load, Journal date logic, Header active route highlighting)

---

## Hosting & Cost Consolidation (decided 2026-06-19)

**DigitalOcean spend: was $27/mo → now $12/mo** (managed Postgres destroyed 2026-06-20). Remaining: `travish` droplet ($6, 1vcpu/1gb) + `kiddspazz` droplet ($6). GoDaddy: travish.com $22.19/yr (auto-renews Sept).

**The $15/mo managed Postgres cluster is idle** (backend not built; frontend is static) and contradicts this doc's Architecture (Postgres should be a *container* on the droplet). It's the consolidation target.

- **✓ DONE 2026-06-20 — Destroyed the managed Postgres cluster `db-postgresql-sfo2-25213`** → saves **$15/mo / $180/yr**. Comes off the bill next cycle (DO prorates).
- [ ] **Move staging to `staging.travish.com`** (nginx vhost on the travish droplet), freeing **kiddspazz.com to be a private side-project sandbox** (Travis's call 2026-06-19 — keep it as a separate domain for unreleased experiments).
- [ ] *(Optional)* collapse the two $6 droplets into one (nginx vhosts: travish + staging.travish + kiddspazz) → −$72/yr. Keep separate only if you want hard isolation for sandbox experiments.
- [ ] *(Optional)* move domains to Cloudflare Registrar (~$10/yr, free DNS, no GoDaddy upsell spam).

**⚠️ Phase 2 reminder: run PostgreSQL as a Docker container on the droplet (per the Architecture diagram). Do NOT re-provision a managed DB cluster** — it's overkill for a single-user journal app.

Target: **$27/mo → $6–12/mo** (~$180–252/yr saved).

---

## Interleaved with Family Tree

This project shares a learning path with the **Family Tree / Postgres project** (`~/codex_organon/4_vocation/software/family_tree/`). You're building Postgres and backend skills through the family tree while simultaneously working toward the travish.com backend.

**The interleaved sequence:**

1. ~~Family Tree Project 1: Postgres Foundations~~ **DONE** (2026-03-16)
2. ~~Family Tree Project 2: Relational Design~~ **DONE** (2026-06-10)
3. **Backend Phase 1: Zig Scaffold** — CURRENT (next interleave step)
4. Family Tree Project 3: Self-Referential Data & Trees
5. Family Tree Project 4: Making the Database Smart
6. Backend Phase 2: Postgres + Migration (dovetail: seed family tree with real data here too)
7. Backend Phases 3-7: Journal API, Magic Link Auth, Docker/Deploy, Frontend Auth, Sync Pipeline
8. Family Tree Project 5: Zig + libpq backend
9. Family Tree Project 6: Visualization (D3.js)

---

## Architecture

```
                DigitalOcean VPS
┌────────────────────────────────────────────┐
│  nginx-proxy (SSL via Let's Encrypt)       │
│     │                                      │
│     ├──▶ web (nginx, static React app)     │
│     │      /api/* proxied to api container │
│     │                                      │
│     └──▶ api (Zig binary, port 8080)       │
│            ▼                               │
│          PostgreSQL 16 (container)         │
│            port 5432 (internal only)       │
└────────────────────────────────────────────┘
```

**Key decisions:**
- **Path-based routing** (`/api/*`) — no separate subdomain, no CORS issues. The web container's nginx proxies `/api/*` to the api container.
- **httpz** for the HTTP server — Karl Seguin's lightweight Zig HTTP framework
- **pg.zig** for PostgreSQL — Karl Seguin's Zig PostgreSQL driver (async, no ORM overhead)
- **Session cookies** (HttpOnly, Secure, SameSite=Strict) for auth — simpler than JWTs for a single-user app
- **Mailgun HTTP API** for sending magic link emails (simpler than SMTP in Zig)
- **Deploy BEFORE frontend auth** so the API is live before wiring up React

---

## Backend Phases

### Phase 1: Zig Project Scaffold + Hello World API
**Goal:** Get an httpz HTTP server running that responds to `GET /api/health`

12 tasks: Install Zig + hello world -> basics (variables, functions, types) x2 -> structs, enums, error handling x2 -> allocators x2 -> slices and strings -> httpz docs x2 -> write health handler -> test with curl.

Create `api/` directory in the www repo:
```
api/
├── build.zig          # build config, httpz + pg.zig as dependencies
├── build.zig.zon      # package manifest (httpz, pg.zig URLs + hashes)
├── src/
│   ├── main.zig       # Server init, route registration
│   ├── config.zig     # Env var loading
│   └── routes/
│       └── health.zig # GET /api/health → {"status":"ok"}
```

**Verify:** `cd api && zig build run`, then `curl localhost:8080/api/health`

### Phase 2: PostgreSQL + Schema + Data Migration
**Goal:** 2,918 journal entries queryable in PostgreSQL
**(Postgres = Docker container on the droplet, NOT a managed DB cluster — see Hosting & Cost Consolidation above.)**

13 tasks: Design SQL schema (from `~/journal/create_table.txt`, 24 fields) -> write `001_create_journal.sql` -> write `002_create_auth.sql` -> set up local Postgres -> run migrations -> Node.js HTML parser for journal entries x2 -> DB seeder script -> seed and verify -> pg.zig basics x2 -> connect Zig to Postgres -> test query.

- Add PostgreSQL 16 container to `docker-compose.yml`
- Create SQL migration files:
  - `migrations/001_create_journal.sql` — journal table based on existing `~/journal/create_table.txt` schema (24 fields), plus `created_at`/`updated_at` timestamps
  - `migrations/002_create_auth.sql` — users, magic_links, sessions tables
- Write a Node.js migration script (`scripts/migrate_journal_html.mjs`) that:
  - Reads all `*.html` files from `~/journal/YY/MM/YYMMDD.html`
  - Parses the structured HTML to extract: date, blog number/time, all metrics, story text, goals, wants
  - Handles format evolution (early entries have less structure)
  - Generates SQL INSERTs
- Wire up pg.zig in the Zig app (`api/src/db.zig` — connection pool setup)

Journal data: ~2,918 HTML files in `~/journal/` (YY/MM/YYMMDD.html, Oct 2017-present). Entries from ~2020 onward have structured metrics; earlier entries are less structured.

**Verify:** `psql -c "SELECT count(*) FROM journal;"` → 2918

### Phase 3: Journal API Endpoints (no auth yet)
**Goal:** CRUD API for journal entries

10 tasks: Zig JSON serialization (std.json) x2 -> define journal model struct -> `GET /api/journal` list x2 -> `GET /api/journal/:date` -> `POST /api/journal` x2 -> `PUT /api/journal/:date` -> test all with curl.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/journal` | Summary list (date, how_i_felt, s_count) for the grid |
| `GET` | `/api/journal/:date` | Full entry by date |
| `POST` | `/api/journal` | Create entry |
| `PUT` | `/api/journal/:date` | Update entry |

Files:
- `api/src/routes/journal.zig` — handlers
- `api/src/models/journal.zig` — structs (JSON serialization)
- `api/src/app_state.zig` — shared state struct (holds pg.Pool + config)
- Update `api/src/main.zig` — register routes, init AppState

**Verify:** `curl localhost:8080/api/journal | jq '.entries | length'` → 2918

### Phase 4: Magic Link Authentication (backend)
**Goal:** Email-based login flow, session management

14 tasks: Design auth flow + token format -> create auth DB tables -> token generation -> `POST /api/auth/login` x2 -> send magic link email (Mailgun) x2 -> `GET /api/auth/verify` x2 -> auth middleware x2 -> `GET /api/auth/me` -> `POST /api/auth/logout` -> test full flow.

Auth flow:
1. `POST /api/auth/login {email}` → generate token, store in magic_links table, send email with link
2. User clicks link → `GET /api/auth/verify?token=X` → validate token, create session, set HttpOnly cookie
3. `GET /api/auth/me` → check session cookie, return user info or 401
4. `POST /api/auth/logout` → delete session, clear cookie

Files:
- `api/src/routes/auth.zig` — login, verify, me, logout handlers
- `api/src/middleware/auth.zig` — session validation middleware for protected routes
- `api/src/email.zig` — magic link email sending via Mailgun HTTP API

Auth middleware: public routes (`/api/health`, `/api/auth/*`) pass through; all others require valid session cookie.

**Verify:** Manual flow — POST login, check DB for token, GET verify with token, confirm Set-Cookie header, use cookie to access journal endpoints

### Phase 5: Docker + Deployment
**Goal:** Both frontend and backend deploy automatically (deploy BEFORE frontend auth so API is live before wiring up React)

6 tasks: Zig Dockerfile (multi-stage) x2 -> add api + db to docker-compose.yml -> update nginx.conf with `/api/` proxy_pass -> update GitHub Actions -> deploy to kiddspazz.com and test.

New/modified files:
- `api/Dockerfile` — multi-stage: Zig build → minimal Alpine image with just the binary
- `docker-compose.yml` — add `api` and `db` services, use a named Docker network instead of bridge
- `nginx/nginx.conf` — add `location /api/ { proxy_pass http://api:8080; }` block
- `.github/workflows/deploy-to-dev.yml` — build both web and api images, push, deploy all containers
- `.github/workflows/deploy-to-prod.yml` — pull and run all containers (web, api, db)
- `.env` — add DB_PASSWORD, MAILGUN_API_KEY, SESSION_SECRET
- `.env.example` — update with new vars

**Verify:** Push to `dev`, confirm kiddspazz.com serves frontend and `/api/health` responds

### Phase 6: Frontend Auth Integration (React)
**Goal:** Journal page requires login, fetches data from API

6 tasks: Build AuthContext + useAuth hook -> LoginForm component -> wire Journal to fetch from API x2 -> handle magic link callback -> test end-to-end.

New files:
- `src/auth/AuthContext.jsx` — React context providing auth state
- `src/auth/useAuth.js` — hook: checkSession, login, logout
- `src/auth/LoginForm.jsx` — email input + submit

Modified files:
- `src/App.jsx` — wrap with AuthProvider, add protected route logic for `/journal`
- `src/pages/Journal/index.jsx` — fetch from `/api/journal` instead of importing static JSON, show LoginForm if not authenticated, handle `?token=` query param for magic link callback

The Journal component stays hidden from navigation (already not in `pages.js`). When unauthenticated users hit `/journal`, they see the login form. After magic link verification, the journal grid loads from the API.

**Verify:** Visit `/journal` → see login form → enter email → receive email → click link → journal loads

### Phase 7: Journal Data Sync Pipeline
**Goal:** Mechanism to sync new entries from the GitHub journal repo to the DB

4 tasks: GitHub Action for journal repo sync x2 -> API key auth for sync endpoint -> test push-and-verify.

- Script or GitHub Action that, when the journal repo is updated, calls `POST /api/journal` with the parsed entry data
- Could be: a GitHub Action in the journal repo that runs on push, parses the new/changed HTML file(s), and POSTs to the API
- API key or shared secret for the sync endpoint (separate from user auth)

**Verify:** Add a new HTML entry to journal repo → push → entry appears in DB

---

## Files Modified/Created Summary

**New (Zig backend):**
- `api/` — entire new directory (build.zig, build.zig.zon, src/**/*.zig)

**New (infrastructure):**
- `api/Dockerfile`
- `migrations/001_create_journal.sql`
- `migrations/002_create_auth.sql`
- `scripts/migrate_journal_html.mjs`

**New (frontend auth):**
- `src/auth/AuthContext.jsx`
- `src/auth/useAuth.js`
- `src/auth/LoginForm.jsx`

**Modified:**
- `docker-compose.yml` — add api + db services
- `nginx/nginx.conf` — add /api/ proxy_pass
- `.github/workflows/deploy-to-dev.yml` — build/deploy api
- `.github/workflows/deploy-to-prod.yml` — deploy api + db
- `src/App.jsx` — AuthProvider, protected Journal route
- `src/pages/Journal/index.jsx` — fetch from API instead of static import
- `.env` / `.env.example` — new variables

---

## Zig Dependencies

| Package | Purpose |
|---------|---------|
| httpz | HTTP framework (Karl Seguin) |
| pg.zig | PostgreSQL driver (Karl Seguin) |
| std.json | JSON serialization (Zig stdlib) |
| std.crypto | Token generation (Zig stdlib) |
| std.http | Mailgun HTTP API calls (Zig stdlib) |

---

## Verification (end-to-end)

1. `docker compose up` starts web, api, and db containers
2. Run migration script to seed journal data
3. `curl localhost:8080/api/health` → `{"status":"ok"}`
4. Visit `localhost:1234/journal` → login form appears
5. Enter email → receive magic link email
6. Click link → journal grid loads with data from PostgreSQL
7. All other pages (/, /programming, /piano, etc.) remain publicly accessible
8. `yarn test` — existing frontend tests pass, new auth tests pass

---

## Estimated Timeline

~65 discrete tasks across 7 phases. ~13-18 weeks at 5-8 hrs/week.
