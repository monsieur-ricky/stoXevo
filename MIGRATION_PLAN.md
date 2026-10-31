# Angular 22 / Optimus UI migration

## Goals and constraints

- Upgrade Angular 20.1 to the latest stable Angular 22 (registry: 22.2.4 on 2026-10-31), using the Angular 21 migration bridge.
- Replace PrimeNG with MIT-licensed Optimus UI, including themes, Tailwind integration and icons. Use its official migration schematic where compatible.
- Preserve browser-only storage, existing encrypted data/export format and optional stoXscraper integration. No backend, telemetry, or E2E suite.
- Modernize with standalone APIs, signals, functional inputs/outputs/queries, built-in control flow and zoneless change detection where supported. Keep existing reactive forms rather than risk an unrelated rewrite.
- Testing trophy: static analysis; focused calculation/encryption unit tests; predominantly Angular integration tests covering storage, HTTP, stores and important UI workflows.
- Work from `improvement/angular-optimus-update`. Create incremental, stacked PRs for independently validated major steps; never merge to `main`. Each subsequent PR targets the preceding step branch so it only shows its own changes.

## Review findings

- App is already standalone, uses NgRx signal stores, functional interceptors and some modern Angular APIs.
- Angular packages are 20.1.x; TypeScript 5.7 is below Angular 20's supported range. Lockfile/install reproducibility needs checking.
- Test target is empty. ESLint 9 is configured with legacy `.eslintrc.json`, which also references an uninstalled Sheriff plugin.
- Bootstrap redundantly provides both synchronous and asynchronous legacy animation providers and imports `BrowserModule`.
- PrimeNG is referenced in components, stores, theme customization, styles and Tailwind configuration.
- Node 24.11.1 is available. GitHub CLI is initially unavailable; investigate authenticated PR creation without exposing credentials.

## Steps and acceptance criteria

### 1. Baseline tooling and regression protection
- [x] Repair reproducible Angular 20 install and flat ESLint configuration.
- [x] Add a runnable test harness and focused baseline unit/integration coverage.
- [x] Add CI quality gates (lint, tests, production build).
- [ ] Run all gates; record results and create PR 1 from the existing branch.

### 2. Angular 21 compatibility bridge
- [x] Run official Angular 20 → 21 migrations; align NgRx, CDK, UI and TypeScript peers.
- [x] Preserve production/PWA build; validate lint, tests, build and dependency peers.
- [ ] Update this log and create stacked PR 2.

### 3. Optimus UI replacement
- [x] Apply supported PrimeNG → Optimus migration (PrimeNG 21 bridge if required).
- [x] Migrate theme/provider/imports, icons, Tailwind plugin and styling overrides; remove unused PrimeNG dependencies/configurations.
- [x] Cover real UI integration behavior and visually smoke-check critical screens.
- [ ] Validate lint, tests, build, remaining references and dependency audit; create stacked PR 3.

### 4. Angular 22 and Optimus UI 2
- [x] Run official Angular 21 → 22 and Optimus UI 1 → 2 migrations, with compatible NgRx/CDK/tooling/TypeScript.
- [x] Use a supported Node runtime (Angular 22.2.4 needs Node ^22.22.3, ^24.15.0 or >=26).
- [ ] Validate lint, tests, production/PWA build and dependency peers; create stacked PR 4.

### 5. Angular modernization and final regression coverage
- [ ] Apply applicable official Angular code-modernization schematics.
- [ ] Remove redundant legacy bootstrap/animation/Zone.js code when UI compatibility permits.
- [ ] Expand integration-first tests for asset CRUD, calculations, persistence, PIN/import/export and stoXscraper HTTP boundaries, including failures.
- [ ] Update contributor/runtime/test documentation and resolve migration-related regressions.
- [ ] Run clean-install quality gates, production/PWA checks and final browser smoke checks; create stacked PR 5.

## Validation policy

A step is ready only after its lint, tests and production build pass. Use deterministic local fixtures and HTTP mocks; never query real financial accounts or alter real user data. Record blockers honestly (especially unavailable authentication/services); do not claim unperformed checks. No PR is merged automatically.

## Execution log

- Initial review and registry compatibility investigation complete. Plan stored before implementation.
- Step 1 implementation: added flat ESLint config, Angular's Vitest builder, calculation/storage/HTTP/store/UI baseline specs and CI gates. Disabled Angular CLI analytics to match the privacy goal.
- Baseline install exposed stale lockfile resolution conflicts. Regenerating the lockfile with aligned Angular 20.3 packages and supported TypeScript 5.9 (without forcing peer dependencies).
- Registry peer checks require an ordering adjustment: PrimeNG 21 requires Angular 21, Optimus 1 is the supported migration bridge, and Optimus 2 requires Angular 22. Split the framework upgrade into independently validated bridge and final-version PRs. Node 24.11.1 is too old for Angular 22.2.4; provisioning a temporary supported Node 24 runtime without modifying the user's system installation.
- Baseline lint and production/PWA build pass. TypeScript's stricter Web Crypto buffer types fixed without changing encryption bytes; a fixed legacy ciphertext fixture verifies compatibility. UI integration test uses zoneless TestBed to await signal-driven rendering.
- PR publication blocker: GitHub HTTPS credentials are unavailable and the in-app browser is signed out. SSH git access is available. Continue implementation and keep validated commits/branches and PR descriptions ready; never fabricate PR URLs or merge changes.
- Step 1 validation complete: lint has zero warnings/errors; 18 tests pass; production/PWA build passes; production dependency audit has zero findings. PR body: `docs/pull-requests/01-baseline.md`. PR publication remains authentication-blocked, so the combined validation/publication checkbox stays open.
- Step 1 committed as `ae9e023` and pushed to the existing branch. GitHub CLI installed, but `gh auth status` confirms no authenticated GitHub host; PR API creation cannot proceed unattended.
- Step 2: official Angular CLI/core/CDK and NgRx migrations completed on `improvement/angular-21-bridge` (Angular 21.2.25, CLI 21.2.29, CDK 21.2.14, NgRx 21.1.1, PrimeNG 21.1.10, Vitest 4.1.12). Added real asset drawer form integration checks and testing contributor guidance. Supported temporary Node runtime is 24.22.2.
- Step 2 form checks exercise manual asset creation via the actual drawer's Add button and invalid-form rejection. The invalid-state assertion follows the existing dirty-control validation contract rather than requiring touched controls.
- Step 2 validation complete: `npm run check` passes with zero lint warnings, 20 tests and production/PWA build. PR body: `docs/pull-requests/02-angular-21.md`; publication still authentication-blocked.
- Step 2 committed as `5626ef7` and pushed. Step 3 uses `improvement/optimus-ui` stacked on that branch.
- Step 3: official Optimus 1.0.2 migration rewrote providers/component/service imports, icon styles and package names. Manually replaced the older `@primeng/themes` package that the schematic does not recognize. Historical documentation references intentionally remain.
- Replaced ignored legacy Tailwind configs with Tailwind 4's CSS-first Optimus plugin and matching `.dark-mode` variant; retained custom `--p-*` tokens and `p-*` selectors (Optimus preserves these APIs). Updated deprecated `pTemplate` slots to named templates, fixed input-label associations and added accessible privacy/theme button names.
- Step 3 validation complete: zero-warning lint, 21 passing tests, production/PWA build and zero production audit findings. No legacy UI imports remain in source/manifest. Browser smoke on isolated `127.0.0.1:4307`: PIN entry, dashboard, mobile navigation, dark theme, portfolio table and manual-entry drawer; zero console errors. PR body: `docs/pull-requests/03-optimus-ui.md`.
- Step 3 branch pushed; Angular/Optimus major upgrade is running on `improvement/angular-22`. Pinned Node 24.22.2 for contributors and CI; updated setup instructions to describe optional scraper integration accurately. Added an idempotent PR publication helper (`scripts/open-migration-prs.sh`) that requires GitHub authentication and never merges.
- Step 4: official migrations completed (Angular 22.2.4, CLI/CDK/build 22.2.5, NgRx 22.0.1, Optimus suite 2.0.2, TypeScript 6.0.3). Root component explicitly uses OnPush rather than the migration's conservative Eager fallback.
- TypeScript 6 rejects deprecated `baseUrl`; removed it, made path mappings explicitly relative and replaced two bare `src/` imports. No TypeScript deprecation suppression added. Updating compatible Vitest 5, ESLint 10 and jsdom 29; removed unused Prettier/ESLint bridge packages and Autoprefixer.
- Step 4 validation complete: `npm run check` passes (zero-warning lint, 21 tests, production/PWA build). Dependency count reduced from 704 to 440; audit reduced to 18 moderate development findings and no high/critical findings. PR body: `docs/pull-requests/04-angular-22.md`.
