import {
  enrichTransaction,
  enrichTransactions,
  enrichWithAmountBucket,
  enrichWithDateInfo,
} from './transactionEnricher';
import { NormalizedTransaction } from '../types/transaction';

const makeTransaction = (overrides: Partial<NormalizedTransaction> = {}): NormalizedTransaction => ({
  id: 'txn-001',
  amount: 250,
  currency: 'USD',
  status: 'settled',
  date: '2024-03-15T10:00:00Z', // Friday
  description: 'Test payment',
  ...overrides,
});

describe('enrichWithDateInfo', () => {
  it('returns correct day of week', () => {
    const result = enrichWithDateInfo(makeTransaction({ date: '2024-03-15T10:00:00Z' }));
    expect(result.dayOfWeek).toBe('Friday');
  });

  it('identifies weekdays correctly', () => {
    const result = enrichWithDateInfo(makeTransaction({ date: '2024-03-15T10:00:00Z' }));
    expect(result.isWeekend).toBe(false);
  });

  it('identifies weekends correctly', () => {
    const result = enrichWithDateInfo(makeTransaction({ date: '2024-03-16T10:00:00Z' }));
    expect(result.isWeekend).toBe(true);
  });

  it('calculates ageInDays as a non-negative number', () => {
    const result = enrichWithDateInfo(makeTransaction());
    expect(result.ageInDays).toBeGreaterThanOrEqual(0);
  });
});

describe('enrichWithAmountBucket', () => {
  it('returns small for amounts below threshold', () => {
    expect(enrichWithAmountBucket(makeTransaction({ amount: 50 })).amountBucket).toBe('small');
  });

  it('returns medium for amounts in range', () => {
    expect(enrichWithAmountBucket(makeTransaction({ amount: 500 })).amountBucket).toBe('medium');
  });

  it('returns large for amounts at or above large threshold', () => {
    expect(enrichWithAmountBucket(makeTransaction({ amount: 1000 })).amountBucket).toBe('large');
  });

  it('respects custom thresholds', () => {
    expect(
      enrichWithAmountBucket(makeTransaction({ amount: 150 }), 200, 500).amountBucket
    ).toBe('small');
  });
});

describe('enrichTransaction', () => {
  it('returns a fully enriched transaction', () => {
    const result = enrichTransaction(makeTransaction());
    expect(result).toHaveProperty('dayOfWeek');
    expect(result).toHaveProperty('isWeekend');
    expect(result).toHaveProperty('ageInDays');
    expect(result).toHaveProperty('amountBucket');
  });

  it('preserves original transaction fields', () => {
    const txn = makeTransaction();
    const result = enrichTransaction(txn);
    expect(result.id).toBe(txn.id);
    expect(result.amount).toBe(txn.amount);
    expect(result.status).toBe(txn.status);
  });
});

describe('enrichTransactions', () => {
  it('enriches all transactions in an array', () => {
    const txns = [makeTransaction({ id: 'a' }), makeTransaction({ id: 'b' })];
    const results = enrichTransactions(txns);
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r).toHaveProperty('amountBucket'));
  });

  it('returns empty array for empty input', () => {
    expect(enrichTransactions([])).toEqual([]);
  });
});
