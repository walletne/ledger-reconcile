import { formatReport } from './reportFormatter';
import { ReconciliationResult } from '../reconciler/reconciler';

const mockResult: ReconciliationResult = {
  matched: [
    { id: 'tx-001', amount: 100, currency: 'USD', status: 'settled', date: '2024-01-01' }
  ],
  discrepancies: [
    {
      type: 'amount_mismatch',
      source: { id: 'tx-002', amount: 200, currency: 'USD', status: 'settled', date: '2024-01-02' },
      message: 'Amount mismatch: expected 200, got 195'
    }
  ],
  unmatched: [
    { id: 'tx-003', amount: 50, currency: 'EUR', status: 'pending', date: '2024-01-03' }
  ]
};

describe('formatReport', () => {
  describe('summary format', () => {
    it('should include total, matched, discrepancy and unmatched counts', () => {
      const report = formatReport(mockResult, 'summary');
      expect(report.format).toBe('summary');
      expect(report.content).toContain('Total transactions : 3');
      expect(report.content).toContain('Matched            : 1');
      expect(report.content).toContain('Discrepancies      : 1');
      expect(report.content).toContain('Unmatched          : 1');
    });

    it('should list discrepancy details', () => {
      const report = formatReport(mockResult, 'summary');
      expect(report.content).toContain('[amount_mismatch] tx-002');
    });

    it('should default to summary format', () => {
      const report = formatReport(mockResult);
      expect(report.format).toBe('summary');
    });
  });

  describe('csv format', () => {
    it('should include a header row', () => {
      const report = formatReport(mockResult, 'csv');
      expect(report.content).toContain('type,transactionId,amount,currency,status,description');
    });

    it('should include matched transactions', () => {
      const report = formatReport(mockResult, 'csv');
      expect(report.content).toContain('matched,tx-001,100,USD,settled');
    });

    it('should include discrepancy rows with type prefix', () => {
      const report = formatReport(mockResult, 'csv');
      expect(report.content).toContain('discrepancy_amount_mismatch,tx-002');
    });

    it('should include unmatched transactions', () => {
      const report = formatReport(mockResult, 'csv');
      expect(report.content).toContain('unmatched,tx-003,50,EUR,pending');
    });
  });

  describe('json format', () => {
    it('should return valid JSON containing the full result', () => {
      const report = formatReport(mockResult, 'json');
      const parsed = JSON.parse(report.content);
      expect(parsed.matched).toHaveLength(1);
      expect(parsed.discrepancies).toHaveLength(1);
      expect(parsed.unmatched).toHaveLength(1);
    });
  });

  describe('metadata', () => {
    it('should include a generatedAt ISO timestamp', () => {
      const report = formatReport(mockResult, 'json');
      expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
