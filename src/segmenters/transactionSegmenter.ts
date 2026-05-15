import { Transaction } from '../types/transaction';

export type Segment = {
  label: string;
  transactions: Transaction[];
};

export type SegmentCriteria = {
  label: string;
  predicate: (tx: Transaction) => boolean;
};

/**
 * Segments transactions into labeled groups based on ordered criteria.
 * A transaction is placed into the FIRST matching segment.
 * Transactions matching no criteria are placed in an "unclassified" segment.
 */
export function segmentTransactions(
  transactions: Transaction[],
  criteria: SegmentCriteria[]
): Segment[] {
  const buckets = new Map<string, Transaction[]>();

  for (const { label } of criteria) {
    buckets.set(label, []);
  }
  buckets.set('unclassified', []);

  for (const tx of transactions) {
    const match = criteria.find(({ predicate }) => predicate(tx));
    const label = match ? match.label : 'unclassified';
    buckets.get(label)!.push(tx);
  }

  return Array.from(buckets.entries()).map(([label, txs]) => ({
    label,
    transactions: txs,
  }));
}

/**
 * Segments transactions into low / medium / high value tiers.
 */
export function segmentByValueTier(
  transactions: Transaction[],
  lowThreshold = 100,
  highThreshold = 1000
): Segment[] {
  return segmentTransactions(transactions, [
    { label: 'high-value', predicate: (tx) => tx.amount >= highThreshold },
    { label: 'medium-value', predicate: (tx) => tx.amount >= lowThreshold },
    { label: 'low-value', predicate: (tx) => tx.amount < lowThreshold },
  ]);
}

/**
 * Segments transactions by currency.
 */
export function segmentByCurrency(transactions: Transaction[]): Segment[] {
  const currencies = [...new Set(transactions.map((tx) => tx.currency))];
  const criteria: SegmentCriteria[] = currencies.map((currency) => ({
    label: currency,
    predicate: (tx) => tx.currency === currency,
  }));
  return segmentTransactions(transactions, criteria);
}
