import { Transaction } from '../types/transaction';

export type CompareResult = -1 | 0 | 1;

export type ComparatorFn<T> = (a: T, b: T) => CompareResult;

function sign(n: number): CompareResult {
  if (n < 0) return -1;
  if (n > 0) return 1;
  return 0;
}

export function compareByDate(a: Transaction, b: Transaction): CompareResult {
  return sign(new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function compareByAmount(a: Transaction, b: Transaction): CompareResult {
  return sign(a.amount - b.amount);
}

export function compareById(a: Transaction, b: Transaction): CompareResult {
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

export function compareByStatus(a: Transaction, b: Transaction): CompareResult {
  if (a.status < b.status) return -1;
  if (a.status > b.status) return 1;
  return 0;
}

export function reverseComparator<T>(comparator: ComparatorFn<T>): ComparatorFn<T> {
  return (a, b) => sign(-comparator(a, b)) as CompareResult;
}

export function chainComparators<T>(
  ...comparators: ComparatorFn<T>[]
): ComparatorFn<T> {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

export type ComparatorKey = 'date' | 'amount' | 'id' | 'status';

const COMPARATOR_MAP: Record<ComparatorKey, ComparatorFn<Transaction>> = {
  date: compareByDate,
  amount: compareByAmount,
  id: compareById,
  status: compareByStatus,
};

export function buildComparator(
  keys: ComparatorKey[],
  descending = false
): ComparatorFn<Transaction> {
  if (keys.length === 0) {
    throw new Error('At least one comparator key must be provided');
  }
  const comparators = keys.map((k) => COMPARATOR_MAP[k]);
  const chained = chainComparators(...comparators);
  return descending ? reverseComparator(chained) : chained;
}
