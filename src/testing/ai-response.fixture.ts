/** Synthetic provider responses; never real prices, companies or credentials. */
export function openAiResponse(text: string, grounded = true) {
  return {
    status: 'completed',
    output: [
      ...(grounded ? [{ type: 'web_search_call', status: 'completed' }] : []),
      {
        type: 'message',
        content: [
          {
            type: 'output_text',
            text,
            annotations: grounded
              ? [
                  {
                    type: 'url_citation',
                    url: 'https://finance.example.test/acme',
                    title: 'Synthetic market source'
                  }
                ]
              : []
          }
        ]
      }
    ]
  };
}

export function sourcedProfileFixture() {
  const marketAsOf = new Date().toISOString();
  const quoteText = `ACME — NASDAQ\nPrice: USD 42 per share\nMarket time: ${marketAsOf}`;
  const answer = `${quoteText}\n\nAcme Corp is a synthetic computer manufacturer. CEO: Synthetic CEO. Sector: Technology. Industry: Computers. Country: US. Employees: 1000. Website: https://acme.example.test/\nDay high USD 44 per share. Day low USD 40 per share. Dividend yield 1.5%.`;
  const quote = {
    id: 0,
    status: 'ok',
    symbol: 'ACME',
    exchange: 'NASDAQ',
    currency: 'USD',
    unit: 'share',
    price: 42,
    marketAsOf,
    kind: 'latest',
    sourceIds: ['s1'],
    evidence: quoteText
  };
  const emptyMetric = { value: null, evidence: null, sourceIds: [] };
  const payload = {
    symbol: 'ACME',
    type: 'stock',
    name: 'Acme Corp',
    currency: 'USD',
    exchangeShortName: 'NASDAQ',
    description: 'Acme Corp is a synthetic computer manufacturer.',
    website: 'https://acme.example.test/',
    sector: 'Technology',
    industry: 'Computers',
    country: 'US',
    ceo: 'Synthetic CEO',
    fullTimeEmployees: '1000',
    phone: null,
    address: null,
    quotes: [quote],
    metrics: {
      changeValue: emptyMetric,
      changePercent: emptyMetric,
      regularMarketDayHigh: {
        value: 44,
        evidence: 'Day high USD 44 per share.',
        sourceIds: ['s1']
      },
      regularMarketDayLow: {
        value: 40,
        evidence: 'Day low USD 40 per share.',
        sourceIds: ['s1']
      },
      fiftyDayAverage: emptyMetric,
      fiftyTwoWeekHigh: emptyMetric,
      fiftyTwoWeekLow: emptyMetric,
      trailingAnnualDividendRate: emptyMetric,
      dividendYield: {
        value: 1.5,
        evidence: 'Dividend yield 1.5%.',
        sourceIds: ['s1']
      }
    }
  };
  return { answer, payload, quoteText, quote };
}
