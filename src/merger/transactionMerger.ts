import { NormalizedTransaction } from '../types/transaction';

export interface MergeStrategy {
  preferSource?: 'left' | 'right';
  fields?: Array<keyof NormalizedTransaction>;
}

const DEFAULT_STRATEGY: MergeStrategy = {
  preferSource: 'left',
  fields: [],
};

/**
 * Merges two transactions, with configurable field-level precedence.
 * Fields listed in strategy.fields are taken from the preferred source;
 * remaining fields fall back to the other source.
 */
export function mergeTwo(
  left: NormalizedTransaction,
  right: NormalizedTransaction,
  strategy: MergeStrategy = DEFAULT_STRATEGY,
): NormalizedTransaction {
  const { preferSource = 'left', fields = [] } = strategy;
  const preferred = preferSource === 'left' ? left : right;
  const fallback = preferSource === 'left' ? right : left;

  const base: NormalizedTransaction = { ...fallback, ...preferred };

  for (const field of fields as Array<keyof NormalizedTransaction>) {
    (base as Record<string, unknown>)[field] = (preferred as Record<string, unknown>)[field];
  }

  return base;
}

/**
 * Merges a list of transactions by id, collapsing duplicates using the
 * provided strategy. Last-write wins within each id group by default.
 */
export function mergeTransactions(
  transactions: NormalizedTransaction[],
  strategy: MergeStrategy = DEFAULT_STRATEGY,
): NormalizedTransaction[] {
  const map = new Map<string, NormalizedTransaction>();

  for (const tx of transactions) {
    const existing = map.get(tx.id);
    if (existing) {
      map.set(tx.id, mergeTwo(existing, tx, strategy));
    } else {
      map.set(tx.id, tx);
    }
  }

  return Array.from(map.values());
}

/**
 * Merges two separate lists (e.g. provider vs internal) into one,
 * applying the strategy when the same id appears in both.
 */
export function mergeLists(
  primary: NormalizedTransaction[],
  secondary: NormalizedTransaction[],
  strategy: MergeStrategy = DEFAULT_STRATEGY,
): NormalizedTransaction[] {
  return mergeTransactions([...primary, ...secondary], strategy);
}
