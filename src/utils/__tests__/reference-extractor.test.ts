import { describe, it, expect } from 'vitest';
import { extractReference } from '../reference-extractor.js';

describe('ReferenceExtractor', () => {
  describe('extractReference', () => {
    it('should extract invoice reference', () => {
      const result = extractReference('pay invoice INV-2024-089');
      expect(result).toBe('INV-2024-089');
    });

    it('should extract reference from "ref:" pattern', () => {
      const result = extractReference('send money ref:12345');
      expect(result).toBe('12345');
    });

    it('should extract vendor ID as reference', () => {
      const result = extractReference('pay vendor_id:4421');
      expect(result).toBe('4421');
    });

    it('should return undefined when no reference found', () => {
      const result = extractReference('send money');
      expect(result).toBeUndefined();
    });
  });
});
