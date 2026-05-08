import {
  sortByDate,
  sortByAmount,
  sortById,
  sortByStatus,
  sortTransactions,
} from './transactionSorter';
import { Transaction } from '../types/transaction';

const makeTransaction = (overrides: Partial<Transaction>): Transaction => ({
  id: 'txn-1',
  amount: 100,
  currency: 'USD',
  date: '2024-01-01',
  status: 'settled',
  description: 'Test',
  ...overrides,
});

const transactions: Transaction[] = [
  makeTransaction({ id: 'txn-3', amount: 300, date: '2024-03-01', status: 'settled' }),
  makeTransaction({ id: 'txn-1', amount: 100, date: '2024-01-01', status: 'failed' }),
  makeTransaction({ id: 'txn-2', amount: 200, date: '2024-02-01', status: 'pending' }),
];

describe('sortByDate', () => {
  it('sorts ascending by default', () => {
    const result = sortByDate(transactions);
    expect(result.map(t => t.date)).toEqual(['2024-01-01', '2024-02-01', '2024-03-01']);
  });

  it('sorts descending', () => {
    const result = sortByDate(transactions, 'desc');
    expect(result.map(t => t.date)).toEqual(['2024-03-01', '2024-02-01', '2024-01-01']);
  });
});

describe('sortByAmount', () => {
  it('sorts ascending', () => {
    const result = sortByAmount(transactions);
    expect(result.map(t => t.amount)).toEqual([100, 200, 300]);
  });

  it('sorts descending', () => {
    const result = sortByAmount(transactions, 'desc');
    expect(result.map(t => t.amount)).toEqual([300, 200, 100]);
  });
});

describe('sortById', () => {
  it('sorts ascending', () => {
    const result = sortById(transactions);
    expect(result.map(t => t.id)).toEqual(['txn-1', 'txn-2', 'txn-3']);
  });

  it('sorts descending', () => {
    const result = sortById(transactions, 'desc');
    expect(result.map(t => t.id)).toEqual(['txn-3', 'txn-2', 'txn-1']);
  });
});

describe('sortByStatus', () => {
  it('sorts alphabetically ascending', () => {
    const result = sortByStatus(transactions);
    expect(result.map(t => t.status)).toEqual(['failed', 'pending', 'settled']);
  });
});

describe('sortTransactions', () => {
  it('delegates to correct sorter', () => {
    const result = sortTransactions(transactions, { field: 'amount', order: 'asc' });
    expect(result.map(t => t.amount)).toEqual([100, 200, 300]);
  });

  it('throws on unknown field', () => {
    expect(() =>
      sortTransactions(transactions, { field: 'unknown' as any })
    ).toThrow('Unknown sort field: unknown');
  });

  it('does not mutate the original array', () => {
    const original = [...transactions];
    sortTransactions(transactions, { field: 'date', order: 'desc' });
    expect(transactions).toEqual(original);
  });
});
