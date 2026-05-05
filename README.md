# ledger-reconcile

Lightweight library for reconciling transaction records between payment providers and internal databases.

## Installation

```bash
npm install ledger-reconcile
```

## Usage

```typescript
import { reconcile } from 'ledger-reconcile';

const providerRecords = [
  { id: 'txn_001', amount: 4999, currency: 'USD', status: 'settled' },
  { id: 'txn_002', amount: 1200, currency: 'USD', status: 'settled' },
];

const internalRecords = [
  { id: 'txn_001', amount: 4999, currency: 'USD', status: 'completed' },
  { id: 'txn_003', amount: 750,  currency: 'USD', status: 'completed' },
];

const result = reconcile(providerRecords, internalRecords, { matchOn: 'id' });

console.log(result.matched);   // Records present in both sources
console.log(result.missing);   // Records missing from internal DB
console.log(result.unmatched); // Records with conflicting data
```

### Options

| Option      | Type       | Default | Description                              |
|-------------|------------|---------|------------------------------------------|
| `matchOn`   | `string`   | `'id'`  | Field used to match records across sets  |
| `strict`    | `boolean`  | `false` | Fail on any field mismatch               |
| `currency`  | `string`   | `null`  | Filter reconciliation to one currency    |

## API

- **`reconcile(source, target, options?)`** — Compare two sets of transaction records and return a detailed diff report.
- **`ReconcileResult`** — TypeScript interface describing the shape of the returned report.

## Contributing

Pull requests are welcome. Please open an issue first to discuss any significant changes.

## License

[MIT](./LICENSE)