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
