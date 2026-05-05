import { Transaction } from '../types/transaction';

export interface MatchResult {
  matched: Array<{ provider: Transaction; internal: Transaction }>;
  unmatchedProvider: Transaction[];
  unmatchedInternal: Transaction[];
}

export interface MatchOptions {
  amountTolerance?: number;
  dateTolerance?: number; // in milliseconds
  matchByReference?: boolean;
}

const DEFAULT_OPTIONS: MatchOptions = {
  amountTolerance: 0,
  dateTolerance: 0,
  matchByReference: true,
};

export function matchTransactions(
  providerTransactions: Transaction[],
  internalTransactions: Transaction[],
  options: MatchOptions = {}
): MatchResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const matched: MatchResult['matched'] = [];
  const usedInternal = new Set<string>();

  for (const provider of providerTransactions) {
    const match = internalTransactions.find((internal) => {
      if (usedInternal.has(internal.id)) return false;
      return isMatch(provider, internal, opts);
    });

    if (match) {
      matched.push({ provider, internal: match });
      usedInternal.add(match.id);
    }
  }

  const matchedProviderIds = new Set(matched.map((m) => m.provider.id));

  return {
    matched,
    unmatchedProvider: providerTransactions.filter((t) => !matchedProviderIds.has(t.id)),
    unmatchedInternal: internalTransactions.filter((t) => !usedInternal.has(t.id)),
  };
}

function isMatch(a: Transaction, b: Transaction, opts: MatchOptions): boolean {
  if (opts.matchByReference && a.reference && b.reference) {
    if (a.reference !== b.reference) return false;
  }

  const amountDiff = Math.abs(a.amount - b.amount);
  if (amountDiff > (opts.amountTolerance ?? 0)) return false;

  if (a.currency !== b.currency) return false;

  const dateDiff = Math.abs(
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  if (dateDiff > (opts.dateTolerance ?? 0)) return false;

  return true;
}
