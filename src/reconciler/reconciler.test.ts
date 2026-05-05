import { reconcile } from './reconciler';
import { NormalizedTransaction } from '../types/transaction';

const makeTransaction = (overrides: Partial<NormalizedTransaction>): NormalizedTransaction => ({
  id: 'txn-001',
  externalId: 'ext-001',
  amount: 5000,
  currency: 'USD',
  status: 'settled',
  description: 'Test payment',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  ...overrides,
});

describe('reconcile', () => {
  it('returns a matched result when transactions align', () => {
    const provider = makeTransaction({ id: 'txn-001', externalId: 'ext-001' });
    const internal = makeTransaction({ id: 'txn-001', externalId: 'ext-001' });

    const summary = reconcile([provider], [internal]);

    expect(summary.matched).toBe(1);
    expect(summary.unmatchedProvider).toBe(0);
    expect(summary.unmatchedInternal).toBe(0);
    expect(summary.results[0].status).toBe('matched');
    expect(summary.results[0].discrepancies).toHaveLength(0);
  });

  it('detects discrepancies in matched transactions', () => {
    const provider = makeTransaction({ id: 'txn-002', externalId: 'ext-002', amount: 5000 });
    const internal = makeTransaction({ id: 'txn-002', externalId: 'ext-002', amount: 4999 });

    const summary = reconcile([provider], [internal]);

    expect(summary.matched).toBe(1);
    const discrepancies = summary.results[0].discrepancies ?? [];
    expect(discrepancies).toHaveLength(1);
    expect(discrepancies[0].field).toBe('amount');
    expect(discrepancies[0].providerValue).toBe(5000);
    expect(discrepancies[0].internalValue).toBe(4999);
  });

  it('marks provider transaction as unmatched when no internal match exists', () => {
    const provider = makeTransaction({ id: 'txn-003', externalId: 'ext-003' });

    const summary = reconcile([provider], []);

    expect(summary.unmatchedProvider).toBe(1);
    expect(summary.matched).toBe(0);
    expect(summary.results[0].status).toBe('unmatched_provider');
  });

  it('marks internal transaction as unmatched when no provider match exists', () => {
    const internal = makeTransaction({ id: 'txn-004', externalId: 'ext-004' });

    const summary = reconcile([], [internal]);

    expect(summary.unmatchedInternal).toBe(1);
    expect(summary.matched).toBe(0);
    expect(summary.results[0].status).toBe('unmatched_internal');
  });

  it('handles mixed results correctly', () => {
    const provider1 = makeTransaction({ id: 'txn-005', externalId: 'ext-005' });
    const provider2 = makeTransaction({ id: 'txn-006', externalId: 'ext-006' });
    const internal1 = makeTransaction({ id: 'txn-005', externalId: 'ext-005' });
    const internal2 = makeTransaction({ id: 'txn-007', externalId: 'ext-007' });

    const summary = reconcile([provider1, provider2], [internal1, internal2]);

    expect(summary.total).toBe(4);
    expect(summary.matched).toBe(1);
    expect(summary.unmatchedProvider).toBe(1);
    expect(summary.unmatchedInternal).toBe(1);
  });
});
