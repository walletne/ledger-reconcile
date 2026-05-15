import { Transaction } from '../types/transaction';

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function validatePaginationOptions(options: PaginationOptions): void {
  if (options.page < 1) {
    throw new RangeError(`page must be >= 1, got ${options.page}`);
  }
  if (options.pageSize < 1) {
    throw new RangeError(`pageSize must be >= 1, got ${options.pageSize}`);
  }
}

export function paginateTransactions(
  transactions: Transaction[],
  options: PaginationOptions
): PaginatedResult<Transaction> {
  validatePaginationOptions(options);

  const { page, pageSize } = options;
  const totalItems = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: transactions.slice(startIndex, endIndex),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

export function getPage<T>(
  items: T[],
  options: PaginationOptions
): PaginatedResult<T> {
  validatePaginationOptions(options);

  const { page, pageSize } = options;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return {
    data: items.slice(startIndex, startIndex + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}
