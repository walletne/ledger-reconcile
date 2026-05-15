import {
  compareByDate,
  compareByAmount,
  compareById,
  compareByStatus,
  reverseComparator,
  chainComparators,
  buildComparator,
} from './transactionComparator';
import { Transaction } from '../types/transaction';

const base: Transaction = {
  id: 'txn-1',
  date: '2024-01-15',
  amount: 100,
  currency: 'USD',
  status: 'settled',
};

const makeTransaction = (overrides: Partial<Transaction>): Transaction => ({
  ...base,
  ...overrides,
});

describe('compareByDate', () => {
  it('returns -1 when a is earlier than b', () => {
    const a = makeTransaction({ date: '2024-01-01' });
    const b = makeTransaction({ date: '2024-06-01' });
    expect(compareByDate(a, b)).toBe(-1);
  });

  it('returns 1 when a is later than b', () => {
    const a = makeTransaction({ date: '2024-06-01' });
    const b = makeTransaction({ date: '2024-01-01' });
    expect(compareByDate(a, b)).toBe(1);
  });

  it('returns 0 when dates are equal', () => {
    const a = makeTransaction({ date: '2024-03-10' });
    const b = makeTransaction({ date: '2024-03-10' });
    expect(compareByDate(a, b)).toBe(0);
  });
});

describe('compareByAmount', () => {
  it('returns -1 when a amount is less', () => {
    expect(compareByAmount(makeTransaction({ amount: 50 }), makeTransaction({ amount: 200 }))).toBe(-1);
  });

  it('returns 1 when a amount is greater', () => {
    expect(compareByAmount(makeTransaction({ amount: 300 }), makeTransaction({ amount: 100 }))).toBe(1);
  });

  it('returns 0 for equal amounts', () => {
    expect(compareByAmount(makeTransaction({ amount: 100 }), makeTransaction({ amount: 100 }))).toBe(0);
  });
});

describe('compareById', () => {
  it('orders ids lexicographically', () => {
    expect(compareById(makeTransaction({ id: 'a' }), makeTransaction({ id: 'b' }))).toBe(-1);
    expect(compareById(makeTransaction({ id: 'b' }), makeTransaction({ id: 'a' }))).toBe(1);
    expect(compareById(makeTransaction({ id: 'x' }), makeTransaction({ id: 'x' }))).toBe(0);
  });
});

describe('reverseComparator', () => {
  it('inverts the result of the wrapped comparator', () => {
    const reversed = reverseComparator(compareByAmount);
    expect(reversed(makeTransaction({ amount: 50 }), makeTransaction({ amount: 200 }))).toBe(1);
    expect(reversed(makeTransaction({ amount: 200 }), makeTransaction({ amount: 50 }))).toBe(-1);
  });
});

describe('chainComparators', () => {
  it('falls through to the next comparator on tie', () => {
    const chained = chainComparators(compareByStatus, compareByAmount);
    const a = makeTransaction({ status: 'settled', amount: 50 });
    const b = makeTransaction({ status: 'settled', amount: 200 });
    expect(chained(a, b)).toBe(-1);
  });

  it('stops at the first non-zero result', () => {
    const chained = chainComparators(compareByDate, compareByAmount);
    const a = makeTransaction({ date: '2024-01-01', amount: 999 });
    const b = makeTransaction({ date: '2024-06-01', amount: 1 });
    expect(chained(a, b)).toBe(-1);
  });
});

describe('buildComparator', () => {
  it('throws when no keys provided', () => {
    expect(() => buildComparator([])).toThrow();
  });

  it('builds ascending comparator', () => {
    const cmp = buildComparator(['amount']);
    const sorted = [makeTransaction({ amount: 300 }), makeTransaction({ amount: 100 }), makeTransaction({ amount: 200 })]
      .sort(cmp);
    expect(sorted.map((t) => t.amount)).toEqual([100, 200, 300]);
  });

  it('builds descending comparator', () => {
    const cmp = buildComparator(['amount'], true);
    const sorted = [makeTransaction({ amount: 100 }), makeTransaction({ amount: 300 }), makeTransaction({ amount: 200 })]
      .sort(cmp);
    expect(sorted.map((t) => t.amount)).toEqual([300, 200, 100]);
  });
});
