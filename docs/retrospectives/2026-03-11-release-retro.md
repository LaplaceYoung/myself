# 2026-03-11 Retro: Homepage + Admin CMS

## Context
- Scope: frontend visibility issues, admin publish failures, UX consistency regressions.
- Goal: stabilize publish-to-homepage loop and preserve designed admin interaction quality.

## Error Log
1. Service boot looked healthy but env was not reliably loaded.
2. `content.json` contained malformed scraped strings and partial JSON corruption.
3. Admin defaulted new/imported curations to `draft` while homepage filtered `published` only.
4. Custom delete confirmation regressed to native confirm.
5. Draft restore stored checksum instead of payload.
6. Homepage images relied on anti-hotlink remote URLs.

## Root Causes
- Refactor executed ahead of runtime contract checks.
- Missing end-to-end acceptance test for “publish then visible on homepage”.
- Missing “visibility field parity” rule between frontend filters and admin controls.
- Missing anti-hotlink handling policy for external media sources.

## Corrective Actions Applied
- Added explicit env loading and auth hardening paths.
- Repaired JSON reading robustness and publish write flow.
- Added status/locale controls in admin and changed curation import defaults.
- Restored custom modal confirmation UX.
- Fixed draft persistence to store full content payload.
- Added proxy + fallback logic for curation images.

## Reusable Playbook
1. Boot probes first (frontend 200, admin 200, JSON parse ok).
2. Validate schema and required visibility fields.
3. Implement UI with non-regression components preserved.
4. Run CRUD + publish-visible + media fallback E2E checks.
5. Close with lint/build and explicit user-facing proof points.
