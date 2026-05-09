import { Transaction } from '../types/transaction';

export type GroupKey = string;
export type TransactionGroup = Record<GroupKey, Transaction[]>;

/**
 * Groups transactions by their status (settled, pending, failed).
 */
export function groupByStatus(transactions: Transaction[]): TransactionGroup {
  return transactions.reduce<TransactionGroup>((acc, tx) => {
    const key = tx.status;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});
}

/**
 * Groups transactions by currency code.
 */
export function groupByCurrency(transactions: Transaction[]): TransactionGroup {
  return transactions.reduce<TransactionGroup>((acc, tx) => {
    const key = tx.currency ?? 'UNKNOWN';
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});
}

/**
 * Groups transactions by calendar date (YYYY-MM-DD) derived from their timestamp.
 */
export function groupByDate(transactions: Transaction[]): TransactionGroup {
  return transactions.reduce<TransactionGroup>((acc, tx) => {
    const key = new Date(tx.date).toISOString().slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});
}

/**
 * Groups transactions by a caller-supplied key extractor.
 */
export function groupBy(
  transactions: Transaction[],
  keyFn: (tx: Transaction) => GroupKey
): TransactionGroup {
  return transactions.reduce<TransactionGroup>((acc, tx) => {
    const key = keyFn(tx);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});
}
