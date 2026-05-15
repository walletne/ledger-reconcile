import { Transaction } from '../types/transaction';

export type Partition<T> = {
  passing: T[];
  failing: T[];
};

/**
 * Partitions transactions into two groups based on a predicate.
 */
export function partitionBy<T extends Transaction>(
  transactions: T[],
  predicate: (tx: T) => boolean
): Partition<T> {
  const passing: T[] = [];
  const failing: T[] = [];

  for (const tx of transactions) {
    if (predicate(tx)) {
      passing.push(tx);
    } else {
      failing.push(tx);
    }
  }

  return { passing, failing };
}

/**
 * Partitions transactions by whether their amount meets or exceeds a threshold.
 */
export function partitionByAmountThreshold<T extends Transaction>(
  transactions: T[],
  threshold: number
): Partition<T> {
  return partitionBy(transactions, (tx) => tx.amount >= threshold);
}

/**
 * Partitions transactions by whether they occurred on or after a given date.
 */
export function partitionByDateThreshold<T extends Transaction>(
  transactions: T[],
  date: Date
): Partition<T> {
  const cutoff = date.getTime();
  return partitionBy(transactions, (tx) => new Date(tx.date).getTime() >= cutoff);
}

/**
 * Partitions transactions by currency, separating a target currency from all others.
 */
export function partitionByCurrency<T extends Transaction>(
  transactions: T[],
  currency: string
): Partition<T> {
  return partitionBy(transactions, (tx) => tx.currency === currency);
}
