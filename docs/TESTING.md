# Testing trophy

Run `npm run check` before proposing a change. CI runs the same lint, non-watch
Vitest suite, production build and service-worker asset/hash verification after
a clean `npm ci`.

## What belongs where

- **Static checks:** strict TypeScript/Angular templates and ESLint recommended
  TypeScript, Angular and accessibility rules. No ignored lint warnings.
- **Integration tests (the largest layer):** use Angular TestBed with real
  collaborating stores, forms, pipes and browser storage. Mock only external
  HTTP using `provideHttpClientTesting` and `HttpTestingController`; verify no
  unmatched requests remain. Exercise rendered controls for UI behavior.
- **Unit tests:** deterministic financial math and encoding edge cases. Include
  a fixed pre-migration ciphertext fixture so encryption compatibility is not
  tested only against itself.
- **E2E:** intentionally excluded from this migration.

## Conventions

Keep specs beside the implementation. Await `fixture.whenStable()` after input,
signal or DOM changes; do not force change detection to make tests pass. Use
signals for component input state. Avoid arbitrary sleeps, private methods and
snapshots of library internals. Prefer visible labels and accessible names.

All fixtures are synthetic. Tests must never call a running stoXscraper instance
or require real credentials. Storage tests clear their isolated jsdom storage
before/after each case. Browser smoke checks use a separate localhost port, not
an existing origin that might contain the user's financial data.

For targeted work:

```bash
npm test -- --watch=false --include='src/app/shared/data/**/*.spec.ts'
```

## AI market-data regression coverage

The same `npm run check` gates apply to every phase in `AI_MARKET_DATA_PLAN.md`. Specs under `src/app/shared/data/market-data/` exercise mocked provider HTTP boundaries, cited retrieval/schema extraction, batching, cache invalidation, per-instrument failure, consent, key isolation and the existing metal source. Settings tests use real rendered controls and disposable encrypted storage. The PWA check rejects financial response caches.

Never use production keys/holdings in CI. Live model accuracy, costs and deployed-origin CORS are separate opt-in release checks described in `docs/AI_MARKET_DATA.md`; passing mocks does not prove them.

## Migration review requests

The major steps are separate, stacked branches, listed in `MIGRATION_PLAN.md`.
After authenticating with `gh auth login`, run:

```bash
bash scripts/open-migration-prs.sh
```

The helper reuses existing open PRs and creates only missing ones, each against
the preceding checkpoint. It never merges or enables auto-merge. Approve and
merge in order; retarget subsequent PRs as their bases land.
