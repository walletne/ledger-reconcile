import { ReconciliationResult } from '../reconciler/reconciler';
import { groupByStatus } from '../groupers/transactionGrouper';

export interface ReconciliationSummary {
  totalSource: number;
  totalTarget: number;
  matched: number;
  matchRate: number;
  discrepancies: number;
  totalDiscrepancyAmount: number;
  sourceByStatus: Record<string, number>;
  targetByStatus: Record<string, number>;
}

export function computeMatchRate(matched: number, total: number): number {
  if (total === 0) return 0;
  return parseFloat(((matched / total) * 100).toFixed(2));
}

export function computeTotalDiscrepancyAmount(
  result: ReconciliationResult
): number {
  return result.discrepancies.reduce((sum, d) => {
    const diff = Math.abs((d.sourceAmount ?? 0) - (d.targetAmount ?? 0));
    return sum + diff;
  }, 0);
}

export function summarizeReconciliation(
  result: ReconciliationResult
): ReconciliationSummary {
  const matched = result.matched.length;
  const total = Math.max(result.sourceTransactions.length, result.targetTransactions.length);

  const sourceGroups = groupByStatus(result.sourceTransactions);
  const targetGroups = groupByStatus(result.targetTransactions);

  const countGroups = (groups: Record<string, unknown[]>) =>
    Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length]));

  return {
    totalSource: result.sourceTransactions.length,
    totalTarget: result.targetTransactions.length,
    matched,
    matchRate: computeMatchRate(matched, total),
    discrepancies: result.discrepancies.length,
    totalDiscrepancyAmount: computeTotalDiscrepancyAmount(result),
    sourceByStatus: countGroups(sourceGroups),
    targetByStatus: countGroups(targetGroups),
  };
}
