# Upgrade to Angular 22 and Optimus UI 2

Base: `improvement/optimus-ui`  
Head: `improvement/angular-22`

- Run official Angular/core/CDK/CLI migrations and update the Optimus package
  group to 2.0.2. Angular 22.2.4, CLI/CDK 22.2.5, NgRx 22.0.1, TypeScript 6.0.3.
- Remove deprecated `baseUrl` rather than silencing TypeScript 6 diagnostics.
- Align ESLint 10, Vitest 5 and jsdom 29; remove unused legacy formatter tools.
- Pin supported Node 24.22.2 for local development and CI; update setup docs.
- Keep the root component OnPush and preserve the PWA build.

Validation: `npm run check` passes (zero-warning lint, 21 tests, production/PWA
build). No forced peer overrides. Development audit reduced to 18 moderate
findings; no high/critical findings. Final modernization follows separately.

GitHub publication requires authentication. The idempotent
`bash scripts/open-migration-prs.sh` helper creates the prepared stacked PRs;
it never merges them.
