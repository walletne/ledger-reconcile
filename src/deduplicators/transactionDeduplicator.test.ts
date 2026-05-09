import {
  deduplicationKey,
  deduplicateTransactions,
  findDuplicateGroups,
} from './transactionDeduplicator';
import { NormalizedTransaction } from '../types/transaction';

const base: NormalizedTransaction = {
  id: 'internal-1',
  externalId: 'ext-abc',
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: new Date('2024-03-15T10:00:00Z'),
};

const duplicate: NormalizedTransaction = {
  ...base,
  id: 'internal-2',
  date: new Date('2024-03-15T18:30:00Z'), // same day, different time
};

const different: NormalizedTransaction = {
  ...base,
  id: 'internal-3',
  externalId: 'ext-xyz',
  amount: 200,
};

describe('deduplicationKey', () => {
  it('produces the same key for transactions on the same day with same fields', () => {
    expect(deduplicationKey(base)).toBe(deduplicationKey(duplicate));
  });

  it('produces different keys when externalId differs', () => {
    expect(deduplicationKey(base)).not.toBe(deduplicationKey(different));
  });

  it('includes currency in the key', () => {
    const gbp = { ...base, currency: 'GBP' };
    expect(deduplicationKey(base)).not.toBe(deduplicationKey(gbp));
  });
});

describe('deduplicateTransactions', () => {
  it('returns a single transaction when given no duplicates', () => {
    const result = deduplicateTransactions([base, different]);
    expect(result).toHaveLength(2);
  });

  it('removes duplicate transactions, keeping the first occurrence', () => {
    const result = deduplicateTransactions([base, duplicate, different]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('internal-1');
  });

  it('returns an empty array when given an empty input', () => {
    expect(deduplicateTransactions([])).toEqual([]);
  });

  it('handles a list with all duplicates', () => {
    const result = deduplicateTransactions([base, duplicate]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('internal-1');
  });
});

describe('findDuplicateGroups', () => {
  it('returns groups with more than one member', () => {
    const groups = findDuplicateGroups([base, duplicate, different]);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });

  it('returns an empty array when there are no duplicates', () => {
    const groups = findDuplicateGroups([base, different]);
    expect(groups).toHaveLength(0);
  });

  it('returns an empty array for empty input', () => {
    expect(findDuplicateGroups([])).toEqual([]);
  });
});
