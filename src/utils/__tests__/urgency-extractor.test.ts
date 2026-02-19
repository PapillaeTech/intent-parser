import { describe, it, expect } from 'vitest';
import { extractUrgency } from '../urgency-extractor.js';

describe('UrgencyExtractor', () => {
  describe('extractUrgency', () => {
    it('should detect high urgency from "urgent"', () => {
      const result = extractUrgency('send money urgent');
      expect(result).toBe('high');
    });

    it('should detect high urgency from "asap"', () => {
      const result = extractUrgency('send money asap');
      expect(result).toBe('high');
    });

    it('should detect high urgency from "right now"', () => {
      const result = extractUrgency('send money right now');
      expect(result).toBe('high');
    });

    it('should default to standard urgency', () => {
      // This test requires config to be loaded, which happens in test-setup.ts
      const result = extractUrgency('send money');
      expect(result).toBe('standard');
    });
  });
});
