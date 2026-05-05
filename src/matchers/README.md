# Transaction Matcher

The `transactionMatcher` module provides fuzzy and exact matching between provider-sourced transactions and internal database records.

## Usage

```typescript
import { matchTransactions } from './matchers';

const result = matchTransactions(providerTransactions, internalTransactions, {
  amountTolerance: 0.01,       // allow ±$0.01 difference
  dateTolerance: 86400000,     // allow ±1 day difference (ms)
  matchByReference: true,      // require reference to match when present
});

console.log(result.matched);           // successfully paired transactions
console.log(result.unmatchedProvider); // provider txns with no internal match
console.log(result.unmatchedInternal); // internal txns with no provider match
```

## MatchOptions

| Option | Type | Default | Description |
|---|---|---|---|
| `amountTolerance` | `number` | `0` | Maximum allowed difference in transaction amounts |
| `dateTolerance` | `number` | `0` | Maximum allowed difference in transaction dates (ms) |
| `matchByReference` | `boolean` | `true` | When both records have a reference, they must match |

## MatchResult

```typescript
interface MatchResult {
  matched: Array<{ provider: Transaction; internal: Transaction }>;
  unmatchedProvider: Transaction[];
  unmatchedInternal: Transaction[];
}
```

## Notes

- Each internal transaction is only matched once (no double-matching).
- Currency must always match exactly regardless of tolerances.
- Reference matching is skipped if either record lacks a reference.
