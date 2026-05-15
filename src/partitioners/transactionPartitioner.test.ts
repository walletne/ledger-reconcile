import {
  partitionBy,
  partitionByAmountThreshold,
  partitionByDateThreshold,
  partitionByCurrency,
} from './transactionPartitioner';
import { Transaction } from '../types/transaction';

const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'tx-1',
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: '2024-03-15T10:00:00Z',
  description: 'Test transaction',
  ...overrides,
});

const transactions: Transaction[] = [
  makeTx({ id: 'tx-1', amount: 50, currency: 'USD', date: '2024-01-10T00:00:00Z' }),
  makeTx({ id: 'tx-2', amount: 200, currency: 'EUR', date: '2024-02-20T00:00:00Z' }),
  makeTx({ id: 'tx-3', amount: 100, currency: 'USD', date: '2024-03-05T00:00:00Z' }),
  makeTx({ id: 'tx-4', amount: 500, currency: 'GBP', date: '2024-04-01T00:00:00Z' }),
];

describe('partitionBy', () => {
  it('splits transactions based on a custom predicate', () => {
    const { passing, failing } = partitionBy(transactions, (tx) => tx.status === 'settled');
    expect(passing).toHaveLength(4);
    expect(failing).toHaveLength(0);
  });

  it('returns empty arrays when no transactions provided', () => {
    const { passing, failing } = partitionBy([], () => true);
    expect(passing).toHaveLength(0);
    expect(failing).toHaveLength(0);
  });
});

describe('partitionByAmountThreshold', () => {
  it('separates transactions at or above threshold', () => {
    const { passing, failing } = partitionByAmountThreshold(transactions, 100);
    expect(passing.map((t) => t.id)).toEqual(['tx-2', 'tx-3', 'tx-4']);
    expect(failing.map((t) => t.id)).toEqual(['tx-1']);
  });

  it('puts all in failing when threshold is very high', () => {
    const { passing, failing } = partitionByAmountThreshold(transactions, 10000);
    expect(passing).toHaveLength(0);
    expect(failing).toHaveLength(4);
  });
});

describe('partitionByDateThreshold', () => {
  it('separates transactions on or after the cutoff date', () => {
    const cutoff = new Date('2024-03-01T00:00:00Z');
    const { passing, failing } = partitionByDateThreshold(transactions, cutoff);
    expect(passing.map((t) => t.id)).toEqual(['tx-3', 'tx-4']);
    expect(failing.map((t) => t.id)).toEqual(['tx-1', 'tx-2']);
  });
});

describe('partitionByCurrency', () => {
  it('separates USD transactions from others', () => {
    const { passing, failing } = partitionByCurrency(transactions, 'USD');
    expect(passing.map((t) => t.id)).toEqual(['tx-1', 'tx-3']);
    expect(failing.map((t) => t.id)).toEqual(['tx-2', 'tx-4']);
  });

  it('returns all in failing for unknown currency', () => {
    const { passing, failing } = partitionByCurrency(transactions, 'JPY');
    expect(passing).toHaveLength(0);
    expect(failing).toHaveLength(4);
  });
});
