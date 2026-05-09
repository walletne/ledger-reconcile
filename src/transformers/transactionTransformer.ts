import { Transaction } from '../types/transaction';

export type CurrencyCode = string;
export type ExchangeRates = Record<CurrencyCode, number>;

/**
 * Converts a transaction's amount to a target currency using provided rates.
 * Rates are relative to a base currency (e.g., USD = 1).
 */
export function convertCurrency(
  transaction: Transaction,
  targetCurrency: CurrencyCode,
  rates: ExchangeRates
): Transaction {
  if (transaction.currency === targetCurrency) return transaction;

  const fromRate = rates[transaction.currency];
  const toRate = rates[targetCurrency];

  if (!fromRate || !toRate) {
    throw new Error(
      `Missing exchange rate for ${transaction.currency} or ${targetCurrency}`
    );
  }

  const convertedAmount = (transaction.amount / fromRate) * toRate;

  return {
    ...transaction,
    amount: Math.round(convertedAmount * 100) / 100,
    currency: targetCurrency,
  };
}

/**
 * Masks sensitive fields in a transaction for safe logging or export.
 */
export function maskSensitiveFields(transaction: Transaction): Transaction {
  return {
    ...transaction,
    id: transaction.id.slice(0, 4) + '****',
  };
}

/**
 * Normalizes the amount to a fixed decimal precision.
 */
export function normalizeAmount(
  transaction: Transaction,
  decimals = 2
): Transaction {
  return {
    ...transaction,
    amount: parseFloat(transaction.amount.toFixed(decimals)),
  };
}

/**
 * Applies a sequence of transformations to a transaction.
 */
export function transformTransaction(
  transaction: Transaction,
  transformers: Array<(t: Transaction) => Transaction>
): Transaction {
  return transformers.reduce((t, fn) => fn(t), transaction);
}

/**
 * Applies transformations to a list of transactions.
 */
export function transformTransactions(
  transactions: Transaction[],
  transformers: Array<(t: Transaction) => Transaction>
): Transaction[] {
  return transactions.map((t) => transformTransaction(t, transformers));
}
