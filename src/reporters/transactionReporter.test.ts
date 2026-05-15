import { buildReport, renderReport, ReportOptions } from './transactionReporter';
import { ReconciliationResult } from '../reconciler/reconciler';
import { Transaction } from '../types/transaction';

const makeTransaction = (id: string, amount: number): Transaction => ({
  id,
  amount,
  currency: 'USD',
  status: 'settled',
  date: '2024-01-15',
  description: `Transaction ${id}`,
});

const source: Transaction[] = [makeTransaction('t1', 100), makeTransaction('t2', 200)];
const target: Transaction[] = [makeTransaction('t1', 100), makeTransaction('t3', 300)];

const mockResult: ReconciliationResult = {
  matched: [{ source: source[0], target: target[0] }],
  unmatched: { source: [source[1]], target: [target[1]] },
  discrepancies: [],
};

describe('buildReport', () => {
  it('builds a summary report', () => {
    const options: ReportOptions = { format: 'summary' };
    const report = buildReport(mockResult, source, target, options);
    expect(report.format).toBe('summary');
    expect(report.stats.totalSource).toBe(2);
    expect(report.stats.totalTarget).toBe(2);
    expect(report.content).toBeTruthy();
  });

  it('builds a csv report', () => {
    const options: ReportOptions = { format: 'csv' };
    const report = buildReport(mockResult, source, target, options);
    expect(report.format).toBe('csv');
    expect(report.content).toContain(',');
  });

  it('builds a json report with unmatched when requested', () => {
    const options: ReportOptions = { format: 'json', includeUnmatched: true };
    const report = buildReport(mockResult, source, target, options);
    const parsed = JSON.parse(report.content);
    expect(parsed.unmatched).toBeDefined();
    expect(parsed.unmatched.source).toHaveLength(1);
  });

  it('omits unmatched from json when not requested', () => {
    const options: ReportOptions = { format: 'json', includeUnmatched: false };
    const report = buildReport(mockResult, source, target, options);
    const parsed = JSON.parse(report.content);
    expect(parsed.unmatched).toBeUndefined();
  });

  it('uses default title when none provided', () => {
    const report = buildReport(mockResult, source, target, { format: 'summary' });
    expect(report.title).toBe('Reconciliation Report');
  });

  it('uses custom title when provided', () => {
    const report = buildReport(mockResult, source, target, { format: 'summary', title: 'My Report' });
    expect(report.title).toBe('My Report');
  });

  it('includes generatedAt timestamp', () => {
    const report = buildReport(mockResult, source, target, { format: 'summary' });
    expect(new Date(report.generatedAt).getTime()).not.toBeNaN();
  });
});

describe('renderReport', () => {
  it('renders a human-readable string', () => {
    const report = buildReport(mockResult, source, target, { format: 'summary', title: 'Test' });
    const rendered = renderReport(report);
    expect(rendered).toContain('=== Test ===');
    expect(rendered).toContain('Match Rate');
    expect(rendered).toContain('Source Transactions');
  });

  it('includes match rate as a percentage', () => {
    const report = buildReport(mockResult, source, target, { format: 'summary' });
    const rendered = renderReport(report);
    expect(rendered).toMatch(/\d+\.\d{2}%/);
  });
});
