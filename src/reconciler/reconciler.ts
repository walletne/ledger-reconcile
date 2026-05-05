import { NormalizedTransaction } from '../types/transaction';
import { matchTransactions } from '../matchers';

export type ReconciliationStatus = 'matched' | 'unmatched_provider' | 'unmatched_internal';

export interface ReconciliationResult {
  status: ReconciliationStatus;
  providerTransaction?: NormalizedTransaction;
  internalTransaction?: NormalizedTransaction;
  discrepancies?: Discrepancy[];
}

export interface Discrepancy {
  field: keyof NormalizedTransaction;
  providerValue: unknown;
  internalValue: unknown;
}

export interface ReconciliationSummary {
  total: number;
  matched: number;
  unmatchedProvider: number;
  unmatchedInternal: number;
  results: ReconciliationResult[];
}

function findDiscrepancies(
  provider: NormalizedTransaction,
  internal: NormalizedTransaction
): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];
  const fields: (keyof NormalizedTransaction)[] = ['amount', 'currency', 'status', 'description'];

  for (const field of fields) {
    if (provider[field] !== internal[field]) {
      discrepancies.push({
        field,
        providerValue: provider[field],
        internalValue: internal[field],
      });
    }
  }

  return discrepancies;
}

export function reconcile(
  providerTransactions: NormalizedTransaction[],
  internalTransactions: NormalizedTransaction[]
): ReconciliationSummary {
  const results: ReconciliationResult[] = [];
  const matchedInternalIds = new Set<string>();

  for (const provider of providerTransactions) {
    const match = matchTransactions([provider], internalTransactions).find(
      (m) => m.providerTx.id === provider.id
    );

    if (match) {
      matchedInternalIds.add(match.internalTx.id);
      const discrepancies = findDiscrepancies(match.providerTx, match.internalTx);
      results.push({
        status: 'matched',
        providerTransaction: match.providerTx,
        internalTransaction: match.internalTx,
        discrepancies,
      });
    } else {
      results.push({
        status: 'unmatched_provider',
        providerTransaction: provider,
      });
    }
  }

  for (const internal of internalTransactions) {
    if (!matchedInternalIds.has(internal.id)) {
      results.push({
        status: 'unmatched_internal',
        internalTransaction: internal,
      });
    }
  }

  return {
    total: results.length,
    matched: results.filter((r) => r.status === 'matched').length,
    unmatchedProvider: results.filter((r) => r.status === 'unmatched_provider').length,
    unmatchedInternal: results.filter((r) => r.status === 'unmatched_internal').length,
    results,
  };
}
