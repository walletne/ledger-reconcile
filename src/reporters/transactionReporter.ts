import { Transaction } from '../types/transaction';
import { ReconciliationResult } from '../reconciler/reconciler';
import { summarizeReconciliation } from '../summarizers/reconciliationSummarizer';
import { formatAsSummary, formatAsCsv } from '../formatters/reportFormatter';

export type ReportFormat = 'summary' | 'csv' | 'json';

export interface ReportOptions {
  format: ReportFormat;
  includeUnmatched?: boolean;
  includeDiscrepancies?: boolean;
  title?: string;
}

export interface Report {
  title: string;
  generatedAt: string;
  format: ReportFormat;
  content: string;
  stats: {
    totalSource: number;
    totalTarget: number;
    matchRate: number;
    discrepancyCount: number;
  };
}

export function buildReport(
  result: ReconciliationResult,
  sourceTransactions: Transaction[],
  targetTransactions: Transaction[],
  options: ReportOptions
): Report {
  const summary = summarizeReconciliation(result);
  const title = options.title ?? 'Reconciliation Report';
  const generatedAt = new Date().toISOString();

  let content: string;

  switch (options.format) {
    case 'csv':
      content = formatAsCsv(result);
      break;
    case 'json':
      content = JSON.stringify(
        {
          matched: result.matched,
          unmatched: options.includeUnmatched ? result.unmatched : undefined,
          discrepancies: options.includeDiscrepancies ? result.discrepancies : undefined,
        },
        null,
        2
      );
      break;
    case 'summary':
    default:
      content = formatAsSummary(result);
      break;
  }

  return {
    title,
    generatedAt,
    format: options.format,
    content,
    stats: {
      totalSource: sourceTransactions.length,
      totalTarget: targetTransactions.length,
      matchRate: summary.matchRate,
      discrepancyCount: summary.discrepancyCount,
    },
  };
}

export function renderReport(report: Report): string {
  const header = `=== ${report.title} ===\nGenerated: ${report.generatedAt}\nFormat: ${report.format}\n`;
  const statsBlock = [
    `Source Transactions : ${report.stats.totalSource}`,
    `Target Transactions : ${report.stats.totalTarget}`,
    `Match Rate          : ${(report.stats.matchRate * 100).toFixed(2)}%`,
    `Discrepancies       : ${report.stats.discrepancyCount}`,
  ].join('\n');
  return `${header}\n${statsBlock}\n\n${report.content}`;
}
