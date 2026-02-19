import { describe, it, expect } from 'vitest';
import { extractRecipient } from '../recipient-extractor.js';

describe('RecipientExtractor', () => {
  describe('extractRecipient', () => {
    it('should extract vendor ID', () => {
      const result = extractRecipient('send to vendor_id:4421');
      expect(result).toBe('4421');
    });

    it('should extract relationship keywords', () => {
      const result = extractRecipient('pay my sister');
      expect(result).toContain('sister');
    });

    it('should extract name after "to"', () => {
      const result = extractRecipient('send to John');
      expect(result).toBe('John');
    });

    it('should extract capitalized name', () => {
      const result = extractRecipient('send money to Ahmed');
      expect(result).toBe('Ahmed');
    });

    it('should extract full name', () => {
      const result = extractRecipient('send to John Smith');
      expect(result).toBe('John Smith');
    });

    it('should return null when no recipient found', () => {
      const result = extractRecipient('send money');
      // Should return null when no meaningful recipient found
      expect(result).toBeNull();
    });
  });
});
