# AI-assisted market data

## Decisions

- Default new installations to AI-assisted setup; preserve existing stoXscraper users and manual entry.
- Keep gold/silver on the existing Gold-API.com JSON source. Never ask an LLM for metal prices or unit conversion. AI mode uses the source directly, subject to browser CORS/terms verification; scraper mode keeps its existing endpoints.
- Use ordinary interactive AI requests containing small batches of instruments (initially five), not asynchronous provider Batch APIs. Search charges may still apply per search, not per batch.
- Use cited retrieval followed by JSON-schema extraction. Validate identities, currencies, units, timestamps and source references locally. JSON correctness does not guarantee factual correctness.
- Keys are session-only. No billable AI credentials in the existing weak four-digit-PIN encryption, backups, logs or service-worker caches. A stronger persistent vault is deferred.
- No holdings, purchases, quantities, totals or PIN in prompts. No network calls before explicit consent/unlock, and no automatic paid refresh or cross-provider fallback.
- OpenAI preset: `gpt-6-luna`; Anthropic: `claude-haiku-5-5`; OpenRouter: `openai/gpt-6-luna` with explicit Parallel fast search. Kilo is capability-gated: its OpenAI-compatible API does not establish hosted search/plugin support.
- All AI values are indicative and sourced, not independently certified real-time prices. Missing/unsupported results preserve last-known values.

## Phases and stacked PRs

Each phase branches from the previous checkpoint. Run `npm run check` (zero-warning lint, all tests, production build and PWA verification) before committing/publishing and before starting the next phase. Never merge automatically.

1. **Contracts and safety** — `feature/ai-market-data-01-contracts`
   - [x] Define provider/settings/instrument/result contracts, bounded batches and quote schema/validation.
   - [x] Regression tests for identity, currency, source, timestamp and missing-value handling.
   - [x] Record research and live-evaluation requirements; quality gates passed (PR below).
2. **Settings and migration** — `feature/ai-market-data-02-settings`
   - [x] Versioned non-secret configuration; session credentials; legacy migration and backup validation.
   - [x] Serialize app-data updates; maintain legacy backup readability.
   - [x] Integration tests and quality gates (55 tests); PR below.
3. **Provider adapters** — `feature/ai-market-data-03-providers`
   - [ ] Bounded cited retrieval + structured extraction for OpenAI, Anthropic and OpenRouter.
   - [ ] Kilo fails closed until hosted grounding is verified; no pretend plugin compatibility.
   - [ ] Direct Gold-API adapter; deterministic gram conversion; HTTP/cancellation/privacy tests.
   - [ ] Quality gates and PR.
4. **Application integration** — `feature/ai-market-data-04-integration`
   - [ ] Route search/profile/quotes through selected source; batch refresh and independent partial successes.
   - [ ] Settings UI, explicit consent, connection test, source/time/status display, manual fallback.
   - [ ] Caching, deduplication, cancellation, stale-response protection; integration tests.
   - [ ] Quality gates and PR.
5. **Hardening and release documentation** — `feature/ai-market-data-05-release`
   - [ ] Privacy/PWA checks, contributor/user documentation and opt-in live benchmark instructions.
   - [ ] Final regression coverage and quality gates; publish final PR.

## Research and release gates

Research checked 2026-11-02. Presets are candidates, not empirically proven winners. No real credentials or paid calls are used by deterministic CI.

- [OpenAI Luna](https://developers.openai.com/api/docs/models/gpt-6-luna): $0.10/$0.50 per million input/output tokens; [web search](https://developers.openai.com/api/docs/guides/tools-web-search) adds $0.010/search.
- [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing): Haiku 5.5 $0.10/$0.50 for prompts <=100k tokens; search adds $0.010/search. [Citations](https://platform.claude.com/docs/en/build-with-claude/citations) conflict with strict JSON, so preserve evidence separately.
- [OpenRouter search](https://openrouter.ai/docs/guides/features/plugins/web-search): Parallel fast $0.001/request plus tokens. Free inference is not free retrieval; free endpoints may have privacy restrictions and limited capacity.
- [Kilo API](https://kilo.ai/docs/gateway/api-reference): function calling is documented; hosted grounding must be demonstrated before enabling automatic financial lookups.
- [Existing metals source](https://github.com/monsieur-ricky/stoXscraper/blob/main/docs/METALS.md): retain spot XAU/XAG, EUR/USD/GBP, 31.1035 grams per troy ounce and provider usage pacing.

Before production enablement, explicitly opt into authenticated evaluations from a clean synthetic browser origin. Test US/EU listings, UCITS ETFs, GBX/GBP, crypto pairs, funds/NAV, invalid/delisted tickers, holidays and stale/conflicting sources. Compare timestamp-aligned references, accepted-result cost, p50/p95 latency, citations and browser CORS. Never describe a mocked test as live verification. Verify Gold-API terms/CORS and all provider request combinations. Unsupported Kilo remains visibly unavailable until verified. Recheck model IDs/prices before deployment.

## Execution log

- Repository starts clean on `main` at `192c4d7`; created phase 1 feature branch. GitHub CLI is authenticated.
- Baseline check blocked by stale Angular 19 `node_modules` versus the committed Angular 22 lockfile. Restoring with `npm ci`; first attempt timed out after 120 seconds. Retrying with a ten-minute limit. Available Node 24.18.0 satisfies package engines; pinned 24.22.2 is not installed.
- No live API calls or costs incurred. No phase or PR is marked complete before its quality gates pass.
- Phase 1: lockfile dependencies restored successfully. `npm run check` passes: zero lint warnings, 52 tests, production build and PWA hash verification. Live-provider accuracy/CORS remain unverified and explicitly release-gated.
- Phase 1 PR: [#19](https://github.com/monsieur-ricky/stoXevo/pull/19), targeting `main`.
- Phase 2 implementation: added versioned preferences, explicit capability checks, memory-only credentials cleared on provider changes/import, serialized app-data writes and strict settings validation during backup import. Persistent AI-key storage is intentionally deferred rather than using the weak PIN envelope.
- Phase 2 validation: `npm run check` passes (zero-warning lint, 55 tests, production build and PWA verification).
