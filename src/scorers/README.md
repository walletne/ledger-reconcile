# Transaction Scorers

Provides utilities to assign a numeric score to transactions based on multiple dimensions. Scores are useful for ranking, prioritizing reconciliation work, or flagging anomalies.

## Functions

### `scoreByStatus(transaction)`
Returns a score in `[0, 1]` based on the transaction's status:
- `settled` → `1.0`
- `pending` → `0.5`
- `failed` → `0.0`

### `scoreByAmount(transaction, maxAmount)`
Normalizes the transaction amount against a provided maximum. Returns `0` when `maxAmount` is zero, and caps at `1.0`.

### `scoreByRecency(transaction, referenceDate?)`
Scores how recent a transaction is. Transactions dated today score `1.0`; transactions 365+ days old score `0.0`. Defaults to `new Date()` as the reference.

### `scoreTransaction(transaction, maxAmount, weights?, referenceDate?)`
Combines all three dimensions using configurable weights (default: `{ status: 0.4, amount: 0.3, recency: 0.3 }`). Returns a `ScoredTransaction` with a `score` and a `scoreBreakdown`.

### `scoreTransactions(transactions, weights?, referenceDate?)`
Scores an array of transactions. The `maxAmount` is derived automatically from the input set.

## Types

- **`ScoredTransaction`** — A `Transaction` extended with `score: number` and `scoreBreakdown: ScoreBreakdown`.
- **`ScoreBreakdown`** — Individual dimension scores and the weighted total.
- **`ScoringWeights`** — Configurable weights for `status`, `amount`, and `recency`.
