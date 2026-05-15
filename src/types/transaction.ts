export type TransactionStatus = 'pending' | 'settled' | 'failed' | 'reversed';

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  /** Unique identifier for this transaction */
  id: string;
  /** Transaction amount in minor units or decimal, consistent per provider */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** ISO 8601 date string */
  date: string;
  /** Optional external reference or idempotency key */
  reference?: string;
  /** Human-readable description */
  description?: string;
  /** Current status of the transaction */
  status: TransactionStatus;
  /** Whether this is a debit or credit */
  type?: TransactionType;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

export interface NormalizedTransaction extends Transaction {
  /** Source system that originated this transaction */
  source: string;
  /** Timestamp when this record was ingested */
  ingestedAt: string;
}

export function isSettled(transaction: Transaction): boolean {
  return transaction.status === 'settled';
}

export function isPending(transaction: Transaction): boolean {
  return transaction.status === 'pending';
}

export function isFailed(transaction: Transaction): boolean {
  return transaction.status === 'failed';
}

export function isReversed(transaction: Transaction): boolean {
  return transaction.status === 'reversed';
}

/**
 * Returns true if the transaction is in a terminal state (no further
 * status transitions are expected).
 */
export function isTerminal(transaction: Transaction): boolean {
  return isSettled(transaction) || isFailed(transaction) || isReversed(transaction);
}

export function normalizeTransaction(
  transaction: Transaction,
  source: string
): NormalizedTransaction {
  return {
    ...transaction,
    source,
    ingestedAt: new Date().toISOString(),
  };
}
