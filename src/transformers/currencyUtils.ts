import { ExchangeRates } from './transactionTransformer';

/**
 * Validates that all required currency codes are present in the rates map.
 */
export function validateRates(
  rates: ExchangeRates,
  requiredCurrencies: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredCurrencies.filter((c) => !(c in rates));
  return { valid: missing.length === 0, missing };
}

/**
 * Builds a cross-rate map from a base-relative rates object.
 * Returns the rate to convert 1 unit of `from` into `to`.
 */
export function getCrossRate(
  rates: ExchangeRates,
  from: string,
  to: string
): number {
  if (!(from in rates)) throw new Error(`Unknown currency: ${from}`);
  if (!(to in rates)) throw new Error(`Unknown currency: ${to}`);
  return rates[to] / rates[from];
}

/**
 * Returns a filtered subset of the rates map containing only the specified currencies.
 */
export function pickRates(
  rates: ExchangeRates,
  currencies: string[]
): ExchangeRates {
  return Object.fromEntries(
    currencies.filter((c) => c in rates).map((c) => [c, rates[c]])
  );
}

/**
 * Rounds a monetary value to 2 decimal places (banker-safe string conversion).
 */
export function roundMoney(value: number, decimals = 2): number {
  return parseFloat(value.toFixed(decimals));
}
