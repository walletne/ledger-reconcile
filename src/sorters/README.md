# Transaction Sorters

Utilities for sorting arrays of `Transaction` objects by various fields.

## Functions

### `sortByDate(transactions, order?)`
Sorts transactions by their `date` field. Default order is `'asc'`.

### `sortByAmount(transactions, order?)`
Sorts transactions by their `amount` field. Default order is `'asc'`.

### `sortById(transactions, order?)`
Sorts transactions lexicographically by their `id` field.

### `sortByStatus(transactions, order?)`
Sorts transactions lexicographically by their `status` field.

### `sortTransactions(transactions, options)`
General-purpose sort dispatcher. Accepts a `SortOptions` object:

```ts
interface SortOptions {
  field: 'date' | 'amount' | 'id' | 'status';
  order?: 'asc' | 'desc'; // defaults to 'asc'
}
```

## Example

```ts
import { sortTransactions } from './sorters';

const sorted = sortTransactions(transactions, { field: 'amount', order: 'desc' });
```

## Notes
- All sort functions return a **new array** and do not mutate the input.
- `sortTransactions` throws an `Error` if an unrecognised `field` is provided.
