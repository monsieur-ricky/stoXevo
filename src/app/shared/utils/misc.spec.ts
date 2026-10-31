import { getAveragePrice, getIdFromSentence, getMetalPriceFromCurrency } from './misc';

describe('financial calculations', () => {
  it('weights purchase prices by quantity', () => {
    expect(getAveragePrice([
      { date: '2026-01-01', price: 10, quantity: 2 },
      { date: '2026-02-01', price: 20, quantity: 6 },
    ])).toBe(17.5);
  });

  it('handles an empty or zero-quantity portfolio', () => {
    expect(getAveragePrice([])).toBe(0);
    expect(getAveragePrice([{ date: '2026-01-01', price: 10, quantity: 0 }])).toBe(0);
  });

  it('handles missing metal prices and unsupported currencies', () => {
    expect(getMetalPriceFromCurrency(undefined, 'EUR')).toBe(0);
    expect(getMetalPriceFromCurrency(undefined, 'JPY')).toBe(0);
  });

  it('creates readable initials', () => {
    expect(getIdFromSentence('physical assets')).toBe('PA');
  });
});
