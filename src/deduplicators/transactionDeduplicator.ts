import { NormalizedTransaction } from '../types/transaction';

/**
 * Returns a key used to identify duplicate transactions.
 * Two transactions are considered duplicates when they share
 * the same externalId, amount, currency, and date (day precision).
 */
export function deduplicationKey(tx: NormalizedTransaction): string {
  const day = tx.date.toISOString().slice(0, 10);
  return `${tx.externalId}|${tx.amount}|${tx.currency}|${day}`;
}

/**
 * Given a list of transactions, returns only the first occurrence
 * of each unique transaction, dropping subsequent duplicates.
 */
export function deduplicateTransactions(
  transactions: NormalizedTransaction[]
): NormalizedTransaction[] {
  const seen = new Set<string>();
  const result: NormalizedTransaction[] = [];

  for (const tx of transactions) {
    const key = deduplicationKey(tx);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(tx);
    }
  }

  return result;
}

/**
 * Returns all groups of transactions that are considered duplicates
 * of each other (groups with more than one member).
 */
export function findDuplicateGroups(
  transactions: NormalizedTransaction[]
): NormalizedTransaction[][] {
  const groups = new Map<string, NormalizedTransaction[]>();

  for (const tx of transactions) {
    const key = deduplicationKey(tx);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tx);
  }

  return Array.from(groups.values()).filter((group) => group.length > 1);
}
