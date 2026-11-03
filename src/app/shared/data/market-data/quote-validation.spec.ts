import { readMarketDataSettings } from './market-data.types';
import { validateQuotes } from './quote-validation';

describe('market data contracts', () => {
  const instrument = { symbol: 'ACME', exchange: 'XNAS', currency: 'USD' };
  const now = Date.parse('2026-11-02T15:30:00Z');
  const source = {
    id: 's1',
    url: 'https://example.test/quote',
    title: 'Quote'
  };
  const row = {
    id: 0,
    status: 'ok',
    symbol: 'ACME',
    exchange: 'XNAS',
    currency: 'USD',
    unit: 'share',
    price: 42,
    marketAsOf: '2026-11-02T15:29:00Z',
    kind: 'latest',
    sourceIds: ['s1']
  };
  const text = 'ACME XNAS USD 42 share 2026-11-02T15:29:00Z';
  const validate = (rows: unknown[], evidence = text) =>
    validateQuotes(
      { quotes: rows },
      [instrument],
      [source],
      'openai',
      'test',
      evidence,
      now
    )[0];

  it('defaults new users to AI setup but preserves scraper users', () => {
    expect(readMarketDataSettings(undefined).source).toBe('ai');
    expect(readMarketDataSettings(undefined, 'old-key').source).toBe(
      'stoxscraper'
    );
    expect(() => readMarketDataSettings({ version: 2 })).toThrow();
  });
  it('accepts a sourced identity-matched quote with provenance', () => {
    expect(validate([row])).toMatchObject({
      status: 'ok',
      price: 42,
      evidence: { marketAsOf: row.marketAsOf, sources: [source] }
    });
  });
  it('accepts equivalent listing names and timestamp representations in multiline evidence', () => {
    const result = validateQuotes(
      {
        quotes: [
          {
            ...row,
            exchange: 'NASDAQ',
            marketAsOf: '2026-11-02T10:29:00-05:00'
          }
        ]
      },
      [{ ...instrument, exchange: 'Nasdaq' }],
      [source],
      'openai',
      'test',
      'ACME — NASDAQ\nPrice: USD 42 per share\nMarket time: 2026-11-02T15:29:00.000Z',
      now
    );
    expect(result[0]).toMatchObject({ status: 'ok', price: 42 });
  });
  it.each([
    { currency: 'EUR' },
    { exchange: 'XLON' },
    { symbol: 'OTHER' },
    { price: 0 },
    { price: NaN },
    { unit: 'coin' },
    { sourceIds: ['invented'] },
    { marketAsOf: '2025-01-01T00:00:00Z' },
    { marketAsOf: '2026-11-03T15:29:00Z' },
    { marketAsOf: '2026-11-02' }
  ])('rejects unsafe data %j', change => {
    expect(validate([{ ...row, ...change }]).status).toBe('unavailable');
    expect(validate([{ ...row, ...change }]).price).toBeUndefined();
  });
  it('rejects missing, duplicate and unsupported evidence instead of using zero', () => {
    expect(validate([]).status).toBe('unavailable');
    expect(validate([row, row]).status).toBe('unavailable');
    expect(
      validate(
        [row],
        'ACME XNAS USD unavailable\nOTHER USD 42 share 2026-11-02T15:29:00Z'
      ).status
    ).toBe('unavailable');
    expect(validate([row], text.replace('42 share', '142 share')).status).toBe(
      'unavailable'
    );
    expect(validate([row], 'Company information only').status).toBe(
      'unavailable'
    );
  });

  it('does not normalize genuinely different venues or pence into pounds', () => {
    expect(validate([{ ...row, exchange: 'NYSE' }]).status).toBe('unavailable');
    expect(
      validateQuotes(
        { quotes: [{ ...row, currency: 'GBp' }] },
        [{ ...instrument, currency: 'GBP' }],
        [source],
        'openai',
        'test',
        text,
        now
      )[0].status
    ).toBe('unavailable');
    expect(
      validate([
        {
          ...row,
          evidence: 'ACME XNAS USD 42 share 2026-11-02T15:29:00Z invented'
        }
      ]).status
    ).toBe('unavailable');
    expect(validate([row], text.replace('ACME', 'ACMEOTHER')).status).toBe(
      'unavailable'
    );
  });
});
