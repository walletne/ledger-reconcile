import { Transaction } from '../types/transaction';

export interface AggregationResult {
  totalAmount: number;
  count: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  currencyBreakdown: Record<string, number>;
}

export function aggregateAmounts(transactions: Transaction[]): AggregationResult {
  if (transactions.length === 0) {
    return {
      totalAmount: 0,
      count: 0,
      averageAmount: 0,
      minAmount: 0,
      maxAmount: 0,
      currencyBreakdown: {},
    };
  }

  let totalAmount = 0;
  let minAmount = Infinity;
  let maxAmount = -Infinity;
  const currencyBreakdown: Record<string, number> = {};

  for (const tx of transactions) {
    totalAmount += tx.amount;
    if (tx.amount < minAmount) minAmount = tx.amount;
    if (tx.amount > maxAmount) maxAmount = tx.amount;
    currencyBreakdown[tx.currency] = (currencyBreakdown[tx.currency] ?? 0) + tx.amount;
  }

  return {
    totalAmount,
    count: transactions.length,
    averageAmount: totalAmount / transactions.length,
    minAmount,
    maxAmount,
    currencyBreakdown,
  };
}

export function aggregateByField<K extends keyof Transaction>(
  transactions: Transaction[],
  field: K
): Map<Transaction[K], AggregationResult> {
  const groups = new Map<Transaction[K], Transaction[]>();

  for (const tx of transactions) {
    const key = tx[field];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tx);
  }

  const result = new Map<Transaction[K], AggregationResult>();
  for (const [key, group] of groups) {
    result.set(key, aggregateAmounts(group));
  }
  return result;
}

export function aggregateTransactions(
  transactions: Transaction[],
  groupByField?: keyof Transaction
): AggregationResult | Map<Transaction[keyof Transaction], AggregationResult> {
  if (groupByField) {
    return aggregateByField(transactions, groupByField);
  }
  return aggregateAmounts(transactions);
}
