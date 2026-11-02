# AI-assisted market data

## Setup

New installations start with AI-assisted setup selected. Existing scraper users keep stoXscraper. Manual entry never requires a key.

1. Unlock and open **Application settings**.
2. Choose **AI-assisted**, a provider and a dedicated API key with provider-side spending limits.
3. Review the disclosure/charges consent. Consent and AI credentials must be supplied again after reload/unlock.
4. Save. Saving alone sends no provider request. **Save & test (may charge)** performs a sourced symbol lookup and may consume paid tokens/searches.
5. Press **Update** on Portfolio. AI pricing is experimental: live model combinations, CORS, accuracy and latency have not been certified by this change.

Presets live in `src/app/shared/data/market-data/market-data.types.ts`:

| Provider   | Preset                            | Retrieval                                        |
| ---------- | --------------------------------- | ------------------------------------------------ |
| OpenAI     | `gpt-6-luna`                      | Responses web search, up to 3 tool calls         |
| Anthropic  | `claude-haiku-5-5`                | Native web search, up to 3 searches              |
| OpenRouter | `openai/gpt-6-luna`               | Explicit Parallel `fast` plugin, up to 5 results |
| Kilo       | Provisionally `openai/gpt-6-luna` | **Unavailable:** hosted grounding not verified   |

Kilo function calling does not prove that its gateway executes searches. It is disabled, not silently routed to an ungrounded model. Free models were considered but are not the default: free inference still needs retrieval, may log data, has variable capacity, and may not support strict JSON. A stable free end-to-end financial-data service was not verified.

Select **stoXscraper** and enter its existing key to use the endpoint in `src/app/app.settings.ts`. Its original key persistence remains for compatibility; its PIN-based protection is weak against offline guessing. Never reuse a billable AI key as a scraper key.

## Gold and silver

AI never supplies gold/silver prices. AI mode contacts the same existing **Gold-API.com** source directly at `https://api.gold-api.com/price/{XAU|XAG}/{EUR|USD|GBP}`, not the similarly named GoldAPI.io. Scraper mode keeps `/asset/quote/metal/{gold|silver}`.

Spot prices convert from troy ounces to grams using 31.1035 g/oz and round to two decimals, matching the existing scraper convention. Direct requests are serialized at least 1.1 seconds apart, coalesced and cached for 30 seconds. HTTP 429 starts at least a 30-second cooldown, honoring longer readable `Retry-After` values. No automatic retries.

Identity, currency, positive finite prices and provider timestamps (maximum 5 minutes old/1 minute ahead) are checked. Gold-API `updatedAt` is its **provider fetch time**, not necessarily a market trade. The UI labels it accordingly. Prices exclude dealer premiums, fees and taxes. Browser CORS/terms must be checked before deployment. If browser access fails, use the scraper or manual valuation; no hidden proxy or AI metal-price fallback is introduced.

## Bulk refresh and structured output

- Manual assets are excluded. Only symbol, exchange, currency and asset type reach AI.
- Deduplicate identities and reuse fresh cache entries. AI quotes use five-instrument interactive requests; at most two jobs run concurrently. These are not asynchronous provider Batch APIs.
- Each uncached AI batch uses **two foreground requests**: cited retrieval, then schema-constrained extraction without search. This retains original citations and avoids Anthropic citation/strict-JSON incompatibility. No automatic paid retries or fallbacks.
- One bulk request does **not** imply one search charge. A provider may use multiple searches. OpenRouter's one-search plugin may find insufficient evidence for five instruments; missing ones remain unavailable rather than guessed.
- Rows require request id, symbol, exchange, exact currency, unit, positive finite price, timezone-qualified market timestamp, quote kind and provider-issued source IDs. A number on another instrument's line cannot substantiate this quote. Missing/duplicate/mismatched/stale rows are rejected independently.
- Units distinguish shares, coins, NAV units, base currency units, contracts and monetary bond units. Bond percentages of par are not monetary prices. No AI currency/unit conversions.
- `latest` quotes must be at most 15 minutes old; `close`/`nav` at most 7 days old. Close/NAV results are labeled and can be older than the last trading session: holiday/calendar freshness is not independently certified.
- The cited answer is checked for extracted fields, but citations/schema compliance **do not independently verify the publisher or factual accuracy**. Prices are indicative portfolio valuations, not executable trading quotes.
- Successes update independently. Failures retain previous prices and original evidence/timestamps. Hover the unavailable message for its sanitized reason.
- Quotes cache for up to 15 minutes (bounded by `latest` freshness), searches for 24 hours, AI metadata for 7 days. Scraper profiles containing quote metrics use the shorter quote TTL. Caches are memory-only and invalidate on provider/settings/import changes.
- Portfolio open/import and purchase edits do not start paid price refreshes. Adding an automatically priced asset, symbol search after an 800ms typing pause, profile navigation, connection testing and pressing Update can make requests after consent. Canceling a browser request does not guarantee already-started provider billing stops.

AI profiles currently retrieve sourced company/fund metadata only. Unavailable price/quote metrics are not estimated. This is intentionally more conservative than claiming complete parity with every scraper metric.

## Privacy and credentials

AI keys are held only in application memory, never in localStorage, backups, URLs, prompts, service-worker caches or application logs. **Forget session AI key** clears the key and invalidates pending results. A stronger persistent vault is not implemented; do not store AI keys in the existing four-digit-PIN envelope (100 PBKDF2 iterations).

Providers/search services receive public identifiers, queries, public metadata/evidence and network/account metadata. These can reveal investment interests. Holdings quantities, purchase history, totals and PIN stay local. OpenAI uses `store: false`, which does not disable provider abuse-monitoring retention. OpenRouter disallows data-collection routes; this does not guarantee zero retention by the gateway/search service.

Browser BYOK avoids an app server, but cannot hide a key from malicious same-origin scripts/extensions while unlocked. Use a trusted/self-hosted build and a restricted, spending-limited key. Existing third-party widgets/assets remain a privacy limitation; this feature adds no telemetry. Financial/API responses are excluded from PWA caching; only static shell/assets are cached.

## Validation and production release checklist

`npm run check` runs zero-warning lint, deterministic Vitest/TestBed HTTP/storage/UI tests, production build and PWA cache/hash checks. CI needs no real keys or paid requests. See `AI_MARKET_DATA_PLAN.md` for checkpoints and stacked PRs.

Before promoting AI from experimental use:

1. Use a clean localhost origin and synthetic portfolio, never real saved holdings. Obtain explicit approval for live API spend; use a capped disposable key. Never save it to a file or record request headers.
2. Recheck preset existence, prices, privacy terms, search/output compatibility and browser CORS from the deployed origin. Verify metals separately. An unauthenticated OPTIONS request alone does not establish authenticated compatibility.
3. Compare US/EU equities, UCITS ETFs, multiple listings, GBP/GBX, crypto pairs, funds/NAV and bond/contract conventions with timestamp-aligned authoritative references. Include invalid/delisted tickers, holidays, stale/conflicting sources and malicious retrieved instructions.
4. Exercise 1, 5, 6 and 20 instruments. Record accepted/abstained/incorrect counts, identity/currency/unit errors, citation support, p50/p95 latency, searches, input/output/reasoning tokens and **cost per accepted result**, including failures. Do not score abstention as correct retrieval.
5. Compare individual and bulk requests. Benchmark Luna against a cheaper qualified candidate such as `openai/gpt-oss-20b` through OpenRouter before changing the maintained preset. Generic model benchmarks do not establish financial accuracy.
6. Fail release if wrong identities, conversions, invented timestamps or unsupported numbers are accepted. High abstention can also disqualify a preset. Use licensed feeds where accuracy guarantees are required.
7. Enable Kilo only after documented hosted retrieval, citations, CORS, bounded usage and schema behavior pass the same checks. Do not change its availability flag merely because chat succeeds.

No authenticated live evaluations, full browser smoke tests, provider costs or external accuracy/CORS results are claimed by deterministic tests.
