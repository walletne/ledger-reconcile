import { matchTransactions } from './transactionMatcher';
import { Transaction } from '../types/transaction';

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'txn-1',
  amount: 100.0,
  currency: 'USD',
  date: '2024-01-15',
  reference: 'REF-001',
  description: 'Test transaction',
  status: 'settled',
  ...overrides,
});

describe('matchTransactions', () => {
  it('matches transactions with identical reference, amount, currency, and date', () => {
    const provider = [makeTransaction({ id: 'p-1' })];
    const internal = [makeTransaction({ id: 'i-1' })];

    const result = matchTransactions(provider, internal);

    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].provider.id).toBe('p-1');
    expect(result.matched[0].internal.id).toBe('i-1');
    expect(result.unmatchedProvider).toHaveLength(0);
    expect(result.unmatchedInternal).toHaveLength(0);
  });

  it('returns unmatched provider transaction when no internal match found', () => {
    const provider = [makeTransaction({ id: 'p-1', reference: 'REF-999' })];
    const internal = [makeTransaction({ id: 'i-1', reference: 'REF-001' })];

    const result = matchTransactions(provider, internal);

    expect(result.matched).toHaveLength(0);
    expect(result.unmatchedProvider).toHaveLength(1);
    expect(result.unmatchedInternal).toHaveLength(1);
  });

  it('does not match transactions with different currencies', () => {
    const provider = [makeTransaction({ id: 'p-1', currency: 'EUR' })];
    const internal = [makeTransaction({ id: 'i-1', currency: 'USD' })];

    const result = matchTransactions(provider, internal);

    expect(result.matched).toHaveLength(0);
  });

  it('matches within amount tolerance', () => {
    const provider = [makeTransaction({ id: 'p-1', amount: 100.01, reference: undefined })];
    const internal = [makeTransaction({ id: 'i-1', amount: 100.00, reference: undefined })];

    const result = matchTransactions(provider, internal, {
      amountTolerance: 0.05,
      matchByReference: false,
    });

    expect(result.matched).toHaveLength(1);
  });

  it('matches within date tolerance', () => {
    const provider = [makeTransaction({ id: 'p-1', date: '2024-01-15', reference: undefined })];
    const internal = [makeTransaction({ id: 'i-1', date: '2024-01-16', reference: undefined })];
    const oneDayMs = 24 * 60 * 60 * 1000;

    const result = matchTransactions(provider, internal, {
      dateTolerance: oneDayMs,
      matchByReference: false,
    });

    expect(result.matched).toHaveLength(1);
  });

  it('does not reuse an internal transaction for multiple provider matches', () => {
    const provider = [
      makeTransaction({ id: 'p-1', reference: 'REF-001' }),
      makeTransaction({ id: 'p-2', reference: 'REF-001' }),
    ];
    const internal = [makeTransaction({ id: 'i-1', reference: 'REF-001' })];

    const result = matchTransactions(provider, internal);

    expect(result.matched).toHaveLength(1);
    expect(result.unmatchedProvider).toHaveLength(1);
  });
});
