# Transaction Filters

This module provides utilities for filtering collections of `Transaction` objects based on various criteria.

## Usage

```typescript
import { filterTransactions } from './filters';

const settled = filterTransactions(transactions, { status: 'settled' });

const recent = filterTransactions(transactions, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  currency: 'USD',
});
```

## API

### `filterTransactions(transactions, options)`

Applies all provided filter options in a single pass.

| Option      | Type                              | Description                          |
|-------------|-----------------------------------|--------------------------------------|
| `status`    | `'settled' \| 'pending' \| 'failed'` | Filter by transaction status       |
| `minAmount` | `number`                          | Minimum transaction amount (inclusive) |
| `maxAmount` | `number`                          | Maximum transaction amount (inclusive) |
| `currency`  | `string`                          | ISO 4217 currency code (e.g. `USD`) |
| `startDate` | `Date`                            | Earliest transaction date (inclusive) |
| `endDate`   | `Date`                            | Latest transaction date (inclusive)  |
| `provider`  | `string`                          | Payment provider name                |

> **Note:** If both `minAmount` and `maxAmount` are provided, `minAmount` must be less than or equal to `maxAmount`, otherwise an error is thrown. Similarly, `startDate` must not be after `endDate`.

### Individual Helpers

- `filterByStatus(transactions, status)` — filter by status only
- `filterByAmountRange(transactions, min?, max?)` — filter by amount bounds
- `filterByDateRange(transactions, startDate?, endDate?)` — filter by date range
- `filterByCurrency(transactions, currency)` — filter by ISO 4217 currency code
- `filterByProvider(transactions, provider)` — filter by payment provider name
