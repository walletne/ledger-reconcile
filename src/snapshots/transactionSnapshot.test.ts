import { createSnapshot, computeChecksum, diffSnapshots } from './transactionSnapshot';
import { Transaction } from '../types/transaction';

const base: Transaction = {
  id: 'tx-1',
  amount: 100,
  currency: 'USD',
  status: 'settled',
  date: '2024-01-15',
  description: 'Payment A',
};

const tx2: Transaction = {
  id: 'tx-2',
  amount: 250,
  currency: 'EUR',
  status: 'pending',
  date: '2024-01-16',
  description: 'Payment B',
};

describe('computeChecksum', () => {
  it('returns a non-empty hex string', () => {
    const checksum = computeChecksum([base]);
    expect(checksum).toMatch(/^[0-9a-f]{8}$/);
  });

  it('returns the same checksum for the same transactions regardless of order', () => {
    const a = computeChecksum([base, tx2]);
    const b = computeChecksum([tx2, base]);
    expect(a).toBe(b);
  });

  it('returns different checksums when transactions differ', () => {
    const modified = { ...base, amount: 999 };
    expect(computeChecksum([base])).not.toBe(computeChecksum([modified]));
  });

  it('returns a stable value for an empty list', () => {
    expect(computeChecksum([])).toBe(computeChecksum([]));
  });
});

describe('createSnapshot', () => {
  it('creates a snapshot with correct count and checksum', () => {
    const snap = createSnapshot([base, tx2], 'snap-1');
    expect(snap.id).toBe('snap-1');
    expect(snap.count).toBe(2);
    expect(snap.checksum).toBe(computeChecksum([base, tx2]));
    expect(snap.transactions).toHaveLength(2);
  });

  it('sets capturedAt to a valid ISO date string', () => {
    const snap = createSnapshot([base]);
    expect(() => new Date(snap.capturedAt)).not.toThrow();
    expect(snap.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('does not mutate the original array', () => {
    const list = [base];
    const snap = createSnapshot(list);
    snap.transactions.push(tx2);
    expect(list).toHaveLength(1);
  });
});

describe('diffSnapshots', () => {
  it('detects added transactions', () => {
    const before = createSnapshot([base], 'a');
    const after = createSnapshot([base, tx2], 'b');
    const diff = diffSnapshots(before, after);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].id).toBe('tx-2');
    expect(diff.removed).toHaveLength(0);
  });

  it('detects removed transactions', () => {
    const before = createSnapshot([base, tx2], 'a');
    const after = createSnapshot([base], 'b');
    const diff = diffSnapshots(before, after);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].id).toBe('tx-2');
  });

  it('detects modified transactions', () => {
    const updated = { ...base, amount: 200 };
    const before = createSnapshot([base], 'a');
    const after = createSnapshot([updated], 'b');
    const diff = diffSnapshots(before, after);
    expect(diff.modified).toHaveLength(1);
    expect(diff.unchanged).toHaveLength(0);
  });

  it('places unchanged transactions correctly', () => {
    const before = createSnapshot([base, tx2], 'a');
    const after = createSnapshot([base, tx2], 'b');
    const diff = diffSnapshots(before, after);
    expect(diff.unchanged).toHaveLength(2);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
  });
});
