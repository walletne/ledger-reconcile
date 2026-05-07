import {
  validateTransaction,
  validateTransactions,
  filterValidTransactions,
} from './transactionValidator';
import { Transaction } from '../types/transaction';

const validTransaction: Transaction = {
  id: 'txn_001',
  amount: 150.0,
  currency: 'USD',
  date: '2024-03-15T10:00:00Z',
  status: 'settled',
};

describe('validateTransaction', () => {
  it('should return valid for a correct transaction', () => {
    const result = validateTransaction(validTransaction);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when id is missing', () => {
    const result = validateTransaction({ ...validTransaction, id: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Transaction id is required and must be a non-empty string');
  });

  it('should fail when amount is negative', () => {
    const result = validateTransaction({ ...validTransaction, amount: -10 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Transaction amount must be non-negative');
  });

  it('should fail when amount is NaN', () => {
    const result = validateTransaction({ ...validTransaction, amount: NaN });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Transaction amount must be a valid number');
  });

  it('should fail for invalid currency code', () => {
    const result = validateTransaction({ ...validTransaction, currency: 'us' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Transaction currency must be a valid 3-letter ISO 4217 code (e.g. USD, EUR)'
    );
  });

  it('should fail for invalid date', () => {
    const result = validateTransaction({ ...validTransaction, date: 'not-a-date' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Transaction date must be a valid date');
  });

  it('should fail for invalid status', () => {
    const result = validateTransaction({ ...validTransaction, status: 'unknown' as any });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Transaction status must be one of: settled, pending, failed'
    );
  });

  it('should accumulate multiple errors', () => {
    const result = validateTransaction({ amount: -5, currency: 'XX' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('validateTransactions', () => {
  it('should return a map with results for each transaction', () => {
    const txns = [validTransaction, { ...validTransaction, id: 'txn_002', amount: -1 }];
    const results = validateTransactions(txns);
    expect(results.get('txn_001')?.valid).toBe(true);
    expect(results.get('txn_002')?.valid).toBe(false);
  });

  it('should use index as key when id is missing', () => {
    const results = validateTransactions([{ amount: 100 }]);
    expect(results.has('index:0')).toBe(true);
  });
});

describe('filterValidTransactions', () => {
  it('should return only valid transactions', () => {
    const txns = [validTransaction, { id: '', amount: -1 }];
    const valid = filterValidTransactions(txns);
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe('txn_001');
  });
});
