import { paginateTransactions, getPage, validatePaginationOptions } from './transactionPaginator';
import { Transaction } from '../types/transaction';

const makeTransaction = (id: string): Transaction => ({
  id,
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: '2024-01-01',
  description: `Transaction ${id}`,
});

const transactions: Transaction[] = Array.from({ length: 25 }, (_, i) =>
  makeTransaction(`tx-${i + 1}`)
);

describe('validatePaginationOptions', () => {
  it('throws when page < 1', () => {
    expect(() => validatePaginationOptions({ page: 0, pageSize: 10 })).toThrow(RangeError);
  });

  it('throws when pageSize < 1', () => {
    expect(() => validatePaginationOptions({ page: 1, pageSize: 0 })).toThrow(RangeError);
  });

  it('does not throw for valid options', () => {
    expect(() => validatePaginationOptions({ page: 1, pageSize: 10 })).not.toThrow();
  });
});

describe('paginateTransactions', () => {
  it('returns the correct slice for page 1', () => {
    const result = paginateTransactions(transactions, { page: 1, pageSize: 10 });
    expect(result.data).toHaveLength(10);
    expect(result.data[0].id).toBe('tx-1');
    expect(result.page).toBe(1);
    expect(result.totalItems).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(false);
  });

  it('returns the correct slice for the last page', () => {
    const result = paginateTransactions(transactions, { page: 3, pageSize: 10 });
    expect(result.data).toHaveLength(5);
    expect(result.data[0].id).toBe('tx-21');
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(true);
  });

  it('clamps page to totalPages when page exceeds total', () => {
    const result = paginateTransactions(transactions, { page: 99, pageSize: 10 });
    expect(result.page).toBe(3);
    expect(result.data).toHaveLength(5);
  });

  it('handles empty transaction list', () => {
    const result = paginateTransactions([], { page: 1, pageSize: 10 });
    expect(result.data).toHaveLength(0);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
  });
});

describe('getPage', () => {
  it('works with generic arrays', () => {
    const items = [1, 2, 3, 4, 5];
    const result = getPage(items, { page: 2, pageSize: 2 });
    expect(result.data).toEqual([3, 4]);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(true);
  });

  it('returns all items when pageSize >= totalItems', () => {
    const items = ['a', 'b', 'c'];
    const result = getPage(items, { page: 1, pageSize: 10 });
    expect(result.data).toEqual(['a', 'b', 'c']);
    expect(result.totalPages).toBe(1);
  });
});
