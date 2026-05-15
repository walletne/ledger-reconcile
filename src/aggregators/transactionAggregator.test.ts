import { aggregateAmounts, aggregateByField, aggregateTransactions } from './transactionAggregator';
import { Transaction } from '../types/transaction';

const makeTx = (id: string, amount: number, currency: string, status: string): Transaction => ({
  id,
  amount,
  currency,
  status: status as Transaction['status'],
  date: '2024-01-01',
  description: 'Test',
});

const transactions: Transaction[] = [
  makeTx('1', 100, 'USD', 'settled'),
  makeTx('2', 200, 'USD', 'settled'),
  makeTx('3', 50,  'EUR', 'pending'),
  makeTx('4', 300, 'EUR', 'failed'),
];

describe('aggregateAmounts', () => {
  it('returns zeros for empty array', () => {
    const result = aggregateAmounts([]);
    expect(result.totalAmount).toBe(0);
    expect(result.count).toBe(0);
    expect(result.averageAmount).toBe(0);
    expect(result.minAmount).toBe(0);
    expect(result.maxAmount).toBe(0);
  });

  it('computes correct totals', () => {
    const result = aggregateAmounts(transactions);
    expect(result.totalAmount).toBe(650);
    expect(result.count).toBe(4);
    expect(result.averageAmount).toBe(162.5);
    expect(result.minAmount).toBe(50);
    expect(result.maxAmount).toBe(300);
  });

  it('breaks down amounts by currency', () => {
    const result = aggregateAmounts(transactions);
    expect(result.currencyBreakdown['USD']).toBe(300);
    expect(result.currencyBreakdown['EUR']).toBe(350);
  });
});

describe('aggregateByField', () => {
  it('groups by currency and aggregates each group', () => {
    const result = aggregateByField(transactions, 'currency');
    expect(result.get('USD')?.count).toBe(2);
    expect(result.get('USD')?.totalAmount).toBe(300);
    expect(result.get('EUR')?.count).toBe(2);
    expect(result.get('EUR')?.totalAmount).toBe(350);
  });

  it('groups by status and aggregates each group', () => {
    const result = aggregateByField(transactions, 'status');
    expect(result.get('settled')?.count).toBe(2);
    expect(result.get('pending')?.count).toBe(1);
    expect(result.get('failed')?.count).toBe(1);
  });
});

describe('aggregateTransactions', () => {
  it('returns flat aggregation when no groupByField provided', () => {
    const result = aggregateTransactions(transactions);
    expect(result).toHaveProperty('totalAmount', 650);
  });

  it('returns grouped aggregation when groupByField provided', () => {
    const result = aggregateTransactions(transactions, 'currency') as Map<string, any>;
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
  });
});
