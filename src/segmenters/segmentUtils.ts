import { Segment } from './transactionSegmenter';
import { Transaction } from '../types/transaction';

/**
 * Returns the segment with the most transactions.
 */
export function largestSegment(segments: Segment[]): Segment | undefined {
  return segments.reduce<Segment | undefined>((best, seg) => {
    if (!best || seg.transactions.length > best.transactions.length) return seg;
    return best;
  }, undefined);
}

/**
 * Returns the segment with the fewest transactions (excluding empty segments).
 */
export function smallestSegment(segments: Segment[]): Segment | undefined {
  const nonEmpty = segments.filter((s) => s.transactions.length > 0);
  return nonEmpty.reduce<Segment | undefined>((best, seg) => {
    if (!best || seg.transactions.length < best.transactions.length) return seg;
    return best;
  }, undefined);
}

/**
 * Flattens all segments back into a single deduplicated transaction list
 * preserving the order of segments.
 */
export function flattenSegments(segments: Segment[]): Transaction[] {
  const seen = new Set<string>();
  const result: Transaction[] = [];
  for (const { transactions } of segments) {
    for (const tx of transactions) {
      if (!seen.has(tx.id)) {
        seen.add(tx.id);
        result.push(tx);
      }
    }
  }
  return result;
}

/**
 * Builds a summary map of segment label -> transaction count.
 */
export function segmentCounts(segments: Segment[]): Record<string, number> {
  return Object.fromEntries(
    segments.map(({ label, transactions }) => [label, transactions.length])
  );
}

/**
 * Filters out the "unclassified" segment from results.
 */
export function dropUnclassified(segments: Segment[]): Segment[] {
  return segments.filter((s) => s.label !== 'unclassified');
}
