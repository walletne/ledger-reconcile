import { Transaction } from '../types/transaction';

/**
 * Returns a random sample of transactions of the given size.
 * Uses Fisher-Yates shuffle to ensure uniform sampling.
 */
export function sampleRandom(
  transactions: Transaction[],
  size: number
): Transaction[] {
  if (size >= transactions.length) return [...transactions];
  const pool = [...transactions];
  for (let i = pool.length - 1; i > pool.length - 1 - size; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(pool.length - size);
}

/**
 * Returns every nth transaction (systematic sampling).
 */
export function sampleSystematic(
  transactions: Transaction[],
  interval: number
): Transaction[] {
  if (interval <= 0) throw new RangeError('interval must be greater than 0');
  return transactions.filter((_, index) => index % interval === 0);
}

/**
 * Returns the first `size` transactions (convenience head sample).
 */
export function sampleHead(
  transactions: Transaction[],
  size: number
): Transaction[] {
  if (size < 0) throw new RangeError('size must be >= 0');
  return transactions.slice(0, size);
}

export type SampleStrategy = 'random' | 'systematic' | 'head';

export interface SampleOptions {
  strategy: SampleStrategy;
  /** For 'random' and 'head': number of transactions to return. */
  size?: number;
  /** For 'systematic': step interval between sampled items. */
  interval?: number;
}

/**
 * Unified entry point for sampling transactions.
 */
export function sampleTransactions(
  transactions: Transaction[],
  options: SampleOptions
): Transaction[] {
  switch (options.strategy) {
    case 'random':
      return sampleRandom(transactions, options.size ?? 10);
    case 'systematic':
      return sampleSystematic(transactions, options.interval ?? 2);
    case 'head':
      return sampleHead(transactions, options.size ?? 10);
    default:
      throw new Error(`Unknown sampling strategy: ${(options as SampleOptions).strategy}`);
  }
}
