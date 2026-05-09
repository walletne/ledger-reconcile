import {
  convertCurrency,
  maskSensitiveFields,
  normalizeAmount,
  transformTransaction,
  transformTransactions,
} from './transactionTransformer';
import { Transaction } from '../types/transaction';

const baseTransaction: Transaction = {
  id: 'txn-1234-abcd',
  amount: 100.5,
  currency: 'EUR',
  status: 'settled',
  date: '2024-01-15',
  description: 'Test payment',
};

const rates = { USD: 1, EUR: 0.92, GBP: 0.79 };

describe('convertCurrency', () => {
  it('returns transaction unchanged if already in target currency', () => {
    const result = convertCurrency(baseTransaction, 'EUR', rates);
    expect(result).toEqual(baseTransaction);
  });

  it('converts EUR to USD correctly', () => {
    const result = convertCurrency(baseTransaction, 'USD', rates);
    expect(result.currency).toBe('USD');
    expect(result.amount).toBeCloseTo(100.5 / 0.92, 2);
  });

  it('converts EUR to GBP correctly', () => {
    const result = convertCurrency(baseTransaction, 'GBP', rates);
    expect(result.currency).toBe('GBP');
    expect(result.amount).toBeCloseTo((100.5 / 0.92) * 0.79, 2);
  });

  it('throws if source currency rate is missing', () => {
    expect(() =>
      convertCurrency({ ...baseTransaction, currency: 'JPY' }, 'USD', rates)
    ).toThrow('Missing exchange rate');
  });

  it('throws if target currency rate is missing', () => {
    expect(() =>
      convertCurrency(baseTransaction, 'JPY', rates)
    ).toThrow('Missing exchange rate');
  });
});

describe('maskSensitiveFields', () => {
  it('masks the transaction id', () => {
    const result = maskSensitiveFields(baseTransaction);
    expect(result.id).toBe('txn-****');
  });

  it('does not modify other fields', () => {
    const result = maskSensitiveFields(baseTransaction);
    expect(result.amount).toBe(baseTransaction.amount);
    expect(result.currency).toBe(baseTransaction.currency);
  });
});

describe('normalizeAmount', () => {
  it('rounds to 2 decimal places by default', () => {
    const result = normalizeAmount({ ...baseTransaction, amount: 10.1234567 });
    expect(result.amount).toBe(10.12);
  });

  it('rounds to specified decimal places', () => {
    const result = normalizeAmount({ ...baseTransaction, amount: 10.1234567 }, 4);
    expect(result.amount).toBe(10.1235);
  });
});

describe('transformTransaction', () => {
  it('applies multiple transformers in sequence', () => {
    const result = transformTransaction(baseTransaction, [
      (t) => normalizeAmount(t),
      (t) => maskSensitiveFields(t),
    ]);
    expect(result.id).toBe('txn-****');
    expect(result.amount).toBe(100.5);
  });
});

describe('transformTransactions', () => {
  it('applies transformers to all transactions', () => {
    const transactions = [baseTransaction, { ...baseTransaction, id: 'txn-5678-efgh' }];
    const results = transformTransactions(transactions, [maskSensitiveFields]);
    expect(results[0].id).toBe('txn-****');
    expect(results[1].id).toBe('txn-****');
  });
});
