# Transaction Segmenters

The segmenters module splits a list of transactions into labeled **segments** based on user-defined criteria.

## API

### `segmentTransactions(transactions, criteria)`

Segments transactions using an ordered list of `SegmentCriteria`. Each transaction is placed into the **first** segment whose predicate returns `true`. Transactions that match no criteria are placed in an `"unclassified"` segment.

```ts
const segments = segmentTransactions(transactions, [
  { label: 'refunds', predicate: (tx) => tx.amount < 0 },
  { label: 'micro', predicate: (tx) => tx.amount < 10 },
]);
```

### `segmentByValueTier(transactions, lowThreshold?, highThreshold?)`

Built-in helper that segments transactions into `low-value`, `medium-value`, and `high-value` tiers.

| Tier | Condition |
|------|-----------|
| `high-value` | `amount >= highThreshold` (default 1000) |
| `medium-value` | `amount >= lowThreshold` (default 100) |
| `low-value` | `amount < lowThreshold` |

### `segmentByCurrency(transactions)`

Automatically creates one segment per distinct currency found in the transaction list.

## Types

```ts
type Segment = { label: string; transactions: Transaction[] };
type SegmentCriteria = { label: string; predicate: (tx: Transaction) => boolean };
```
