# Restore quality gates and establish migration regression coverage

Base: `main`  
Head: `improvement/angular-optimus-update`

## Summary
- Document the staged Angular/Optimus migration and review findings.
- Align Angular 20.3 and TypeScript 5.9; regenerate the lockfile without bypassing peers.
- Replace broken legacy ESLint config with flat config; fix existing static errors.
- Add Angular/Vitest testing-trophy baseline: calculations, real storage/encryption, legacy ciphertext, HTTP/auth, portfolio CRUD and rendered privacy toggle (18 tests).
- Add CI lint/test/production-build gates; disable Angular CLI analytics.

## Validation
- `npm run lint -- --max-warnings=0`: pass.
- `npm test -- --watch=false`: 18 passing tests.
- `npm run build`: pass, including service worker generation.
- `npm audit --omit=dev`: zero vulnerabilities. Development-tool advisories are addressed in later upgrade steps.

No merge authorized. Follow-up PRs are stacked on this branch.
