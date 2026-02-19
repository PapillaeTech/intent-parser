import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig, getConfig, resetConfig, appConfig } from '../app.config.js';

describe('AppConfig', () => {
  beforeEach(() => {
    // Reset and reload config for each test
    resetConfig();
    loadConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  describe('loadConfig', () => {
    it('should load config with default values', () => {
      resetConfig(); // Ensure clean state
      const config = loadConfig();
      expect(typeof config.PORT).toBe('number');
      expect(config.PORT).toBe(3000);
      expect(config.HOST).toBe('0.0.0.0');
      expect(config.NODE_ENV).toBe('development');
    });

    it('should use environment variables when set', () => {
      process.env['PORT'] = '8080';
      process.env['HOST'] = '127.0.0.1';
      resetConfig();
      const config = loadConfig();
      expect(config.PORT).toBe(8080);
      expect(config.HOST).toBe('127.0.0.1');
      delete process.env['PORT'];
      delete process.env['HOST'];
    });
  });

  describe('getConfig', () => {
    it('should throw error if config not loaded', () => {
      resetConfig(); // Ensure config is not loaded
      expect(() => getConfig()).toThrow('Configuration not loaded');
    });

    it('should return config after loading', () => {
      loadConfig();
      const config = getConfig();
      expect(config).toBeDefined();
    });
  });

  describe('appConfig', () => {
    beforeEach(() => {
      loadConfig();
    });

    it('should provide server config', () => {
      resetConfig(); // Ensure clean state
      loadConfig();
      const config = getConfig();
      expect(typeof config.PORT).toBe('number');
      expect(config.PORT).toBe(3000);
      expect(config.HOST).toBe('0.0.0.0');
    });

    it('should provide logging config', () => {
      resetConfig(); // Ensure clean state
      loadConfig();
      const config = getConfig();
      expect(config.LOG_LEVEL).toBe('info');
    });

    it('should provide app config', () => {
      resetConfig(); // Ensure clean state
      loadConfig();
      const config = getConfig();
      // MAX_INPUT_LENGTH is transformed from string to number
      expect(typeof config.MAX_INPUT_LENGTH).toBe('number');
      expect(config.MAX_INPUT_LENGTH).toBe(1000);
      expect(config.DEFAULT_CURRENCY).toBe('USD');
      expect(config.DEFAULT_URGENCY).toBe('standard');
    });
  });
});
