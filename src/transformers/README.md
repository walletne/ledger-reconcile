# Transaction Transformers

This module provides utilities for transforming transaction records before reconciliation, export, or display.

## Functions

### `convertCurrency(transaction, targetCurrency, rates)`

Converts a transaction's amount from its original currency to a target currency using a map of exchange rates relative to a base currency (e.g., USD = 1).

```ts
const rates = { USD: 1, EUR: 0.92, GBP: 0.79 };
const converted = convertCurrency(transaction, 'USD', rates);
```

Throws an error if either the source or target currency is missing from the rates map.

### `maskSensitiveFields(transaction)`

Masks the transaction `id` to retain only the first 4 characters, suitable for safe logging or anonymized exports.

### `normalizeAmount(transaction, decimals?)`

Rounds the transaction amount to a fixed number of decimal places (default: 2).

### `transformTransaction(transaction, transformers)`

Applies an ordered array of transformer functions to a single transaction, returning the final result.

### `transformTransactions(transactions, transformers)`

Applies the same transformer pipeline to every transaction in an array.

## Usage

```ts
import { transformTransactions, normalizeAmount, maskSensitiveFields } from './transformers';

const cleaned = transformTransactions(raw, [
  normalizeAmount,
  maskSensitiveFields,
]);
```
