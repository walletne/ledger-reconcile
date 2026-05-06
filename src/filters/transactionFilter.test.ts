import {
  filterByStatus,
  filterByAmountRange,
  filterByDateRange,
  filterTransactions,
} from './transactionFilter';
import { Transaction } from '../types/transaction';

const mockTransactions: Transaction[] = [
  { id: 'tx1', amount: 100, currency: 'USD', status: 'settled', date: '2024-01-10', provider: 'stripe' },
  { id: 'tx2', amount: 250, currency: 'USD', status: 'pending', date: '2024-01-15', provider: 'stripe' },
  { id: 'tx3', amount: 50,  currency: 'EUR', status: 'failed',  date: '2024-01-20', provider: 'paypal' },
  { id: 'tx4', amount: 400, currency: 'USD', status: 'settled', date: '2024-02-01', provider: 'paypal' },
];

describe('filterByStatus', () => {
  it('returns only settled transactions', () => {
    const result = filterByStatus(mockTransactions, 'settled');
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.status === 'settled')).toBe(true);
  });

  it('returns all transactions when status is undefined', () => {
    const result = filterByStatus(mockTransactions, undefined);
    expect(result).toHaveLength(4);
  });
});

describe('filterByAmountRange', () => {
  it('filters by minimum amount', () => {
    const result = filterByAmountRange(mockTransactions, 200);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.amount >= 200)).toBe(true);
  });

  it('filters by maximum amount', () => {
    const result = filterByAmountRange(mockTransactions, undefined, 100);
    expect(result).toHaveLength(2);
  });

  it('filters by both min and max', () => {
    const result = filterByAmountRange(mockTransactions, 100, 300);
    expect(result).toHaveLength(2);
  });
});

describe('filterByDateRange', () => {
  it('filters by start date', () => {
    const result = filterByDateRange(mockTransactions, new Date('2024-01-16'));
    expect(result).toHaveLength(2);
  });

  it('filters by end date', () => {
    const result = filterByDateRange(mockTransactions, undefined, new Date('2024-01-15'));
    expect(result).toHaveLength(2);
  });
});

describe('filterTransactions', () => {
  it('applies multiple filters together', () => {
    const result = filterTransactions(mockTransactions, {
      status: 'settled',
      currency: 'USD',
      minAmount: 50,
    });
    expect(result).toHaveLength(2);
  });

  it('filters by provider', () => {
    const result = filterTransactions(mockTransactions, { provider: 'paypal' });
    expect(result).toHaveLength(2);
  });

  it('returns all when no options provided', () => {
    const result = filterTransactions(mockTransactions, {});
    expect(result).toHaveLength(4);
  });
});
