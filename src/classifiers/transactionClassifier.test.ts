import {
  classifyByAmount,
  assessRisk,
  classifyTransaction,
  classifyTransactions,
  filterByCategory,
  filterByRisk,
} from './transactionClassifier';
import { Transaction } from '../types/transaction';

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'txn-001',
  amount: 50,
  currency: 'USD',
  status: 'settled',
  date: '2024-01-15',
  description: 'Test transaction',
  ...overrides,
});

describe('classifyByAmount', () => {
  it('classifies amounts below 10 as micro', () => {
    expect(classifyByAmount(5)).toBe('micro');
  });

  it('classifies amounts below 100 as small', () => {
    expect(classifyByAmount(50)).toBe('small');
  });

  it('classifies amounts below 1000 as medium', () => {
    expect(classifyByAmount(500)).toBe('medium');
  });

  it('classifies amounts below 10000 as large', () => {
    expect(classifyByAmount(5000)).toBe('large');
  });

  it('classifies amounts 10000 and above as whale', () => {
    expect(classifyByAmount(10000)).toBe('whale');
    expect(classifyByAmount(99999)).toBe('whale');
  });
});

describe('assessRisk', () => {
  it('returns high risk for failed transactions', () => {
    expect(assessRisk(makeTransaction({ status: 'failed' }))).toBe('high');
  });

  it('returns high risk for large amounts', () => {
    expect(assessRisk(makeTransaction({ amount: 15000 }))).toBe('high');
  });

  it('returns medium risk for pending transactions', () => {
    expect(assessRisk(makeTransaction({ status: 'pending', amount: 50 }))).toBe('medium');
  });

  it('returns medium risk for amounts >= 1000', () => {
    expect(assessRisk(makeTransaction({ amount: 2000 }))).toBe('medium');
  });

  it('returns low risk for small settled transactions', () => {
    expect(assessRisk(makeTransaction({ amount: 25, status: 'settled' }))).toBe('low');
  });
});

describe('classifyTransaction', () => {
  it('enriches transaction with category and riskLevel', () => {
    const tx = makeTransaction({ amount: 250, status: 'settled' });
    const result = classifyTransaction(tx);
    expect(result.category).toBe('medium');
    expect(result.riskLevel).toBe('low');
    expect(result.id).toBe(tx.id);
  });
});

describe('classifyTransactions', () => {
  it('classifies an array of transactions', () => {
    const txns = [makeTransaction({ amount: 5 }), makeTransaction({ amount: 5000 })];
    const results = classifyTransactions(txns);
    expect(results[0].category).toBe('micro');
    expect(results[1].category).toBe('large');
  });
});

describe('filterByCategory', () => {
  it('returns only transactions matching the given category', () => {
    const classified = classifyTransactions([
      makeTransaction({ amount: 5 }),
      makeTransaction({ amount: 50 }),
      makeTransaction({ amount: 5000 }),
    ]);
    expect(filterByCategory(classified, 'small')).toHaveLength(1);
    expect(filterByCategory(classified, 'small')[0].amount).toBe(50);
  });
});

describe('filterByRisk', () => {
  it('returns only transactions matching the given risk level', () => {
    const classified = classifyTransactions([
      makeTransaction({ amount: 5, status: 'settled' }),
      makeTransaction({ amount: 5000, status: 'failed' }),
    ]);
    const highRisk = filterByRisk(classified, 'high');
    expect(highRisk).toHaveLength(1);
    expect(highRisk[0].status).toBe('failed');
  });
});
