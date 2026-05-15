import {
  segmentTransactions,
  segmentByValueTier,
  segmentByCurrency,
} from './transactionSegmenter';
import { Transaction } from '../types/transaction';

const makeTx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'tx-1',
  amount: 200,
  currency: 'USD',
  status: 'settled',
  date: '2024-01-15',
  description: 'Test',
  ...overrides,
});

const transactions: Transaction[] = [
  makeTx({ id: 'tx-1', amount: 50, currency: 'USD' }),
  makeTx({ id: 'tx-2', amount: 500, currency: 'EUR' }),
  makeTx({ id: 'tx-3', amount: 1500, currency: 'USD' }),
  makeTx({ id: 'tx-4', amount: 120, currency: 'GBP' }),
];

describe('segmentTransactions', () => {
  it('places transactions into the first matching segment', () => {
    const segments = segmentTransactions(transactions, [
      { label: 'large', predicate: (tx) => tx.amount > 1000 },
      { label: 'small', predicate: (tx) => tx.amount <= 200 },
    ]);
    const large = segments.find((s) => s.label === 'large')!;
    const small = segments.find((s) => s.label === 'small')!;
    const unclassified = segments.find((s) => s.label === 'unclassified')!;

    expect(large.transactions).toHaveLength(1);
    expect(large.transactions[0].id).toBe('tx-3');
    expect(small.transactions).toHaveLength(2);
    expect(unclassified.transactions).toHaveLength(1);
    expect(unclassified.transactions[0].id).toBe('tx-2');
  });

  it('returns all segments including empty ones', () => {
    const segments = segmentTransactions([], [
      { label: 'a', predicate: () => true },
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0].transactions).toHaveLength(0);
  });
});

describe('segmentByValueTier', () => {
  it('segments into low, medium, high tiers', () => {
    const segments = segmentByValueTier(transactions);
    const labels = segments.map((s) => s.label);
    expect(labels).toContain('high-value');
    expect(labels).toContain('medium-value');
    expect(labels).toContain('low-value');

    const high = segments.find((s) => s.label === 'high-value')!;
    expect(high.transactions[0].id).toBe('tx-3');

    const low = segments.find((s) => s.label === 'low-value')!;
    expect(low.transactions[0].id).toBe('tx-1');
  });

  it('respects custom thresholds', () => {
    const segments = segmentByValueTier(transactions, 200, 600);
    const high = segments.find((s) => s.label === 'high-value')!;
    expect(high.transactions).toHaveLength(1);
    expect(high.transactions[0].id).toBe('tx-3');
  });
});

describe('segmentByCurrency', () => {
  it('creates one segment per currency', () => {
    const segments = segmentByCurrency(transactions);
    const labels = segments.map((s) => s.label);
    expect(labels).toContain('USD');
    expect(labels).toContain('EUR');
    expect(labels).toContain('GBP');

    const usd = segments.find((s) => s.label === 'USD')!;
    expect(usd.transactions).toHaveLength(2);
  });

  it('handles empty input', () => {
    const segments = segmentByCurrency([]);
    expect(segments).toHaveLength(1); // only 'unclassified'
    expect(segments[0].label).toBe('unclassified');
  });
});
