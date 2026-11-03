import { supportedProfileMetrics } from './profile-data';

describe('optional profile metric evidence', () => {
  const sources = [
    { id: 's1', url: 'https://example.test/quote', title: 'Quote' }
  ];
  const text =
    'Day high USD 44 per share. Day low USD 40 per share. Dividend yield 1.5%.';
  it('keeps supported values but rejects invented excerpts, wrong labels and unknown sources', () => {
    expect(
      supportedProfileMetrics(
        {
          regularMarketDayHigh: {
            value: 44,
            evidence: 'Day high USD 44 per share.',
            sourceIds: ['s1']
          },
          regularMarketDayLow: {
            value: 44,
            evidence: 'Day high USD 44 per share.',
            sourceIds: ['s1']
          },
          fiftyDayAverage: {
            value: 50,
            evidence: '50-day average 50.',
            sourceIds: ['s1']
          },
          dividendYield: {
            value: 1.5,
            evidence: 'Dividend yield 1.5%.',
            sourceIds: ['made-up']
          }
        },
        text,
        sources
      )
    ).toEqual({ regularMarketDayHigh: 44 });
  });
  it('does not invent null metrics or convert fractional yields into percentages', () => {
    expect(
      supportedProfileMetrics(
        {
          regularMarketDayHigh: { value: null, evidence: null, sourceIds: [] },
          dividendYield: {
            value: 0.015,
            evidence: 'Dividend yield 0.015',
            sourceIds: ['s1']
          }
        },
        'Dividend yield 0.015',
        sources
      )
    ).toEqual({});
  });
});
