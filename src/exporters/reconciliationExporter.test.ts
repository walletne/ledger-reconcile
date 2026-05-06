import * as fs from 'fs';
import * as path from 'path';
import {
  generateFilename,
  serializeResult,
  exportReconciliation,
  ExportFormat,
} from './reconciliationExporter';
import { ReconciliationResult } from '../reconciler/reconciler';

const mockResult: ReconciliationResult = {
  matched: [
    { id: 'txn-1', amount: 100, currency: 'USD', status: 'settled', date: '2024-01-01', source: 'provider' },
  ],
  unmatched: [
    { id: 'txn-2', amount: 50, currency: 'USD', status: 'pending', date: '2024-01-02', source: 'internal' },
  ],
  discrepancies: [],
};

describe('generateFilename', () => {
  it('generates a csv filename with timestamp', () => {
    const date = new Date('2024-06-15T10:30:00Z');
    const name = generateFilename('csv', date);
    expect(name).toMatch(/^reconciliation-.*\.csv$/);
  });

  it('generates a json filename', () => {
    const name = generateFilename('json');
    expect(name).toMatch(/\.json$/);
  });

  it('generates a txt filename for summary format', () => {
    const name = generateFilename('summary');
    expect(name).toMatch(/\.txt$/);
  });
});

describe('serializeResult', () => {
  it('serializes to JSON string', () => {
    const output = serializeResult(mockResult, 'json');
    const parsed = JSON.parse(output);
    expect(parsed.matched).toHaveLength(1);
    expect(parsed.unmatched).toHaveLength(1);
  });

  it('serializes to csv format', () => {
    const output = serializeResult(mockResult, 'csv');
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });

  it('serializes to summary format', () => {
    const output = serializeResult(mockResult, 'summary');
    expect(typeof output).toBe('string');
  });

  it('throws for unsupported format', () => {
    expect(() => serializeResult(mockResult, 'xml' as ExportFormat)).toThrow(
      'Unsupported export format: xml'
    );
  });
});

describe('exportReconciliation', () => {
  const testOutputDir = path.join(__dirname, '__test_exports__');

  afterEach(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it('creates output directory if it does not exist', () => {
    exportReconciliation(mockResult, { format: 'json', outputDir: testOutputDir });
    expect(fs.existsSync(testOutputDir)).toBe(true);
  });

  it('writes file and returns correct metadata', () => {
    const result = exportReconciliation(mockResult, {
      format: 'json',
      outputDir: testOutputDir,
      filename: 'test-export.json',
    });
    expect(fs.existsSync(result.filePath)).toBe(true);
    expect(result.format).toBe('json');
    expect(result.bytesWritten).toBeGreaterThan(0);
  });

  it('uses provided filename when specified', () => {
    const result = exportReconciliation(mockResult, {
      format: 'csv',
      outputDir: testOutputDir,
      filename: 'custom.csv',
    });
    expect(result.filePath).toContain('custom.csv');
  });
});
