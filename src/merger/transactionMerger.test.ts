import { mergeTwo, mergeTransactions, mergeLists } from './transactionMerger';
import { NormalizedTransaction } from '../types/transaction';

const base: NormalizedTransaction = {
  id: 'tx-1',
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: '2024-01-15',
  description: 'Payment A',
};

const updated: NormalizedTransaction = {
  id: 'tx-1',
  amount: 105,
  currency: 'USD',
  status: 'settled',
  date: '2024-01-15',
  description: 'Payment A (revised)',
};

describe('mergeTwo', () => {
  it('prefers left by default', () => {
    const result = mergeTwo(base, updated);
    expect(result.amount).toBe(100);
    expect(result.description).toBe('Payment A');
  });

  it('prefers right when specified', () => {
    const result = mergeTwo(base, updated, { preferSource: 'right' });
    expect(result.amount).toBe(105);
    expect(result.description).toBe('Payment A (revised)');
  });

  it('overrides specific fields from preferred source', () => {
    const result = mergeTwo(base, updated, { preferSource: 'left', fields: ['amount'] });
    expect(result.amount).toBe(100);
  });
});

describe('mergeTransactions', () => {
  it('deduplicates by id, keeping first occurrence as base', () => {
    const result = mergeTransactions([base, updated]);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(100);
  });

  it('keeps distinct ids', () => {
    const other: NormalizedTransaction = { ...base, id: 'tx-2', amount: 200 };
    const result = mergeTransactions([base, other]);
    expect(result).toHaveLength(2);
  });

  it('applies strategy when merging duplicates', () => {
    const result = mergeTransactions([base, updated], { preferSource: 'right' });
    expect(result[0].amount).toBe(105);
  });
});

describe('mergeLists', () => {
  it('combines two lists and deduplicates', () => {
    const primary = [base];
    const secondary = [updated, { ...base, id: 'tx-3', amount: 300 }];
    const result = mergeLists(primary, secondary);
    expect(result).toHaveLength(2);
  });

  it('primary takes precedence by default', () => {
    const result = mergeLists([base], [updated]);
    expect(result[0].amount).toBe(100);
  });

  it('secondary takes precedence when strategy says right', () => {
    const result = mergeLists([base], [updated], { preferSource: 'right' });
    expect(result[0].amount).toBe(105);
  });
});
