import { NormalizedTransaction } from '../types/transaction';

export interface EnrichedTransaction extends NormalizedTransaction {
  dayOfWeek: string;
  isWeekend: boolean;
  amountBucket: 'small' | 'medium' | 'large';
  ageInDays: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function enrichWithDateInfo(
  transaction: NormalizedTransaction
): Pick<EnrichedTransaction, 'dayOfWeek' | 'isWeekend' | 'ageInDays'> {
  const date = new Date(transaction.date);
  const now = new Date();
  const dayOfWeek = DAYS[date.getDay()];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const ageInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return { dayOfWeek, isWeekend, ageInDays };
}

export function enrichWithAmountBucket(
  transaction: NormalizedTransaction,
  smallThreshold = 100,
  largeThreshold = 1000
): Pick<EnrichedTransaction, 'amountBucket'> {
  if (transaction.amount < smallThreshold) return { amountBucket: 'small' };
  if (transaction.amount >= largeThreshold) return { amountBucket: 'large' };
  return { amountBucket: 'medium' };
}

export function enrichTransaction(
  transaction: NormalizedTransaction,
  options?: { smallThreshold?: number; largeThreshold?: number }
): EnrichedTransaction {
  return {
    ...transaction,
    ...enrichWithDateInfo(transaction),
    ...enrichWithAmountBucket(transaction, options?.smallThreshold, options?.largeThreshold),
  };
}

export function enrichTransactions(
  transactions: NormalizedTransaction[],
  options?: { smallThreshold?: number; largeThreshold?: number }
): EnrichedTransaction[] {
  return transactions.map((t) => enrichTransaction(t, options));
}
