# AGENTS.md

## Long-Term Memory

### Updated

* 2026-03-11

### Session Retro (Homepage + Admin CMS upgrade)

#### What went wrong

1. Release sequence drift:

* Implemented broad refactor before locking critical runtime assumptions (`ADMIN_PASSWORD` injection, JSON validity, publish visibility rules).

* Result: service ran but publish/preview behavior was inconsistent.

1. Data integrity gap:

* `content.json` had malformed characters and partially broken JSON from mixed encoding / scraped text.

* Result: backend read/parse instability and frontend content mismatch.

1. Publish semantics mismatch:

* Frontend displayed only `published`, but admin defaulted imported curations to `draft` and had no status editor.

* Result: user clicked publish but homepage still looked empty.

1. UX regression in admin:

* Delete confirmation regressed to native `window.confirm` during refactor.

* Result: broke designed UI consistency and trust.

1. Draft persistence bug:

* Saved checksum string to draft storage instead of full JSON payload.

* Result: restore/dirty-state logic became unreliable and obscured publish state.

1. External media reliability assumption:

* Homepage used direct hotlink images (Douban), causing anti-hotlink broken images.

* Result: curations looked empty/broken despite data being present.

#### Durable lessons

1. Always lock “runtime truth” first:

* Env loading, ports, auth path, JSON parse, API contract smoke test.

1. Treat content as a schema-governed artifact:

* Never trust scraped fields; validate + sanitize before write.

1. “Published visibility” must be explicit in admin UI:

* If frontend filters by status, status must be editable and defaults must match business intent.

1. Preserve custom UX contracts during refactor:

* Keep a non-regression list (confirm/toast/loading states).

1. Verify end-to-end user outcome, not just API success:

* “Can save” is not enough; must verify “save -> homepage visible”.

1. Remote image strategy should be deterministic:

* Proxy + fallback by default for anti-hotlink sources.

## Reusable Workflow (SOP)

### Phase 0: Safety bootstrap (must pass before feature work)

1. Start services with explicit env (`.env` + `dotenv`).
2. Run 3 probes:

* frontend URL returns 200

* `/api/content` auth probe returns 200

* parse `src/data/content.json` successfully

1. Snapshot baseline:

* count of published items per section

* current API version/checksum

### Phase 1: Contract-first implementation

1. Lock schema and defaults (`status`, `locale`, required fields).
2. Implement admin controls for every visibility-affecting field.
3. Add validate-before-save and backup-before-write.
4. Keep UI non-regression items intact (custom confirm/toast/error surfaces).

### Phase 2: End-to-end verification

1. CRUD smoke for each section:

* create -> read -> update -> delete

1. Publish flow smoke:

* set item to `published` -> save -> refresh homepage -> confirm visible

1. Media reliability smoke:

* remote source through proxy

* intentional failure fallback image works

1. Quality gates:

* `npm run lint`

* `npm run build`

### Phase 3: Release checklist

* [ ] No malformed JSON / encoding corruption

* [ ] Admin publish success message corresponds to actual homepage visibility

* [ ] Custom confirm dialog present (no native fallback)

* [ ] Draft restore works (stores full payload)

* [ ] Curations images render with proxy/fallback

* [ ] Services start from clean shell with `.env` only

## Guardrails for future sessions

1. Before saying “fixed”, prove with concrete checks:

* API response + homepage result + lint/build.

1. If user reports “not updated”, inspect in this order:

* status filter mismatch -> content file validity -> proxy/media -> cache/HMR.

1. Prefer small, reversible patches around runtime-critical files:

* `scripts/admin-server.js`, `src/components/AdminPanel.tsx`, `src/data/content.json`.

