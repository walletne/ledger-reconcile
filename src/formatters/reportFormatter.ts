import { ReconciliationResult } from '../reconciler/reconciler';

export type ReportFormat = 'json' | 'csv' | 'summary';

export interface FormattedReport {
  format: ReportFormat;
  content: string;
  generatedAt: string;
}

function formatAsCsv(result: ReconciliationResult): string {
  const lines: string[] = [
    'type,transactionId,amount,currency,status,description'
  ];

  for (const tx of result.matched) {
    lines.push(
      `matched,${tx.id},${tx.amount},${tx.currency},${tx.status},"${tx.description ?? ''}"`
    );
  }

  for (const discrepancy of result.discrepancies) {
    const tx = discrepancy.source;
    lines.push(
      `discrepancy_${discrepancy.type},${tx.id},${tx.amount},${tx.currency},${tx.status},"${discrepancy.message}"`
    );
  }

  for (const tx of result.unmatched) {
    lines.push(
      `unmatched,${tx.id},${tx.amount},${tx.currency},${tx.status},"${tx.description ?? ''}"`
    );
  }

  return lines.join('\n');
}

function formatAsSummary(result: ReconciliationResult): string {
  const total = result.matched.length + result.discrepancies.length + result.unmatched.length;
  const lines = [
    `Reconciliation Report — ${new Date().toUTCString()}`,
    `─────────────────────────────────────────`,
    `Total transactions : ${total}`,
    `Matched            : ${result.matched.length}`,
    `Discrepancies      : ${result.discrepancies.length}`,
    `Unmatched          : ${result.unmatched.length}`,
    `─────────────────────────────────────────`
  ];

  if (result.discrepancies.length > 0) {
    lines.push('Discrepancy details:');
    for (const d of result.discrepancies) {
      lines.push(`  [${d.type}] ${d.source.id}: ${d.message}`);
    }
  }

  return lines.join('\n');
}

export function formatReport(
  result: ReconciliationResult,
  format: ReportFormat = 'summary'
): FormattedReport {
  let content: string;

  switch (format) {
    case 'csv':
      content = formatAsCsv(result);
      break;
    case 'json':
      content = JSON.stringify(result, null, 2);
      break;
    case 'summary':
    default:
      content = formatAsSummary(result);
  }

  return {
    format,
    content,
    generatedAt: new Date().toISOString()
  };
}
