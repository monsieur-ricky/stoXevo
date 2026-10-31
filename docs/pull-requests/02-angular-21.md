# Upgrade to Angular 21 as the supported UI migration bridge

Base: `improvement/angular-optimus-update`  
Head: `improvement/angular-21-bridge`

- Run official Angular CLI/core/CDK and NgRx migrations; align PrimeNG 21 and Vitest 4.
- Add rendered drawer/manual-asset creation and invalid-form integration checks.
- Document the testing-trophy approach in `docs/TESTING.md`.

Validation: `npm run check` passes (zero lint warnings, 20 passing tests,
production/PWA build). No forced peer resolutions.

This intermediate version is intentional: Optimus UI's PrimeNG migration is
supported on Angular/PrimeNG 21. The subsequent Optimus PR targets this branch.
Do not merge automatically.
