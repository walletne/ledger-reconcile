import { runReconciliationPipeline } from './reconciliationPipeline';
import type { Transaction } from '../types/transaction';

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'txn-001',
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: '2024-03-15',
  description: 'Test payment',
  ...overrides,
});

describe('runReconciliationPipeline', () => {
  const source: Transaction[] = [
    makeTransaction({ id: 'txn-001', amount: 100 }),
    makeTransaction({ id: 'txn-002', amount: 250, status: 'pending' }),
    makeTransaction({ id: 'txn-003', amount: 75, date: '2024-03-16' }),
  ];

  const provider: Transaction[] = [
    makeTransaction({ id: 'txn-001', amount: 100 }),
    makeTransaction({ id: 'txn-002', amount: 250, status: 'pending' }),
    makeTransaction({ id: 'txn-004', amount: 500, date: '2024-03-17' }),
  ];

  it('returns a pipeline result with all required fields', () => {
    const pipelineResult = runReconciliationPipeline(source, provider);
    expect(pipelineResult).toHaveProperty('result');
    expect(pipelineResult).toHaveProperty('summary');
    expect(pipelineResult).toHaveProperty('sourceCount');
    expect(pipelineResult).toHaveProperty('providerCount');
    expect(pipelineResult).toHaveProperty('invalidCount');
    expect(pipelineResult).toHaveProperty('duplicatesRemovedSource');
    expect(pipelineResult).toHaveProperty('duplicatesRemovedProvider');
  });

  it('reports correct source and provider counts after deduplication', () => {
    const pipelineResult = runReconciliationPipeline(source, provider);
    expect(pipelineResult.sourceCount).toBe(3);
    expect(pipelineResult.providerCount).toBe(3);
  });

  it('removes duplicate transactions when skipDeduplication is false', () => {
    const withDuplicates: Transaction[] = [
      ...source,
      makeTransaction({ id: 'txn-001', amount: 100 }),
    ];
    const pipelineResult = runReconciliationPipeline(withDuplicates, provider);
    expect(pipelineResult.duplicatesRemovedSource).toBe(1);
    expect(pipelineResult.sourceCount).toBe(3);
  });

  it('skips deduplication when skipDeduplication is true', () => {
    const withDuplicates: Transaction[] = [
      ...source,
      makeTransaction({ id: 'txn-001', amount: 100 }),
    ];
    const pipelineResult = runReconciliationPipeline(withDuplicates, provider, {
      skipDeduplication: true,
    });
    expect(pipelineResult.duplicatesRemovedSource).toBe(0);
    expect(pipelineResult.sourceCount).toBe(4);
  });

  it('applies filter options when provided', () => {
    const pipelineResult = runReconciliationPipeline(source, provider, {
      filter: { status: 'settled' },
    });
    expect(pipelineResult.sourceCount).toBeLessThanOrEqual(source.length);
  });

  it('handles empty transaction arrays gracefully', () => {
    const pipelineResult = runReconciliationPipeline([], []);
    expect(pipelineResult.sourceCount).toBe(0);
    expect(pipelineResult.providerCount).toBe(0);
    expect(pipelineResult.invalidCount).toBe(0);
  });

  it('produces a summary with a matchRate between 0 and 1', () => {
    const pipelineResult = runReconciliationPipeline(source, provider);
    expect(pipelineResult.summary.matchRate).toBeGreaterThanOrEqual(0);
    expect(pipelineResult.summary.matchRate).toBeLessThanOrEqual(1);
  });
});
