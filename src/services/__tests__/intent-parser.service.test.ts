import { describe, it, expect, beforeEach } from 'vitest';
import { IntentParserService } from '../intent-parser.service.js';

describe('IntentParserService', () => {
  let service: IntentParserService;

  beforeEach(() => {
    service = new IntentParserService();
  });

  describe('parseIntent', () => {
    it('should parse simple payment intent', () => {
      const result = service.parseIntent('send $500 to John in Manila');
      
      expect(result.amount).toBe(500);
      expect(result.currency).toBe('USD');
      expect(result.recipient).toBe('John');
      expect(result.destination_country).toBe('PH');
      expect(result.corridor).toBe('USD-PHP');
      expect(result.urgency).toBe('standard');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should parse conversational payment intent', () => {
      const result = service.parseIntent("pay my sister 200 euros, she's in Morocco");
      
      expect(result.amount).toBe(200);
      expect(result.currency).toBe('EUR');
      expect(result.recipient).toContain('sister');
      expect(result.destination_country).toBe('MA');
      expect(result.corridor).toBe('EUR-MAD');
      expect(result.urgency).toBe('standard');
    });

    it('should parse urgent payment intent', () => {
      const result = service.parseIntent('I need to send 1000 USDC to my contractor in Nigeria right now, it\'s urgent');
      
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe('USDC');
      expect(result.recipient).toContain('contractor');
      expect(result.destination_country).toBe('NG');
      expect(result.corridor).toBe('USDC-NGN');
      expect(result.urgency).toBe('high');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should handle ambiguous input with low confidence', () => {
      const result = service.parseIntent('send some money to my friend');
      
      expect(result.amount).toBeNull();
      expect(result.currency).toBeNull();
      expect(result.recipient).toContain('friend');
      expect(result.destination_country).toBeNull();
      expect(result.corridor).toBeNull();
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.missing_fields).toBeDefined();
      expect(result.clarification_needed).toBeDefined();
    });

    it('should parse AI agent style input with reference', () => {
      const result = service.parseIntent('Execute payment of 750 USD to vendor_id:4421 in PH for invoice INV-2024-089');
      
      expect(result.amount).toBe(750);
      expect(result.currency).toBe('USD');
      expect(result.recipient).toBe('4421');
      expect(result.destination_country).toBe('PH');
      expect(result.corridor).toBe('USD-PHP');
      expect(result.reference).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should throw error for empty input', () => {
      expect(() => service.parseIntent('')).toThrow('Input cannot be empty');
      expect(() => service.parseIntent('   ')).toThrow('Input cannot be empty');
    });

    it('should throw error for input exceeding max length', () => {
      const longInput = 'a'.repeat(2000);
      expect(() => service.parseIntent(longInput)).toThrow('exceeds maximum length');
    });
  });
});
