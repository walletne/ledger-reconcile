# Transaction Groupers

Utilities for partitioning a flat list of `Transaction` objects into named buckets.

## API

### `groupByStatus(transactions)`
Returns a `TransactionGroup` keyed by transaction status (`settled`, `pending`, `failed`).

### `groupByCurrency(transactions)`
Returns a `TransactionGroup` keyed by currency code (e.g. `USD`, `EUR`).  
Transactions without a `currency` field are placed under the `UNKNOWN` key.

### `groupByDate(transactions)`
Returns a `TransactionGroup` keyed by calendar date (`YYYY-MM-DD`) derived from the transaction's `date` field.

### `groupBy(transactions, keyFn)`
General-purpose grouper. Accepts a caller-supplied `keyFn: (tx: Transaction) => string` so you can partition by any attribute.

## Types

```ts
type GroupKey = string;
type TransactionGroup = Record<GroupKey, Transaction[]>;
```

## Example

```ts
import { groupByStatus, groupByCurrency } from 'ledger-reconcile/groupers';

const byStatus   = groupByStatus(transactions);
const byCurrency = groupByCurrency(transactions);

console.log(byStatus.settled.length);  // number of settled transactions
console.log(byCurrency.USD.length);    // number of USD transactions
```
