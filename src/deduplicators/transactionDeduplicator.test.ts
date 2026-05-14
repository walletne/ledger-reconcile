import {
  deduplicationKey,
  deduplicateTransactions,
  findDuplicateGroups,
} from './transactionDeduplicator';
import { NormalizedTransaction } from '../types/transaction';

const makeTransaction = (
  id: string,
  amount: number,
  currency: string,
  date: string,
  overrides: Partial<NormalizedTransaction> = {}
): NormalizedTransaction => ({
  id,
  amount,
  currency,
  date,
  status: 'settled',
  description: 'Test transaction',
  ...overrides,
});

describe('deduplicationKey', () => {
  it('returns a consistent key for the same transaction fields', () => {
    const tx = makeTransaction('tx1', 100, 'USD', '2024-01-15');
    const key1 = deduplicationKey(tx);
    const key2 = deduplicationKey(tx);
    expect(key1).toBe(key2);
  });

  it('returns different keys for different amounts', () => {
    const tx1 = makeTransaction('tx1', 100, 'USD', '2024-01-15');
    const tx2 = makeTransaction('tx2', 200, 'USD', '2024-01-15');
    expect(deduplicationKey(tx1)).not.toBe(deduplicationKey(tx2));
  });

  it('returns different keys for different currencies', () => {
    const tx1 = makeTransaction('tx1', 100, 'USD', '2024-01-15');
    const tx2 = makeTransaction('tx2', 100, 'EUR', '2024-01-15');
    expect(deduplicationKey(tx1)).not.toBe(deduplicationKey(tx2));
  });

  it('returns different keys for different dates', () => {
    const tx1 = makeTransaction('tx1', 100, 'USD', '2024-01-15');
    const tx2 = makeTransaction('tx2', 100, 'USD', '2024-01-16');
    expect(deduplicationKey(tx1)).not.toBe(deduplicationKey(tx2));
  });
});

describe('deduplicateTransactions', () => {
  it('returns all transactions when there are no duplicates', () => {
    const txs = [
      makeTransaction('tx1', 100, 'USD', '2024-01-15'),
      makeTransaction('tx2', 200, 'USD', '2024-01-16'),
      makeTransaction('tx3', 300, 'EUR', '2024-01-15'),
    ];
    const result = deduplicateTransactions(txs);
    expect(result).toHaveLength(3);
  });

  it('removes duplicate transactions keeping the first occurrence', () => {
    const txs = [
      makeTransaction('tx1', 100, 'USD', '2024-01-15'),
      makeTransaction('tx2', 100, 'USD', '2024-01-15'),
      makeTransaction('tx3', 200, 'USD', '2024-01-16'),
    ];
    const result = deduplicateTransactions(txs);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('tx1');
  });

  it('handles an empty array', () => {
    expect(deduplicateTransactions([])).toEqual([]);
  });
});

describe('findDuplicateGroups', () => {
  it('returns empty array when no duplicates exist', () => {
    const txs = [
      makeTransaction('tx1', 100, 'USD', '2024-01-15'),
      makeTransaction('tx2', 200, 'USD', '2024-01-16'),
    ];
    expect(findDuplicateGroups(txs)).toEqual([]);
  });

  it('groups duplicate transactions together', () => {
    const txs = [
      makeTransaction('tx1', 100, 'USD', '2024-01-15'),
      makeTransaction('tx2', 100, 'USD', '2024-01-15'),
      makeTransaction('tx3', 100, 'USD', '2024-01-15'),
      makeTransaction('tx4', 200, 'USD', '2024-01-16'),
    ];
    const groups = findDuplicateGroups(txs);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(3);
    expect(groups[0].map((t) => t.id)).toEqual(['tx1', 'tx2', 'tx3']);
  });

  it('returns multiple groups when multiple duplicate sets exist', () => {
    const txs = [
      makeTransaction('tx1', 100, 'USD', '2024-01-15'),
      makeTransaction('tx2', 100, 'USD', '2024-01-15'),
      makeTransaction('tx3', 200, 'EUR', '2024-01-16'),
      makeTransaction('tx4', 200, 'EUR', '2024-01-16'),
    ];
    const groups = findDuplicateGroups(txs);
    expect(groups).toHaveLength(2);
  });
});
