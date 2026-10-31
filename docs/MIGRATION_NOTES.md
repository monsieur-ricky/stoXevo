# Angular 22 migration notes

## Architecture

- Angular 22.2.4, TypeScript 6.0.3 and Optimus UI 2.0.2; Node is pinned in
  `.nvmrc`. `npm ci` uses the committed lockfile.
- Standalone, lazy-loaded routes and OnPush components remain. Bootstrap is
  zoneless, HTTP uses Angular's default Fetch backend, and UI animations are
  supplied by Optimus rather than deprecated Angular animation providers.
- Existing signal inputs/outputs/queries, NgRx signal stores and block control
  flow are retained. Menu state uses `linkedSignal`; profile requests use
  `httpResource` so navigation cancels stale requests. Network subscriptions
  are disposed with their injection context.
- Existing reactive forms are intentionally preserved. A wholesale rewrite to
  signal forms would add unnecessary risk to the library/framework migration.
- Tailwind 4's CSS-first Optimus plugin and the Lara preset use the same
  `.dark-mode` selector. Optimus preserves the `p-*`, `pi-*` and `--p-*` APIs.

## Data compatibility and privacy

There is no backend or new telemetry. Existing AES-GCM ciphertext, separate salt
and IV keys, base64 encoding and JSON backup envelopes remain compatible; a
fixed legacy ciphertext fixture is tested. Wrong PINs no longer dismiss the
lock screen, and invalid/wrong-PIN backups are rejected before replacing data.
Export no longer depends on configuring a scraper API key.

Back up data before deploying a major upgrade. Browser storage is still tied to
the deployment origin, and clearing site data deletes the portfolio. The
stoXscraper endpoint remains explicitly configured in `src/app/app.settings.ts`.

### Existing limitations not redesigned in this migration

- The original four-digit PIN/PBKDF2 parameters are weak against offline
  guessing. Improving these safely needs a separately versioned storage-format
  and key-management migration, not an incompatible silent change.
- The original Google Fonts and Buy Me a Coffee widget/assets still make
  third-party requests. The financial app remains local-first, but fully
  offline/no-third-party-request operation needs a separate privacy review.
- Browser storage quotas/availability and financial precision/currency
  aggregation limitations are unchanged. This is not investment advice.

## Dependency audit

Production dependencies have no reported npm audit vulnerabilities. The current
development-tool graph reports moderate findings propagated from
`minimatch <11.0.1` (GHSA-g3hv-75wg-m249), required by ESLint/TypeScript ESLint.
There are no high/critical findings. Do not use `npm audit fix --force`: its
proposed downgrades break the supported toolchain. A cross-major minimatch
override is intentionally avoided pending supported upstream dependency updates.

## Review workflow

See `MIGRATION_PLAN.md` and `docs/pull-requests/` for independently validated
checkpoints. `bash scripts/open-migration-prs.sh` publishes the stacked PRs after
`gh auth login`; it never merges. Merge only with explicit maintainer approval,
in checkpoint order. Local browser smoke checks use a separate origin and
synthetic data, never the deployed portfolio.
