import { Transaction } from '../types/transaction';

export interface FilterOptions {
  status?: 'settled' | 'pending' | 'failed';
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  startDate?: Date;
  endDate?: Date;
  provider?: string;
}

export function filterByStatus(
  transactions: Transaction[],
  status: FilterOptions['status']
): Transaction[] {
  if (!status) return transactions;
  return transactions.filter((t) => t.status === status);
}

export function filterByAmountRange(
  transactions: Transaction[],
  min?: number,
  max?: number
): Transaction[] {
  return transactions.filter((t) => {
    if (min !== undefined && t.amount < min) return false;
    if (max !== undefined && t.amount > max) return false;
    return true;
  });
}

export function filterByDateRange(
  transactions: Transaction[],
  startDate?: Date,
  endDate?: Date
): Transaction[] {
  return transactions.filter((t) => {
    const txDate = new Date(t.date);
    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;
    return true;
  });
}

export function filterTransactions(
  transactions: Transaction[],
  options: FilterOptions
): Transaction[] {
  let result = [...transactions];

  if (options.status) {
    result = filterByStatus(result, options.status);
  }

  if (options.minAmount !== undefined || options.maxAmount !== undefined) {
    result = filterByAmountRange(result, options.minAmount, options.maxAmount);
  }

  if (options.currency) {
    result = result.filter((t) => t.currency === options.currency);
  }

  if (options.startDate || options.endDate) {
    result = filterByDateRange(result, options.startDate, options.endDate);
  }

  if (options.provider) {
    result = result.filter((t) => t.provider === options.provider);
  }

  return result;
}
