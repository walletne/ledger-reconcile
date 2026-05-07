import { Transaction } from '../types/transaction';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTransaction(transaction: Partial<Transaction>): ValidationResult {
  const errors: string[] = [];

  if (!transaction.id || typeof transaction.id !== 'string' || transaction.id.trim() === '') {
    errors.push('Transaction id is required and must be a non-empty string');
  }

  if (transaction.amount === undefined || transaction.amount === null) {
    errors.push('Transaction amount is required');
  } else if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
    errors.push('Transaction amount must be a valid number');
  } else if (transaction.amount < 0) {
    errors.push('Transaction amount must be non-negative');
  }

  if (!transaction.currency || typeof transaction.currency !== 'string') {
    errors.push('Transaction currency is required and must be a string');
  } else if (!/^[A-Z]{3}$/.test(transaction.currency)) {
    errors.push('Transaction currency must be a valid 3-letter ISO 4217 code (e.g. USD, EUR)');
  }

  if (!transaction.date) {
    errors.push('Transaction date is required');
  } else {
    const parsed = new Date(transaction.date);
    if (isNaN(parsed.getTime())) {
      errors.push('Transaction date must be a valid date');
    }
  }

  if (!transaction.status) {
    errors.push('Transaction status is required');
  } else if (!['settled', 'pending', 'failed'].includes(transaction.status)) {
    errors.push('Transaction status must be one of: settled, pending, failed');
  }

  return { valid: errors.length === 0, errors };
}

export function validateTransactions(transactions: Partial<Transaction>[]): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();
  transactions.forEach((txn, index) => {
    const key = txn.id ?? `index:${index}`;
    results.set(key, validateTransaction(txn));
  });
  return results;
}

export function filterValidTransactions(transactions: Partial<Transaction>[]): Transaction[] {
  return transactions.filter((txn) => validateTransaction(txn).valid) as Transaction[];
}
