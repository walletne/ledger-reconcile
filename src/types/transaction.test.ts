import type {
  Transaction,
  ProviderTransaction,
  InternalTransaction,
  ReconciliationResult,
  TransactionStatus,
} from './transaction';

describe('Transaction type contracts', () => {
  const validStatuses: TransactionStatus[] = ['pending', 'settled', 'failed', 'refunded'];

  it('should accept all valid TransactionStatus values', () => {
    validStatuses.forEach((status) => {
      const tx: Transaction = {
        id: 'txn_001',
        timestamp: '2024-01-15T10:00:00Z',
        amount: 1000,
        currency: 'USD',
        status,
      };
      expect(tx.status).toBe(status);
    });
  });

  it('should construct a valid ProviderTransaction', () => {
    const tx: ProviderTransaction = {
      id: 'txn_001',
      timestamp: '2024-01-15T10:00:00Z',
      amount: 5000,
      currency: 'EUR',
      status: 'settled',
      providerRef: 'stripe_ch_abc123',
      description: 'Subscription payment',
      metadata: { customerId: 'cus_xyz' },
    };
    expect(tx.providerRef).toBe('stripe_ch_abc123');
    expect(tx.amount).toBe(5000);
  });

  it('should construct a valid InternalTransaction', () => {
    const tx: InternalTransaction = {
      id: 'txn_001',
      timestamp: '2024-01-15T10:00:00Z',
      amount: 5000,
      currency: 'EUR',
      status: 'settled',
      internalRef: 'order_789',
    };
    expect(tx.internalRef).toBe('order_789');
  });

  it('should construct a matched ReconciliationResult', () => {
    const result: ReconciliationResult = {
      matchType: 'matched',
      providerTransaction: {
        id: 'txn_001',
        timestamp: '2024-01-15T10:00:00Z',
        amount: 2500,
        currency: 'GBP',
        status: 'settled',
        providerRef: 'pp_ref_001',
      },
      internalTransaction: {
        id: 'txn_001',
        timestamp: '2024-01-15T10:00:00Z',
        amount: 2500,
        currency: 'GBP',
        status: 'settled',
        internalRef: 'int_ref_001',
      },
    };
    expect(result.matchType).toBe('matched');
    expect(result.discrepancy).toBeUndefined();
  });

  it('should construct a discrepant ReconciliationResult', () => {
    const result: ReconciliationResult = {
      matchType: 'amount_mismatch',
      discrepancy: 'Provider amount 2500 does not match internal amount 2400',
    };
    expect(result.matchType).toBe('amount_mismatch');
    expect(result.discrepancy).toContain('2500');
  });
});
