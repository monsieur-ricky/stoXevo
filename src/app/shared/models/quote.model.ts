export type Quote = {
  symbol: string;
  price: number;
  changeValue: number;
  changePercent: number;
  range?: string;
  fiftyDayAverage?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingAnnualDividendRate?: number;
  dividendYield?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
};

export type MetalQuote = {
  metal: string;
  pricePerOunceEuro: number;
  pricePerOunceDollar: number;
  pricePerOuncePound: number;
  pricePerGramEuro?: number;
  pricePerGramDollar?: number;
  pricePerGramPound?: number;
};
