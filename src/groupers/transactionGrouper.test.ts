import {
  groupByStatus,
  groupByCurrency,
  groupByDate,
  groupBy,
} from './transactionGrouper';
import { Transaction } from '../types/transaction';

const makeTx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'tx-1',
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: '2024-03-15T10:00:00Z',
  description: 'test',
  ...overrides,
});

const transactions: Transaction[] = [
  makeTx({ id: 'tx-1', status: 'settled', currency: 'USD', date: '2024-03-15T10:00:00Z' }),
  makeTx({ id: 'tx-2', status: 'pending', currency: 'EUR', date: '2024-03-15T12:00:00Z' }),
  makeTx({ id: 'tx-3', status: 'failed',  currency: 'USD', date: '2024-03-16T09:00:00Z' }),
  makeTx({ id: 'tx-4', status: 'settled', currency: 'GBP', date: '2024-03-16T11:00:00Z' }),
  makeTx({ id: 'tx-5', status: 'settled', currency: 'USD', date: '2024-03-15T15:00:00Z' }),
];

describe('groupByStatus', () => {
  it('groups transactions into correct status buckets', () => {
    const groups = groupByStatus(transactions);
    expect(groups['settled']).toHaveLength(3);
    expect(groups['pending']).toHaveLength(1);
    expect(groups['failed']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByStatus([])).toEqual({});
  });
});

describe('groupByCurrency', () => {
  it('groups transactions by currency', () => {
    const groups = groupByCurrency(transactions);
    expect(groups['USD']).toHaveLength(3);
    expect(groups['EUR']).toHaveLength(1);
    expect(groups['GBP']).toHaveLength(1);
  });

  it('uses UNKNOWN for transactions without currency', () => {
    const tx = makeTx({ id: 'tx-x', currency: undefined });
    const groups = groupByCurrency([tx]);
    expect(groups['UNKNOWN']).toHaveLength(1);
  });
});

describe('groupByDate', () => {
  it('groups transactions by calendar date', () => {
    const groups = groupByDate(transactions);
    expect(groups['2024-03-15']).toHaveLength(3);
    expect(groups['2024-03-16']).toHaveLength(2);
  });
});

describe('groupBy', () => {
  it('groups by a custom key extractor', () => {
    const groups = groupBy(transactions, (tx) =>
      tx.amount >= 100 ? 'high' : 'low'
    );
    expect(groups['high']).toHaveLength(5);
  });

  it('returns empty object for empty input', () => {
    expect(groupBy([], (tx) => tx.id)).toEqual({});
  });
});
