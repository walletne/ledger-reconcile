import { ScoredTransaction } from './transactionScorer';

/**
 * Returns the top-N scored transactions sorted by score descending.
 */
export function topN(transactions: ScoredTransaction[], n: number): ScoredTransaction[] {
  if (n <= 0) return [];
  return [...transactions].sort((a, b) => b.score - a.score).slice(0, n);
}

/**
 * Returns transactions whose score falls within [min, max] (inclusive).
 */
export function filterByScoreRange(
  transactions: ScoredTransaction[],
  min: number,
  max: number
): ScoredTransaction[] {
  if (min > max) throw new RangeError(`min (${min}) must not exceed max (${max})`);
  return transactions.filter(t => t.score >= min && t.score <= max);
}

/**
 * Computes the average score across all transactions.
 * Returns 0 for an empty array.
 */
export function averageScore(transactions: ScoredTransaction[]): number {
  if (transactions.length === 0) return 0;
  const sum = transactions.reduce((acc, t) => acc + t.score, 0);
  return Math.round((sum / transactions.length) * 1000) / 1000;
}

/**
 * Groups scored transactions into buckets: 'high' (>=0.7), 'medium' (>=0.4), 'low' (<0.4).
 */
export function bucketByScore(
  transactions: ScoredTransaction[]
): Record<'high' | 'medium' | 'low', ScoredTransaction[]> {
  const result: Record<'high' | 'medium' | 'low', ScoredTransaction[]> = {
    high: [],
    medium: [],
    low: [],
  };
  for (const t of transactions) {
    if (t.score >= 0.7) result.high.push(t);
    else if (t.score >= 0.4) result.medium.push(t);
    else result.low.push(t);
  }
  return result;
}
