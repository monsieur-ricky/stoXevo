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
- [ ] Apply supported PrimeNG → Optimus migration (PrimeNG 21 bridge if required).
- [ ] Migrate theme/provider/imports, icons, Tailwind plugin and styling overrides; remove unused PrimeNG dependencies/configurations.
- [ ] Cover real UI integration behavior and visually smoke-check critical screens.
- [ ] Validate lint, tests, build, remaining references and dependency audit; create stacked PR 3.

### 4. Angular 22 and Optimus UI 2
- [ ] Run official Angular 21 → 22 and Optimus UI 1 → 2 migrations, with compatible NgRx/CDK/tooling/TypeScript.
- [ ] Use a supported Node runtime (Angular 22.2.4 needs Node ^22.22.3, ^24.15.0 or >=26).
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
