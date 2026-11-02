import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from '@shared/interceptors';
import { ApplicationStore } from '../app.store';
import { AiMarketDataService } from './ai-market-data.service';
import { AI_PRESETS, AiProvider } from './market-data.types';

describe('grounded AI HTTP integration', () => {
  let app: InstanceType<typeof ApplicationStore>;
  let http: HttpTestingController;
  let service: AiMarketDataService;
  const url = 'https://example.test/acme';

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    app = TestBed.inject(ApplicationStore);
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AiMarketDataService);
    await app.setPin('1234');
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  const configure = (provider: AiProvider) =>
    app.setMarketDataSettings(
      { version: 1, source: 'ai', provider, consent: true },
      'synthetic-key'
    );
  const response = (provider: AiProvider, text: string, grounded: boolean) => {
    if (provider === 'openai')
      return {
        status: 'completed',
        output: [
          ...(grounded
            ? [{ type: 'web_search_call', status: 'completed' }]
            : []),
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text,
                annotations: grounded
                  ? [{ type: 'url_citation', url, title: 'ACME quote' }]
                  : []
              }
            ]
          }
        ]
      };
    if (provider === 'anthropic')
      return {
        stop_reason: 'end_turn',
        content: [
          ...(grounded
            ? [{ type: 'web_search_tool_result', content: [{ url }] }]
            : []),
          {
            type: 'text',
            text,
            citations: grounded ? [{ url, title: 'ACME quote' }] : []
          }
        ]
      };
    return {
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: text,
            annotations: grounded
              ? [
                  {
                    type: 'url_citation',
                    url_citation: { url, title: 'ACME quote' }
                  }
                ]
              : []
          }
        }
      ]
    };
  };

  it.each<AiProvider>(['openai', 'anthropic', 'openrouter'])(
    'retrieves citations then schema JSON with %s',
    async provider => {
      await configure(provider);
      const date = new Date().toISOString();
      const result = service.getQuotes([
        { symbol: 'ACME', exchange: 'XNAS', currency: 'USD', type: 'stock' }
      ]);
      const retrieval = http.expectOne(AI_PRESETS[provider].endpoint);
      expect(retrieval.request.headers.has('stoxscraper-api-key')).toBe(false);
      expect(JSON.stringify(retrieval.request.body)).not.toContain(
        'synthetic-key'
      );
      expect(JSON.stringify(retrieval.request.body)).not.toContain('quantity');
      if (provider === 'openai')
        expect(retrieval.request.body).toMatchObject({
          store: false,
          tool_choice: 'required',
          max_tool_calls: 3
        });
      if (provider === 'openrouter')
        expect(retrieval.request.body).toMatchObject({
          plugins: [{ id: 'web', engine: 'parallel', mode: 'fast' }]
        });
      retrieval.flush(response(provider, `ACME XNAS USD 42 ${date}`, true));
      await Promise.resolve();
      await Promise.resolve();
      const extraction = http.expectOne(AI_PRESETS[provider].endpoint);
      const body = extraction.request.body;
      expect(
        provider === 'anthropic'
          ? body.output_config.format.type
          : provider === 'openai'
            ? body.text.format.type
            : body.response_format.type
      ).toBe('json_schema');
      expect(body.tools).toBeUndefined();
      expect(body.plugins).toBeUndefined();
      extraction.flush(
        response(
          provider,
          JSON.stringify({
            quotes: [
              {
                id: 0,
                status: 'ok',
                symbol: 'ACME',
                exchange: 'XNAS',
                currency: 'USD',
                price: 42,
                marketAsOf: date,
                kind: 'latest',
                sourceIds: ['s1']
              }
            ]
          }),
          false
        )
      );
      expect(await result).toMatchObject([
        { status: 'ok', price: 42, evidence: { sources: [{ url }] } }
      ]);
    }
  );

  it('does not send requests without consent, for metals, or through unverified Kilo', async () => {
    await expect(
      service.getQuotes([{ symbol: 'ACME', currency: 'USD' }])
    ).rejects.toThrow('consent');
    await configure('openai');
    await expect(
      service.getQuotes([
        { symbol: 'GOLD', currency: 'USD', type: 'commodity' }
      ])
    ).rejects.toThrow('never');
    await configure('kilo');
    await expect(
      service.getQuotes([{ symbol: 'ACME', currency: 'USD' }])
    ).rejects.toThrow('not verified');
    http.expectNone(request => request.method === 'POST');
  });

  it('cancels HTTP and never extracts after cancellation', async () => {
    await configure('openai');
    const controller = new AbortController();
    const result = service.getQuotes(
      [{ symbol: 'ACME', currency: 'USD' }],
      controller.signal
    );
    const assertion = expect(result).rejects.toBeDefined();
    const request = http.expectOne(AI_PRESETS.openai.endpoint);
    controller.abort();
    expect(request.cancelled).toBe(true);
    await assertion;
  });

  it('rejects absent grounding and sanitizes provider errors', async () => {
    await configure('openai');
    const missing = service.getQuotes([{ symbol: 'ACME', currency: 'USD' }]);
    const assertion = expect(missing).rejects.toThrow(
      'search did not complete'
    );
    http
      .expectOne(AI_PRESETS.openai.endpoint)
      .flush(response('openai', 'ACME 42', false));
    await assertion;
    const failed = service.getQuotes([{ symbol: 'ACME', currency: 'USD' }]);
    const failure = expect(failed).rejects.toThrow('Invalid AI API key');
    http
      .expectOne(AI_PRESETS.openai.endpoint)
      .flush(
        { error: 'synthetic-key must not be displayed' },
        { status: 401, statusText: 'Unauthorized' }
      );
    await failure;
  });
});
