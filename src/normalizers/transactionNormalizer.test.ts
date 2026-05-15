import {
  normalizeStringFields,
  normalizeAmountPrecision,
  normalizeDateFormat,
  normalizeTransaction,
  normalizeTransactions,
} from './transactionNormalizer';
import { Transaction } from '../types/transaction';

const base: Transaction = {
  id: '  txn-001  ',
  amount: 19.9999,
  currency: ' usd ',
  status: 'settled',
  date: '2024-03-15T10:00:00.000Z',
  description: '  Coffee  ',
};

describe('normalizeStringFields', () => {
  it('trims and uppercases currency', () => {
    const result = normalizeStringFields(base);
    expect(result.currency).toBe('USD');
  });

  it('trims id', () => {
    const result = normalizeStringFields(base);
    expect(result.id).toBe('txn-001');
  });

  it('trims description', () => {
    const result = normalizeStringFields(base);
    expect(result.description).toBe('Coffee');
  });

  it('handles missing description gracefully', () => {
    const tx = { ...base, description: undefined };
    const result = normalizeStringFields(tx);
    expect(result.description).toBeUndefined();
  });
});

describe('normalizeAmountPrecision', () => {
  it('rounds to 2 decimal places by default', () => {
    const result = normalizeAmountPrecision(base);
    expect(result.amount).toBe(20.00);
  });

  it('rounds to specified decimal places', () => {
    const result = normalizeAmountPrecision({ ...base, amount: 19.9999 }, 3);
    expect(result.amount).toBe(20.000);
  });

  it('does not alter an already-precise amount', () => {
    const result = normalizeAmountPrecision({ ...base, amount: 10.50 });
    expect(result.amount).toBe(10.50);
  });
});

describe('normalizeDateFormat', () => {
  it('converts a valid date string to ISO 8601', () => {
    const result = normalizeDateFormat({ ...base, date: '2024-03-15' });
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('throws on an invalid date', () => {
    expect(() => normalizeDateFormat({ ...base, date: 'not-a-date' })).toThrow(
      /Invalid date/
    );
  });
});

describe('normalizeTransaction', () => {
  it('applies all normalizations by default', () => {
    const result = normalizeTransaction(base);
    expect(result.id).toBe('txn-001');
    expect(result.currency).toBe('USD');
    expect(result.amount).toBe(20.00);
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('skips string normalization when disabled', () => {
    const result = normalizeTransaction(base, { normalizeStrings: false });
    expect(result.currency).toBe(' usd ');
  });

  it('skips date normalization when disabled', () => {
    const result = normalizeTransaction(
      { ...base, date: '2024-03-15' },
      { normalizeDate: false }
    );
    expect(result.date).toBe('2024-03-15');
  });
});

describe('normalizeTransactions', () => {
  it('normalizes an array of transactions', () => {
    const txs: Transaction[] = [base, { ...base, id: '  txn-002  ', amount: 5.555 }];
    const results = normalizeTransactions(txs);
    expect(results[0].id).toBe('txn-001');
    expect(results[1].id).toBe('txn-002');
    expect(results[1].amount).toBe(5.56);
  });

  it('returns an empty array for empty input', () => {
    expect(normalizeTransactions([])).toEqual([]);
  });
});
