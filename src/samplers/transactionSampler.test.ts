import {
  sampleRandom,
  sampleSystematic,
  sampleHead,
  sampleTransactions,
} from './transactionSampler';
import { Transaction } from '../types/transaction';

const makeTransaction = (id: string): Transaction => ({
  id,
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: '2024-01-01',
  description: 'Test',
});

const transactions: Transaction[] = Array.from({ length: 20 }, (_, i) =>
  makeTransaction(`tx-${i}`)
);

describe('sampleRandom', () => {
  it('returns the requested number of transactions', () => {
    const result = sampleRandom(transactions, 5);
    expect(result).toHaveLength(5);
  });

  it('returns all transactions when size >= length', () => {
    const result = sampleRandom(transactions, 100);
    expect(result).toHaveLength(transactions.length);
  });

  it('does not mutate the original array', () => {
    const copy = [...transactions];
    sampleRandom(transactions, 5);
    expect(transactions).toEqual(copy);
  });
});

describe('sampleSystematic', () => {
  it('returns every nth transaction', () => {
    const result = sampleSystematic(transactions, 5);
    expect(result).toHaveLength(4);
    expect(result[0].id).toBe('tx-0');
    expect(result[1].id).toBe('tx-5');
  });

  it('returns all transactions when interval is 1', () => {
    expect(sampleSystematic(transactions, 1)).toHaveLength(20);
  });

  it('throws for non-positive interval', () => {
    expect(() => sampleSystematic(transactions, 0)).toThrow(RangeError);
  });
});

describe('sampleHead', () => {
  it('returns the first n transactions', () => {
    const result = sampleHead(transactions, 3);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('tx-0');
  });

  it('returns empty array for size 0', () => {
    expect(sampleHead(transactions, 0)).toHaveLength(0);
  });

  it('throws for negative size', () => {
    expect(() => sampleHead(transactions, -1)).toThrow(RangeError);
  });
});

describe('sampleTransactions', () => {
  it('delegates to sampleRandom', () => {
    const result = sampleTransactions(transactions, { strategy: 'random', size: 4 });
    expect(result).toHaveLength(4);
  });

  it('delegates to sampleSystematic', () => {
    const result = sampleTransactions(transactions, { strategy: 'systematic', interval: 4 });
    expect(result).toHaveLength(5);
  });

  it('delegates to sampleHead', () => {
    const result = sampleTransactions(transactions, { strategy: 'head', size: 7 });
    expect(result).toHaveLength(7);
  });

  it('throws for unknown strategy', () => {
    expect(() =>
      sampleTransactions(transactions, { strategy: 'unknown' as never })
    ).toThrow();
  });
});
