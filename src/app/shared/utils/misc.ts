import { Purchase } from '@shared/models';
import { MetalQuote } from './../models/quote.model';

/**
 * Extracts the first character of each word in a sentence, converts it to uppercase,
 * and concatenates them to form a new string.
 *
 * @param sentence - The input sentence from which to extract the ID.
 * @returns A string composed of the uppercase first characters of each word in the sentence.
 */
export const getIdFromSentence = (sentence: string): string => {
  return sentence
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Retrieves the metal price based on the specified currency.
 *
 * @param {MetalQuote | undefined} quote - The metal quote object containing price information.
 * @param {string} currency - The currency code (EUR, USD, GBP).
 * @returns {number} The price per gram in the specified currency. Returns 0 if quote is undefined or currency is not supported.
 */
export const getMetalPriceFromCurrency = (
  quote: MetalQuote | undefined,
  currency: string
): number => {
  let price = 0;

  switch (currency.toLowerCase()) {
    case 'eur':
      return quote?.pricePerGramEuro ?? 0;

    case 'usd':
      return quote?.pricePerGramDollar ?? 0;

    case 'gbp':
      return quote?.pricePerGramPound ?? 0;

    default:
      return price;
  }
};

/**
 * Calculates the average cost from an array of purchases, weighted by quantity.
 *
 * @param {Purchase[]} purchases - Array of Purchase objects containing price and quantity information.
 * @returns {number} The weighted average price. Returns 0 if array is empty or null.
 */
export const getAveragePrice = (purchases: Purchase[]): number => {
  if (!purchases || purchases.length === 0) {
    return 0;
  }

  const totalCost = purchases.reduce(
    (sum, { price, quantity }) => sum + price * quantity,
    0
  );
  const totalQuantity = purchases.reduce(
    (sum, { quantity }) => sum + quantity,
    0
  );

  return totalQuantity > 0 ? totalCost / totalQuantity : 0;
};
