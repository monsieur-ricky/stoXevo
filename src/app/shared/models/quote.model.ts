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
