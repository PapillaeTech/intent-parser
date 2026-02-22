import type { LLMProvider } from './llm-provider.interface.js';
import { OpenAIProvider } from './openai-provider.js';
import { ClaudeProvider } from './claude-provider.js';
import { GoogleProvider } from './google-provider.js';

export type LLMProviderType = 'openai' | 'claude' | 'google' | 'anthropic';

/**
 * Factory to create LLM provider instances
 */
export class LLMFactory {
  /**
   * Creates an LLM provider based on configuration
   */
  static createProvider(providerType?: string): LLMProvider | null {
    const provider = (providerType || process.env.LLM_PROVIDER || '').toLowerCase();
    
    switch (provider) {
      case 'openai':
        return new OpenAIProvider();
      case 'claude':
      case 'anthropic':
        return new ClaudeProvider();
      case 'google':
        return new GoogleProvider();
      default:
        return null;
    }
  }

  /**
   * Gets the configured provider or null if not configured
   */
  static getConfiguredProvider(): LLMProvider | null {
    const provider = this.createProvider();
    if (provider && provider.isConfigured()) {
      return provider;
    }
    return null;
  }

  /**
   * Checks if any LLM provider is configured
   */
  static isLLMEnabled(): boolean {
    const enabled = process.env.LLM_ENABLED?.toLowerCase() === 'true';
    if (!enabled) {
      return false;
    }
    
    const provider = this.getConfiguredProvider();
    return provider !== null;
  }
}
