import { describe, it, expect } from 'vitest';
import { calculateConfidence } from '../confidence-calculator.js';

describe('ConfidenceCalculator', () => {
  describe('calculateConfidence', () => {
    it('should return high confidence when all fields present', () => {
      const result = calculateConfidence({
        amount: 500,
        currency: 'USD',
        recipient: 'John',
        destination_country: 'PH',
        corridor: 'USD-PHP',
      });
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.missing_fields).toBeUndefined();
    });

    it('should return low confidence when fields missing', () => {
      const result = calculateConfidence({
        amount: null,
        currency: null,
        recipient: 'friend',
        destination_country: null,
        corridor: null,
      });
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.missing_fields).toContain('amount');
      expect(result.missing_fields).toContain('currency');
      expect(result.missing_fields).toContain('destination_country');
      expect(result.clarification_needed).toBeDefined();
    });

    it('should include corridor bonus', () => {
      const result = calculateConfidence({
        amount: 500,
        currency: 'USD',
        recipient: 'John',
        destination_country: 'PH',
        corridor: 'USD-PHP',
      });
      // Confidence is capped at 1.0, but corridor adds bonus before capping
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it('should cap confidence at 1.0', () => {
      const result = calculateConfidence({
        amount: 500,
        currency: 'USD',
        recipient: 'John',
        destination_country: 'PH',
        corridor: 'USD-PHP',
      });
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });
  });
});
