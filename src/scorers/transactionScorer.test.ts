import {
  scoreByStatus,
  scoreByAmount,
  scoreByRecency,
  scoreTransaction,
  scoreTransactions,
} from './transactionScorer';
import { Transaction } from '../types/transaction';

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'txn-1',
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: new Date('2024-01-15').toISOString(),
  description: 'Test transaction',
  ...overrides,
});

describe('scoreByStatus', () => {
  it('returns 1.0 for settled', () => {
    expect(scoreByStatus(makeTransaction({ status: 'settled' }))).toBe(1.0);
  });
  it('returns 0.5 for pending', () => {
    expect(scoreByStatus(makeTransaction({ status: 'pending' }))).toBe(0.5);
  });
  it('returns 0.0 for failed', () => {
    expect(scoreByStatus(makeTransaction({ status: 'failed' }))).toBe(0.0);
  });
});

describe('scoreByAmount', () => {
  it('returns 1.0 when amount equals maxAmount', () => {
    expect(scoreByAmount(makeTransaction({ amount: 500 }), 500)).toBe(1.0);
  });
  it('returns 0.5 for half of maxAmount', () => {
    expect(scoreByAmount(makeTransaction({ amount: 50 }), 100)).toBe(0.5);
  });
  it('returns 0 when maxAmount is 0', () => {
    expect(scoreByAmount(makeTransaction({ amount: 100 }), 0)).toBe(0);
  });
  it('caps at 1.0 when amount exceeds maxAmount', () => {
    expect(scoreByAmount(makeTransaction({ amount: 200 }), 100)).toBe(1.0);
  });
});

describe('scoreByRecency', () => {
  it('returns 1.0 for today', () => {
    const today = new Date();
    const txn = makeTransaction({ date: today.toISOString() });
    expect(scoreByRecency(txn, today)).toBe(1.0);
  });
  it('returns 0.0 for transactions 365+ days old', () => {
    const ref = new Date('2024-06-01');
    const txn = makeTransaction({ date: new Date('2023-06-01').toISOString() });
    expect(scoreByRecency(txn, ref)).toBe(0.0);
  });
  it('returns a value between 0 and 1 for recent transactions', () => {
    const ref = new Date('2024-06-01');
    const txn = makeTransaction({ date: new Date('2024-03-01').toISOString() });
    const score = scoreByRecency(txn, ref);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

describe('scoreTransaction', () => {
  const ref = new Date('2024-06-01');
  it('returns a ScoredTransaction with score and breakdown', () => {
    const txn = makeTransaction({ amount: 100, status: 'settled', date: ref.toISOString() });
    const result = scoreTransaction(txn, 100, undefined, ref);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.scoreBreakdown).toBeDefined();
    expect(result.scoreBreakdown.statusScore).toBe(1.0);
  });
  it('preserves original transaction fields', () => {
    const txn = makeTransaction({ id: 'abc-123' });
    const result = scoreTransaction(txn, 200, undefined, ref);
    expect(result.id).toBe('abc-123');
  });
});

describe('scoreTransactions', () => {
  it('scores all transactions relative to max amount', () => {
    const transactions = [
      makeTransaction({ id: 't1', amount: 200, status: 'settled' }),
      makeTransaction({ id: 't2', amount: 100, status: 'pending' }),
    ];
    const results = scoreTransactions(transactions);
    expect(results).toHaveLength(2);
    expect(results[0].scoreBreakdown.amountScore).toBe(1.0);
    expect(results[1].scoreBreakdown.amountScore).toBe(0.5);
  });
  it('returns empty array for empty input', () => {
    expect(scoreTransactions([])).toEqual([]);
  });
});
