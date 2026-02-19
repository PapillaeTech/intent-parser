import { describe, it, expect } from 'vitest';
import { extractDestinationCountry } from '../country-extractor.js';

describe('CountryExtractor', () => {
  describe('extractDestinationCountry', () => {
    it('should extract country from "in [location]" pattern', () => {
      const result = extractDestinationCountry('send money to John in Manila');
      expect(result).toBe('PH');
    });

    it('should extract country from "in [country]" pattern', () => {
      const result = extractDestinationCountry('send to Ahmed in Morocco');
      expect(result).toBe('MA');
    });

    it('should extract country from "in [country]" pattern for Nigeria', () => {
      const result = extractDestinationCountry('send to contractor in Nigeria');
      expect(result).toBe('NG');
    });

    it('should extract country code', () => {
      const result = extractDestinationCountry('send to PH');
      expect(result).toBe('PH');
    });

    it('should return null when no country found', () => {
      const result = extractDestinationCountry('send money');
      expect(result).toBeNull();
    });
  });
});
