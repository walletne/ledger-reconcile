import { ReconciliationResult } from '../reconciler/reconciler';
import { formatAsCsv, formatAsSummary } from '../formatters/reportFormatter';
import * as fs from 'fs';
import * as path from 'path';

export type ExportFormat = 'csv' | 'summary' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  outputDir: string;
  filename?: string;
}

export interface ExportResult {
  filePath: string;
  format: ExportFormat;
  bytesWritten: number;
}

export function generateFilename(format: ExportFormat, timestamp: Date = new Date()): string {
  const ts = timestamp.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
  return `reconciliation-${ts}.${ext}`;
}

export function serializeResult(result: ReconciliationResult, format: ExportFormat): string {
  switch (format) {
    case 'csv':
      return formatAsCsv(result);
    case 'summary':
      return formatAsSummary(result);
    case 'json':
      return JSON.stringify(result, null, 2);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function exportReconciliation(
  result: ReconciliationResult,
  options: ExportOptions
): ExportResult {
  const { format, outputDir, filename } = options;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const resolvedFilename = filename ?? generateFilename(format);
  const filePath = path.join(outputDir, resolvedFilename);
  const content = serializeResult(result, format);

  fs.writeFileSync(filePath, content, 'utf-8');

  return {
    filePath,
    format,
    bytesWritten: Buffer.byteLength(content, 'utf-8'),
  };
}
