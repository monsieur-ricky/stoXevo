/** Only explicit listing aliases are interchangeable; never fuzzy-match venues. */
const EXCHANGES = [
  [
    'XNAS',
    'NASDAQ',
    'NASDAQGS',
    'NASDAQGM',
    'NASDAQCM',
    'NMS',
    'NGM',
    'NCM',
    'NASDAQ GLOBAL SELECT MARKET',
    'NASDAQ GLOBAL MARKET',
    'NASDAQ CAPITAL MARKET'
  ],
  ['XNYS', 'NYSE', 'NYQ', 'NEW YORK STOCK EXCHANGE'],
  ['ARCX', 'NYSE ARCA', 'PCX'],
  ['XASE', 'NYSE AMERICAN', 'AMEX', 'ASE'],
  ['XLON', 'LSE', 'LONDON STOCK EXCHANGE'],
  ['XETR', 'XETRA']
];
const exchangeName = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
export const normalizedCurrency = (value: string) =>
  value === 'GBp' ? 'GBX' : value.toUpperCase();
export function exchangeAliases(value: string): string[] {
  const name = exchangeName(value);
  return EXCHANGES.find(group => group.includes(name)) ?? [name];
}
export function sameExchange(left: unknown, right: string): boolean {
  return (
    typeof left === 'string' &&
    exchangeAliases(right).includes(exchangeName(left))
  );
}
export function containsToken(text: string, value: string): boolean {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9])${escaped}($|[^A-Za-z0-9])`).test(text);
}
export const normalizedEvidence = (value: string) =>
  value.replace(/\s+/g, ' ').trim();
export const ISO_TIMESTAMP =
  /\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|\s?UTC|[+-]\d{2}:?\d{2})\b/g;
export function supportsTimestamp(text: string, iso: string): boolean {
  return [...text.matchAll(ISO_TIMESTAMP)].some(
    match =>
      Date.parse(match[0].replace(/\sUTC$/, 'Z').replace(' ', 'T')) ===
      Date.parse(iso)
  );
}
export function supportsNumber(text: string, value: number): boolean {
  // A timestamp or a substring of a larger number cannot support a price.
  const withoutDates = text.replace(ISO_TIMESTAMP, '').replaceAll(',', '');
  const token = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\w.])${token}(?:\\.0+)?($|[^\\w.])`).test(
    withoutDates
  );
}

/** Keep multiline fields with their own ticker; stop before a different record. */
export function quoteBlocks(text: string, symbol: string): string[] {
  const lines = text.split('\n');
  return lines.flatMap((line, index) => {
    if (!containsToken(line, symbol)) return [];
    const block = [line];
    for (const next of lines.slice(index + 1, index + 9)) {
      if (!next.trim()) break;
      if (
        /^\s*(?:[-*]\s*)?(?:[A-Z][A-Z0-9.^=-]{0,14})\s+(?:[A-Z]{3}\b|[—–-])/.test(
          next
        ) ||
        /^\s*(?:symbol|ticker|instrument)\s*:/i.test(next)
      )
        break;
      block.push(next);
    }
    return [block.join('\n')];
  });
}
