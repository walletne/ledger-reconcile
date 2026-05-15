import { Transaction } from '../types/transaction';

export type TransactionCategory =
  | 'micro'
  | 'small'
  | 'medium'
  | 'large'
  | 'whale';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ClassifiedTransaction extends Transaction {
  category: TransactionCategory;
  riskLevel: RiskLevel;
}

const CATEGORY_THRESHOLDS: Record<TransactionCategory, number> = {
  micro: 10,
  small: 100,
  medium: 1000,
  large: 10000,
  whale: Infinity,
};

export function classifyByAmount(amount: number): TransactionCategory {
  for (const [category, threshold] of Object.entries(CATEGORY_THRESHOLDS) as [
    TransactionCategory,
    number,
  ][]) {
    if (amount < threshold) {
      return category;
    }
  }
  return 'whale';
}

export function assessRisk(transaction: Transaction): RiskLevel {
  const { amount, status } = transaction;

  if (status === 'failed') {
    return 'high';
  }

  if (amount >= 10000) {
    return 'high';
  }

  if (amount >= 1000 || status === 'pending') {
    return 'medium';
  }

  return 'low';
}

export function classifyTransaction(
  transaction: Transaction,
): ClassifiedTransaction {
  return {
    ...transaction,
    category: classifyByAmount(transaction.amount),
    riskLevel: assessRisk(transaction),
  };
}

export function classifyTransactions(
  transactions: Transaction[],
): ClassifiedTransaction[] {
  return transactions.map(classifyTransaction);
}

export function filterByCategory(
  transactions: ClassifiedTransaction[],
  category: TransactionCategory,
): ClassifiedTransaction[] {
  return transactions.filter((t) => t.category === category);
}

export function filterByRisk(
  transactions: ClassifiedTransaction[],
  riskLevel: RiskLevel,
): ClassifiedTransaction[] {
  return transactions.filter((t) => t.riskLevel === riskLevel);
}
