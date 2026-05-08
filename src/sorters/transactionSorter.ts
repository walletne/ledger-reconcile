import { Transaction } from '../types/transaction';

export type SortField = 'date' | 'amount' | 'id' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order?: SortOrder;
}

export function sortByDate(transactions: Transaction[], order: SortOrder = 'asc'): Transaction[] {
  return [...transactions].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return order === 'asc' ? diff : -diff;
  });
}

export function sortByAmount(transactions: Transaction[], order: SortOrder = 'asc'): Transaction[] {
  return [...transactions].sort((a, b) => {
    const diff = a.amount - b.amount;
    return order === 'asc' ? diff : -diff;
  });
}

export function sortById(transactions: Transaction[], order: SortOrder = 'asc'): Transaction[] {
  return [...transactions].sort((a, b) => {
    const cmp = a.id.localeCompare(b.id);
    return order === 'asc' ? cmp : -cmp;
  });
}

export function sortByStatus(transactions: Transaction[], order: SortOrder = 'asc'): Transaction[] {
  return [...transactions].sort((a, b) => {
    const cmp = a.status.localeCompare(b.status);
    return order === 'asc' ? cmp : -cmp;
  });
}

export function sortTransactions(
  transactions: Transaction[],
  options: SortOptions
): Transaction[] {
  const { field, order = 'asc' } = options;
  switch (field) {
    case 'date':   return sortByDate(transactions, order);
    case 'amount': return sortByAmount(transactions, order);
    case 'id':     return sortById(transactions, order);
    case 'status': return sortByStatus(transactions, order);
    default:
      throw new Error(`Unknown sort field: ${field}`);
  }
}
