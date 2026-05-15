import { Transaction } from '../types/transaction';

export interface Snapshot {
  id: string;
  capturedAt: string;
  transactions: Transaction[];
  count: number;
  checksum: string;
}

export interface SnapshotDiff {
  added: Transaction[];
  removed: Transaction[];
  modified: Transaction[];
  unchanged: Transaction[];
}

/** Compute a simple checksum from transaction ids and amounts */
export function computeChecksum(transactions: Transaction[]): string {
  const raw = transactions
    .map((t) => `${t.id}:${t.amount}:${t.status}`)
    .sort()
    .join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/** Create a snapshot from a list of transactions */
export function createSnapshot(
  transactions: Transaction[],
  id: string = crypto.randomUUID()
): Snapshot {
  return {
    id,
    capturedAt: new Date().toISOString(),
    transactions: [...transactions],
    count: transactions.length,
    checksum: computeChecksum(transactions),
  };
}

/** Diff two snapshots to find what changed between them */
export function diffSnapshots(before: Snapshot, after: Snapshot): SnapshotDiff {
  const beforeMap = new Map(before.transactions.map((t) => [t.id, t]));
  const afterMap = new Map(after.transactions.map((t) => [t.id, t]));

  const added: Transaction[] = [];
  const removed: Transaction[] = [];
  const modified: Transaction[] = [];
  const unchanged: Transaction[] = [];

  for (const [id, tx] of afterMap) {
    if (!beforeMap.has(id)) {
      added.push(tx);
    } else {
      const prev = beforeMap.get(id)!;
      if (prev.amount !== tx.amount || prev.status !== tx.status || prev.currency !== tx.currency) {
        modified.push(tx);
      } else {
        unchanged.push(tx);
      }
    }
  }

  for (const [id, tx] of beforeMap) {
    if (!afterMap.has(id)) {
      removed.push(tx);
    }
  }

  return { added, removed, modified, unchanged };
}
