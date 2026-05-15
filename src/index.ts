/**
 * ledger-reconcile
 *
 * Lightweight library for reconciling transaction records between
 * payment providers and internal databases.
 *
 * @module ledger-reconcile
 */

// Core types
export * from './types/transaction';

// Reconciliation
export { findDiscrepancies, reconcile } from './reconciler/reconciler';

// Pipeline
export { prepareTransactions, runReconciliationPipeline } from './pipelines/reconciliationPipeline';

// Matchers
export { matchTransactions, isMatch } from './matchers/transactionMatcher';

// Filters
export { filterByStatus, filterByAmountRange, filterByDateRange, filterTransactions } from './filters/transactionFilter';

// Validators
export { validateTransaction, validateTransactions, filterValidTransactions } from './validators/transactionValidator';

// Normalizers
export { normalizeStringFields, normalizeAmountPrecision, normalizeDateFormat, normalizeTransaction, normalizeTransactions } from './normalizers/transactionNormalizer';

// Enrichers
export { enrichWithDateInfo, enrichWithAmountBucket, enrichTransaction, enrichTransactions } from './enrichers/transactionEnricher';

// Transformers
export { convertCurrency, maskSensitiveFields, normalizeAmount, transformTransaction, transformTransactions } from './transformers/transactionTransformer';

// Deduplicators
export { deduplicationKey, deduplicateTransactions, findDuplicateGroups } from './deduplicators/transactionDeduplicator';

// Sorters
export { sortByDate, sortByAmount, sortById, sortByStatus, sortTransactions } from './sorters/transactionSorter';

// Groupers
export { groupByStatus, groupByCurrency, groupByDate, groupBy } from './groupers/transactionGrouper';

// Aggregators
export { aggregateAmounts, aggregateTransactions } from './aggregators/transactionAggregator';

// Partitioners
export * from './partitioners/transactionPartitioner';

// Samplers
export { sampleRandom, sampleSystematic, sampleHead, sampleTransactions } from './samplers/transactionSampler';

// Scorers
export { scoreByStatus, scoreByAmount, scoreByRecency, scoreTransaction, scoreTransactions } from './scorers/transactionScorer';

// Classifiers
export { classifyByAmount, assessRisk, classifyTransaction, classifyTransactions, filterByCategory } from './classifiers/transactionClassifier';

// Segmenters
export { segmentTransactions, segmentByValueTier, segmentByCurrency } from './segmenters/transactionSegmenter';

// Comparators
export * from './comparators/transactionComparator';

// Merger
export { mergeTwo, mergeTransactions, mergeLists } from './merger/transactionMerger';

// Paginators
export { validatePaginationOptions, paginateTransactions, getPage } from './paginators/transactionPaginator';

// Summarizers
export { computeMatchRate, computeTotalDiscrepancyAmount, summarizeReconciliation } from './summarizers/reconciliationSummarizer';

// Reporters
export { buildReport, renderReport } from './reporters/transactionReporter';

// Formatters
export { formatAsCsv, formatAsSummary, formatReport } from './formatters/reportFormatter';

// Exporters
export { generateFilename, serializeResult, exportReconciliation } from './exporters/reconciliationExporter';

// Snapshots
export { computeChecksum, createSnapshot, diffSnapshots } from './snapshots/transactionSnapshot';
