import { Transaction } from '../types/transaction';

export type ScoredTransaction = Transaction & { score: number; scoreBreakdown: ScoreBreakdown };

export interface ScoreBreakdown {
  statusScore: number;
  amountScore: number;
  recencyScore: number;
  total: number;
}

export interface ScoringWeights {
  status: number;
  amount: number;
  recency: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = { status: 0.4, amount: 0.3, recency: 0.3 };

export function scoreByStatus(transaction: Transaction): number {
  switch (transaction.status) {
    case 'settled': return 1.0;
    case 'pending': return 0.5;
    case 'failed':  return 0.0;
    default:        return 0.25;
  }
}

export function scoreByAmount(transaction: Transaction, maxAmount: number): number {
  if (maxAmount <= 0) return 0;
  return Math.min(transaction.amount / maxAmount, 1.0);
}

export function scoreByRecency(transaction: Transaction, referenceDate: Date = new Date()): number {
  const ageMs = referenceDate.getTime() - new Date(transaction.date).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays <= 0) return 1.0;
  if (ageDays >= 365) return 0.0;
  return 1.0 - ageDays / 365;
}

export function scoreTransaction(
  transaction: Transaction,
  maxAmount: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  referenceDate?: Date
): ScoredTransaction {
  const statusScore = scoreByStatus(transaction);
  const amountScore = scoreByAmount(transaction, maxAmount);
  const recencyScore = scoreByRecency(transaction, referenceDate);
  const total =
    statusScore * weights.status +
    amountScore * weights.amount +
    recencyScore * weights.recency;

  return {
    ...transaction,
    score: Math.round(total * 1000) / 1000,
    scoreBreakdown: { statusScore, amountScore, recencyScore, total },
  };
}

export function scoreTransactions(
  transactions: Transaction[],
  weights?: ScoringWeights,
  referenceDate?: Date
): ScoredTransaction[] {
  const maxAmount = transactions.reduce((max, t) => Math.max(max, t.amount), 0);
  return transactions.map(t => scoreTransaction(t, maxAmount, weights, referenceDate));
}
