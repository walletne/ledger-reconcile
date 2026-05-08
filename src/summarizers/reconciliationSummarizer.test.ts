import {
  computeMatchRate,
  computeTotalDiscrepancyAmount,
  summarizeReconciliation,
} from './reconciliationSummarizer';
import { ReconciliationResult } from '../reconciler/reconciler';

const makeResult = (overrides: Partial<ReconciliationResult> = {}): ReconciliationResult => ({
  matched: [],
  unmatchedSource: [],
  unmatchedTarget: [],
  discrepancies: [],
  ...overrides,
});

describe('computeMatchRate', () => {
  it('returns 0 when total is 0', () => {
    expect(computeMatchRate(0, 0)).toBe(0);
  });

  it('returns 100 when all matched', () => {
    expect(computeMatchRate(10, 10)).toBe(100);
  });

  it('returns correct percentage', () => {
    expect(computeMatchRate(3, 4)).toBe(75);
  });
});

describe('computeTotalDiscrepancyAmount', () => {
  it('returns 0 when no discrepancies', () => {
    const result = makeResult();
    expect(computeTotalDiscrepancyAmount(result)).toBe(0);
  });

  it('sums absolute differences across discrepancies', () => {
    const result = makeResult({
      discrepancies: [
        { id: 'tx1', sourceAmount: 100, targetAmount: 90 } as any,
        { id: 'tx2', sourceAmount: 50, targetAmount: 60 } as any,
      ],
    });
    expect(computeTotalDiscrepancyAmount(result)).toBe(20);
  });
});

describe('summarizeReconciliation', () => {
  it('produces correct summary for empty result', () => {
    const summary = summarizeReconciliation(makeResult());
    expect(summary.matchedCount).toBe(0);
    expect(summary.matchRate).toBe(0);
    expect(summary.totalDiscrepancyAmount).toBe(0);
    expect(summary.generatedAt).toBeDefined();
  });

  it('produces correct counts with mixed data', () => {
    const result = makeResult({
      matched: [{ id: 'tx1' } as any, { id: 'tx2' } as any],
      unmatchedSource: [{ id: 'tx3' } as any],
      unmatchedTarget: [{ id: 'tx4' } as any, { id: 'tx5' } as any],
      discrepancies: [{ id: 'tx6', sourceAmount: 200, targetAmount: 180 } as any],
    });
    const summary = summarizeReconciliation(result);
    expect(summary.matchedCount).toBe(2);
    expect(summary.unmatchedSourceCount).toBe(1);
    expect(summary.unmatchedTargetCount).toBe(2);
    expect(summary.discrepancyCount).toBe(1);
    expect(summary.totalSourceTransactions).toBe(4);
    expect(summary.totalTargetTransactions).toBe(5);
    expect(summary.matchRate).toBe(50);
    expect(summary.totalDiscrepancyAmount).toBe(20);
  });
});
