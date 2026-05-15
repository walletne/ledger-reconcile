import { Transaction } from '../types/transaction';

/**
 * Trims and lowercases string fields for consistent comparison.
 */
export function normalizeStringFields(tx: Transaction): Transaction {
  return {
    ...tx,
    id: tx.id.trim(),
    currency: tx.currency.trim().toUpperCase(),
    description: tx.description ? tx.description.trim() : tx.description,
    status: tx.status.trim().toLowerCase() as Transaction['status'],
  };
}

/**
 * Normalizes the transaction amount to a fixed decimal precision.
 */
export function normalizeAmountPrecision(
  tx: Transaction,
  decimals: number = 2
): Transaction {
  const factor = Math.pow(10, decimals);
  return {
    ...tx,
    amount: Math.round(tx.amount * factor) / factor,
  };
}

/**
 * Ensures the date field is stored as an ISO 8601 string.
 */
export function normalizeDateFormat(tx: Transaction): Transaction {
  const parsed = new Date(tx.date);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date for transaction ${tx.id}: "${tx.date}"`);
  }
  return {
    ...tx,
    date: parsed.toISOString(),
  };
}

export interface NormalizerOptions {
  decimals?: number;
  normalizeStrings?: boolean;
  normalizeDate?: boolean;
}

/**
 * Applies all normalization steps to a single transaction.
 */
export function normalizeTransaction(
  tx: Transaction,
  options: NormalizerOptions = {}
): Transaction {
  const { decimals = 2, normalizeStrings = true, normalizeDate = true } = options;
  let result = tx;
  if (normalizeStrings) result = normalizeStringFields(result);
  result = normalizeAmountPrecision(result, decimals);
  if (normalizeDate) result = normalizeDateFormat(result);
  return result;
}

/**
 * Applies normalization to an array of transactions.
 */
export function normalizeTransactions(
  transactions: Transaction[],
  options: NormalizerOptions = {}
): Transaction[] {
  return transactions.map((tx) => normalizeTransaction(tx, options));
}
