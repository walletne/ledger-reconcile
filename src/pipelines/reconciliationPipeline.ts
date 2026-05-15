import { normalizeTransaction } from '../types/transaction';
import { filterTransactions } from '../filters/transactionFilter';
import { deduplicateTransactions } from '../deduplicators/transactionDeduplicator';
import { validateTransactions, filterValidTransactions } from '../validators/transactionValidator';
import { enrichTransactions } from '../enrichers/transactionEnricher';
import { normalizeTransactions } from '../normalizers/transactionNormalizer';
import { reconcile } from '../reconciler/reconciler';
import { summarizeReconciliation } from '../summarizers/reconciliationSummarizer';
import type { Transaction } from '../types/transaction';
import type { ReconciliationResult } from '../reconciler/reconciler';
import type { ReconciliationSummary } from '../summarizers/reconciliationSummarizer';
import type { FilterOptions } from '../filters/transactionFilter';

export interface PipelineOptions {
  filter?: FilterOptions;
  skipDeduplication?: boolean;
  skipEnrichment?: boolean;
}

export interface PipelineResult {
  result: ReconciliationResult;
  summary: ReconciliationSummary;
  sourceCount: number;
  providerCount: number;
  invalidCount: number;
  duplicatesRemovedSource: number;
  duplicatesRemovedProvider: number;
}

function prepareTransactions(
  transactions: Transaction[],
  options: PipelineOptions
): { prepared: Transaction[]; duplicatesRemoved: number; invalidCount: number } {
  const normalized = normalizeTransactions(transactions);
  const validated = validateTransactions(normalized);
  const valid = filterValidTransactions(validated);
  const invalidCount = normalized.length - valid.length;

  let prepared = valid;
  let duplicatesRemoved = 0;

  if (!options.skipDeduplication) {
    const deduped = deduplicateTransactions(prepared);
    duplicatesRemoved = prepared.length - deduped.length;
    prepared = deduped;
  }

  if (options.filter) {
    prepared = filterTransactions(prepared, options.filter);
  }

  if (!options.skipEnrichment) {
    prepared = enrichTransactions(prepared);
  }

  return { prepared, duplicatesRemoved, invalidCount };
}

export function runReconciliationPipeline(
  sourceTransactions: Transaction[],
  providerTransactions: Transaction[],
  options: PipelineOptions = {}
): PipelineResult {
  const {
    prepared: preparedSource,
    duplicatesRemoved: duplicatesRemovedSource,
    invalidCount: invalidSource,
  } = prepareTransactions(sourceTransactions, options);

  const {
    prepared: preparedProvider,
    duplicatesRemoved: duplicatesRemovedProvider,
    invalidCount: invalidProvider,
  } = prepareTransactions(providerTransactions, options);

  const result = reconcile(preparedSource, preparedProvider);
  const summary = summarizeReconciliation(result);

  return {
    result,
    summary,
    sourceCount: preparedSource.length,
    providerCount: preparedProvider.length,
    invalidCount: invalidSource + invalidProvider,
    duplicatesRemovedSource,
    duplicatesRemovedProvider,
  };
}
