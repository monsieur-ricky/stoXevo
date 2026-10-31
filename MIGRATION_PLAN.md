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
- [x] Run all gates and record results.
- [x] Publish PR 1 from the existing branch: [#13](https://github.com/monsieur-ricky/stoXevo/pull/13).

### 2. Angular 21 compatibility bridge
- [x] Run official Angular 20 → 21 migrations; align NgRx, CDK, UI and TypeScript peers.
- [x] Preserve production/PWA build; validate lint, tests, build and dependency peers.
- [x] Update this log and prepare stacked PR 2.
- [x] Publish PR 2: [#14](https://github.com/monsieur-ricky/stoXevo/pull/14).

### 3. Optimus UI replacement
- [x] Apply supported PrimeNG → Optimus migration (PrimeNG 21 bridge if required).
- [x] Migrate theme/provider/imports, icons, Tailwind plugin and styling overrides; remove unused PrimeNG dependencies/configurations.
- [x] Cover real UI integration behavior and visually smoke-check critical screens.
- [x] Validate lint, tests, build, remaining references and dependency audit; prepare stacked PR 3.
- [x] Publish PR 3: [#15](https://github.com/monsieur-ricky/stoXevo/pull/15).

### 4. Angular 22 and Optimus UI 2
- [x] Run official Angular 21 → 22 and Optimus UI 1 → 2 migrations, with compatible NgRx/CDK/tooling/TypeScript.
- [x] Use a supported Node runtime (Angular 22.2.4 needs Node ^22.22.3, ^24.15.0 or >=26).
- [x] Validate lint, tests, production/PWA build and dependency peers; prepare stacked PR 4.
- [x] Publish PR 4: [#16](https://github.com/monsieur-ricky/stoXevo/pull/16).

### 5. Angular modernization and final regression coverage
- [x] Apply applicable official Angular code-modernization schematics.
- [x] Remove redundant legacy bootstrap/animation/Zone.js code when UI compatibility permits.
- [x] Expand integration-first tests for asset CRUD, calculations, persistence, PIN/import/export and stoXscraper HTTP boundaries, including failures.
- [x] Update contributor/runtime/test documentation and resolve migration-related regressions.
- [x] Run clean-install quality gates, production/PWA checks and final browser smoke checks; prepare stacked PR 5.
- [x] Publish PR 5: [#17](https://github.com/monsieur-ricky/stoXevo/pull/17).

## Validation policy

A step is ready only after its lint, tests and production build pass. Use deterministic local fixtures and HTTP mocks; never query real financial accounts or alter real user data. Record blockers honestly (especially unavailable authentication/services); do not claim unperformed checks. No PR is merged automatically.

## Execution log

- Initial review and registry compatibility investigation complete. Plan stored before implementation.
- Step 1 implementation: added flat ESLint config, Angular's Vitest builder, calculation/storage/HTTP/store/UI baseline specs and CI gates. Disabled Angular CLI analytics to match the privacy goal.
- Baseline install exposed stale lockfile resolution conflicts. Regenerating the lockfile with aligned Angular 20.3 packages and supported TypeScript 5.9 (without forcing peer dependencies).
- Registry peer checks require an ordering adjustment: PrimeNG 21 requires Angular 21, Optimus 1 is the supported migration bridge, and Optimus 2 requires Angular 22. Split the framework upgrade into independently validated bridge and final-version PRs. Node 24.11.1 is too old for Angular 22.2.4; provisioning a temporary supported Node 24 runtime without modifying the user's system installation.
- Baseline lint and production/PWA build pass. TypeScript's stricter Web Crypto buffer types fixed without changing encryption bytes; a fixed legacy ciphertext fixture verifies compatibility. UI integration test uses zoneless TestBed to await signal-driven rendering.
- PR publication blocker: GitHub HTTPS credentials are unavailable and the in-app browser is signed out. SSH git access is available. Continue implementation and keep validated commits/branches and PR descriptions ready; never fabricate PR URLs or merge changes.
- Step 1 validation complete: lint has zero warnings/errors; 18 tests pass; production/PWA build passes; production dependency audit has zero findings. PR body: `docs/pull-requests/01-baseline.md`. PR publication remains authentication-blocked.
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
- Step 4 committed as `8798545` and pushed. Final work is on `improvement/angular-modernization`, stacked on `improvement/angular-22`.
- Step 5: official self-closing-tag schematic modernized 3 files; unused-import schematic found no unused component imports. Existing signal inputs/outputs/queries and block control flow were already modern. Converted bootstrap to zoneless/default Fetch HTTP and removed Zone.js plus legacy animation/bootstrap packages/providers. Existing 21 tests and production/PWA build still pass after this change.
- Replaced imperative profile loading with cancellation-aware `httpResource`, mirrored menu-state effect with `linkedSignal`, and leaking network event listeners with lifecycle-managed `toSignal`. Re-enabled the template diagnostics that the Angular compatibility migration had suppressed and removed its temporary safe-navigation helper.
- Expanding integration coverage for route-bound profiles/cancellation/errors, network teardown, PIN retry and encrypted file import/export. Regression fixes keep a wrong PIN locked, validate/decrypt backups before overwriting current data, surface import errors, await persistence and allow manual-only portfolio exports without an API key. Encryption/export format is unchanged.
- Step 5 interim validation: 37 tests, zero-warning lint and zoneless production build pass. Added API-key origin isolation, legacy purchase loading and quote failure checks, plus a service-worker artifact/hash verifier in both local checks and CI. Running final clean-install checks next. Production initial bundle is approximately 1.22 MB, down from the 1.33 MB Angular 22 compatibility checkpoint.
- Final validation after clean `npm ci`: `npm run check` passes (40 tests across 13 files, zero lint warnings, production build and all 26 PWA cache hashes). `npm ls --depth=0` is clean; production audit has zero findings. Full audit retains 18 moderate development-only minimatch findings, documented without unsafe cross-major overrides.
- Final browser smoke on isolated synthetic data passes: real manual asset creation, portfolio table, light/dark and privacy controls, dashboard calculations (20 investment / 30 value / 10 gain / 50%), encrypted persistence after reload, wrong-PIN error and successful retry. No Zone.js at runtime and zero console errors. No real user portfolio or deployed origin was accessed.
- No legacy UI/Zone.js/Angular-animation imports remain in source. Local and remote `main` remain unchanged at `701ec580e4a23ffca689fbdd3ac97c65462146fc`. PR 5 body: `docs/pull-requests/05-modernization.md`.
- Final implementation checkpoint `6379b4a` is pushed to `improvement/angular-modernization`; all five checkpoint branches are on origin. Executed the PR publication helper after pushing: GitHub CLI exits at its authentication check because no GitHub host is logged in. No PRs were created, and no merge was attempted. Temporary smoke-test server stopped; synthetic browser fixtures remain isolated from deployed data.
- Final shutdown-log review surfaced Angular 22's NG01354 warning for the search-only autocomplete nested in the asset reactive form. Explicitly opted that control out of parent form registration, updated its label API to `optionLabel`, and added a warning regression assertion to the drawer integration test. Revalidating the final checkpoint before completion.
- Follow-up validation passes: zero-warning lint, all 40 tests (including the NG01354 guard), production build and all 26 PWA hashes. Final initial bundle is 1.23 MB. The final follow-up is included on the same modernization review branch; only GitHub-authenticated PR publication remains outstanding.
- GitHub authentication is now available. Published PRs #13–#17 and verified their stacked base/head branches; all remain open and unmerged. Linux CI exposed missing optional `@emnapi/core` / `@emnapi/runtime` lockfile entries in the Angular 22 and modernization checkpoints. Repairing these with the same npm version as CI (11.19.1), without bypassing clean-install validation.
- Repaired both lockfiles with npm 11.19.1: existing package versions are unchanged; missing optional WASM peers and bundled metadata are now recorded. Fresh `npm ci` and all local gates pass on both checkpoints (21 tests for PR #16; 40 tests and 26 PWA hashes for PR #17). PRs #13–#15 have green GitHub checks; awaiting Linux CI confirmation of the two lockfile repairs.
- Linux CI subsequently passed for every PR, including both repaired lockfiles. Synchronizing PR #17 with its corrected base introduced merge commit `acfa00e`; GitHub reported that head as mergeable but not rebaseable. The active `Main` ruleset requires linear history, so enabling merge commits in repository settings alone does not resolve stack rebase eligibility.
- With explicit maintainer authorization, linearized only PR #17 onto PR #16's existing head (`329a7eb`). Preserved the old head in local backup branch `backup/angular-modernization-pre-linearization-acfa00e`. The replacement implementation commit's entire Git tree exactly matches the previously approved `acfa00e` tree; application code, tests, dependencies and build configuration are unchanged. This log update is the only subsequent content change. Fresh `npm ci` and `npm run check` pass with Node 24.22.2 / npm 11.19.1: zero lint warnings, 40 tests, production build and all 26 PWA hashes. Updating only the authorized branch with an exact-head `--force-with-lease`; fresh GitHub eligibility and checks will be verified after pushing. No PR merge or protection change is authorized.

## Review checkpoints

| Step | Branch | Validation | Publication |
| --- | --- | --- | --- |
| 1 | `improvement/angular-optimus-update` | lint, 18 tests, build | [#13](https://github.com/monsieur-ricky/stoXevo/pull/13) |
| 2 | `improvement/angular-21-bridge` | lint, 20 tests, build | [#14](https://github.com/monsieur-ricky/stoXevo/pull/14) |
| 3 | `improvement/optimus-ui` | lint, 21 tests, build, browser | [#15](https://github.com/monsieur-ricky/stoXevo/pull/15) |
| 4 | `improvement/angular-22` | lint, 21 tests, build; repaired lockfile and Linux CI passed | [#16](https://github.com/monsieur-ricky/stoXevo/pull/16) |
| 5 | `improvement/angular-modernization` | clean install, lint, 40 tests, build, PWA hashes, browser and Linux CI passed; linear-history repair also passes fresh local gates | [#17](https://github.com/monsieur-ricky/stoXevo/pull/17) |

All five PRs are published. The active `Main` ruleset requires linear history:
use a compatible stack rebase/squash workflow, not merge commits. After the
history repair, wait for fresh CI and renew approval if GitHub requires it.
**No PRs have been merged and no protection rules have been changed.**
