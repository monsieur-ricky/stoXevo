# Modern Angular APIs and integration-first regression coverage

Base: `improvement/angular-22`  
Head: `improvement/angular-modernization`

## Summary
- Zoneless standalone bootstrap, default Fetch HTTP, no Zone.js or redundant
  legacy animation/bootstrap packages. Preserve reactive forms and current data
  format rather than add a risky rewrite.
- Cancellation-aware `httpResource` profile loading, `linkedSignal` menu state,
  lifecycle-managed network signals and official template modernization.
- 40 tests following the testing trophy: mostly Angular integration covering
  asset forms/CRUD/totals, legacy data, encrypted persistence and file backups,
  PIN retry, HTTP/auth isolation, routing/resource cancellation, theme/privacy
  controls and failure paths. No E2E suite.
- Fix regressions exposed by those checks: wrong-PIN unlocking, destructive
  malformed backup import, exports depending on an API key, fire-and-forget
  persistence, leaked network listeners and API keys on unrelated HTTP origins.
- Restore strict template diagnostics and verify PWA artifact/cache hashes in CI.
- Mark the search-only autocomplete standalone inside asset forms to avoid
  Angular 22's NG01354 warning; use Optimus's current `optionLabel` API.
- Document compatibility and existing security/privacy limitations in
  `docs/MIGRATION_NOTES.md`; update the migration execution log.

## Validation
- Clean `npm ci` with supported Node 24.22.2.
- `npm run check`: zero lint warnings, 40 passing tests across 13 files,
  production build, all 26 service-worker cache entries/hash checks pass.
- `npm audit --omit=dev`: zero vulnerabilities; full audit has 18 moderate
  development-only findings inherited from minimatch, no high/critical findings.
- `npm ls --depth=0`: clean supported package tree.
- Browser smoke on an isolated synthetic-data origin: PIN entry/retry, manual
  asset creation, portfolio table, theme/privacy toggle, dashboard (20 invested,
  30 value, 10 gain, 50%), persistence across reloads; zero console errors.
- Source/manifest scan: no PrimeNG, PrimeIcons, Zone.js or legacy animation imports.
- Local and remote `main` still point to `701ec580e4a23ffca689fbdd3ac97c65462146fc`.

Do not merge without maintainer approval. Review/merge the preceding stacked PRs
first; publication helper never merges or enables auto-merge.
