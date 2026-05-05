/**
 * Core transaction types for ledger reconciliation.
 */

export type TransactionStatus = 'pending' | 'settled' | 'failed' | 'refunded';

export interface Transaction {
  /** Unique identifier within the source system */
  id: string;
  /** ISO 8601 timestamp of when the transaction occurred */
  timestamp: string;
  /** Amount in the smallest currency unit (e.g. cents) */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Human-readable description or reference */
  description?: string;
  /** Current status of the transaction */
  status: TransactionStatus;
  /** Arbitrary metadata from the source system */
  metadata?: Record<string, unknown>;
}

export interface ProviderTransaction extends Transaction {
  /** Identifier assigned by the external payment provider */
  providerRef: string;
}

export interface InternalTransaction extends Transaction {
  /** Identifier stored in the internal database */
  internalRef: string;
}

export type ReconciliationMatchType =
  | 'matched'
  | 'missing_in_provider'
  | 'missing_in_internal'
  | 'amount_mismatch'
  | 'status_mismatch';

export interface ReconciliationResult {
  matchType: ReconciliationMatchType;
  providerTransaction?: ProviderTransaction;
  internalTransaction?: InternalTransaction;
  /** Human-readable explanation of the discrepancy, if any */
  discrepancy?: string;
}
