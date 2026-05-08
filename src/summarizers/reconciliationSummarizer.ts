import { ReconciliationResult } from '../reconciler/reconciler';

export interface ReconciliationSummary {
  totalSourceTransactions: number;
  totalTargetTransactions: number;
  matchedCount: number;
  unmatchedSourceCount: number;
  unmatchedTargetCount: number;
  discrepancyCount: number;
  matchRate: number;
  totalDiscrepancyAmount: number;
  generatedAt: string;
}

export function computeMatchRate(
  matched: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((matched / total) * 10000) / 100;
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
  const matchedCount = result.matched.length;
  const unmatchedSourceCount = result.unmatchedSource.length;
  const unmatchedTargetCount = result.unmatchedTarget.length;
  const discrepancyCount = result.discrepancies.length;
  const totalSourceTransactions = matchedCount + unmatchedSourceCount + discrepancyCount;
  const totalTargetTransactions = matchedCount + unmatchedTargetCount + discrepancyCount;
  const matchRate = computeMatchRate(matchedCount, totalSourceTransactions);
  const totalDiscrepancyAmount = computeTotalDiscrepancyAmount(result);

  return {
    totalSourceTransactions,
    totalTargetTransactions,
    matchedCount,
    unmatchedSourceCount,
    unmatchedTargetCount,
    discrepancyCount,
    matchRate,
    totalDiscrepancyAmount,
    generatedAt: new Date().toISOString(),
  };
}
