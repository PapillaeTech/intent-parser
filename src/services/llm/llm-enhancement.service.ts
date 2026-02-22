import type { ParsedIntent } from '../../types/intent-types.js';
import { LLMFactory } from './llm-factory.js';
import { getConfig, appConfig } from '../../config/app.config.js';
import {
  getPaymentIntentPrompt,
  getQueryIntentPrompt,
  getEnhancementPrompt,
  INTENT_PARSING_SYSTEM_PROMPT,
} from '../../prompts/intent-parsing.prompt.js';

/**
 * Service for enhancing parsed intents using LLM
 */
export class LLMEnhancementService {
  private provider: ReturnType<typeof LLMFactory.getConfiguredProvider> = null;
  private initialized = false;

  constructor() {
    // Lazy initialization - don't access config at module load time
  }

  /**
   * Lazy initialization of provider and config
   */
  private initialize() {
    if (this.initialized) {
      return;
    }

    try {
      const llmConfig = appConfig.llm;
      this.provider = LLMFactory.getConfiguredProvider();
      
      // Check if LLM is enabled
      if (!llmConfig.enabled || !this.provider) {
        this.provider = null;
      }
    } catch {
      // Config not loaded yet, LLM not available
      this.provider = null;
    }

    this.initialized = true;
  }

  /**
   * Gets LLM config safely
   */
  private getLLMConfig() {
    try {
      return appConfig.llm;
    } catch {
      return {
        enabled: false,
        provider: undefined,
        confidenceThreshold: 0.6,
        temperature: 0.3,
        maxTokens: 500,
        useFallback: true,
      };
    }
  }

  /**
   * Checks if LLM enhancement is available
   */
  isAvailable(): boolean {
    this.initialize();
    return this.provider !== null && this.provider.isConfigured();
  }

  /**
   * Enhances a parsed intent using LLM when confidence is low or fields are missing
   */
  async enhanceIntent(
    input: string,
    parsedIntent: ParsedIntent,
    confidence: number
  ): Promise<ParsedIntent | null> {
    this.initialize();
    const config = this.getLLMConfig();
    
    // Don't use LLM if confidence is above threshold
    if (confidence >= config.confidenceThreshold) {
      return null;
    }

    if (!this.isAvailable()) {
      return null;
    }

    try {
      let enhancedIntent: ParsedIntent | null = null;

      if (parsedIntent.type === 'payment') {
        enhancedIntent = await this.enhancePaymentIntent(input, parsedIntent);
      } else {
        enhancedIntent = await this.enhanceQueryIntent(input, parsedIntent);
      }

      return enhancedIntent;
    } catch (error) {
      // If LLM fails and fallback is enabled, return original intent
      const config = this.getLLMConfig();
      if (config.useFallback) {
        console.warn('LLM enhancement failed, using original intent:', error);
        return null;
      }
      throw error;
    }
  }

  /**
   * Enhances payment intent
   */
  private async enhancePaymentIntent(
    input: string,
    intent: ParsedIntent
  ): Promise<ParsedIntent | null> {
    if (intent.type !== 'payment') {
      return null;
    }

    const config = this.getLLMConfig();
    const prompt = getPaymentIntentPrompt(input, intent);
    
    try {
      const response = await this.provider!.call(prompt, {
        systemPrompt: INTENT_PARSING_SYSTEM_PROMPT,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });

      // Parse JSON response
      const enhanced = this.parseJSONResponse(response);
      
      if (enhanced) {
        // Merge with original intent, preferring LLM values
        return {
          ...intent,
          ...enhanced,
          confidence: Math.min(0.95, intent.confidence + 0.2), // Boost confidence
        } as ParsedIntent;
      }
    } catch (error) {
      console.warn('Failed to enhance payment intent:', error);
    }

    return null;
  }

  /**
   * Enhances query intent
   */
  private async enhanceQueryIntent(
    input: string,
    intent: ParsedIntent
  ): Promise<ParsedIntent | null> {
    const config = this.getLLMConfig();
    const prompt = getQueryIntentPrompt(input, intent.type, intent);
    
    try {
      const response = await this.provider!.call(prompt, {
        systemPrompt: INTENT_PARSING_SYSTEM_PROMPT,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });

      const enhanced = this.parseJSONResponse(response);
      
      if (enhanced) {
        return {
          ...intent,
          ...enhanced,
          confidence: Math.min(0.95, intent.confidence + 0.2),
        } as ParsedIntent;
      }
    } catch (error) {
      console.warn('Failed to enhance query intent:', error);
    }

    return null;
  }

  /**
   * Fills in missing fields for an intent
   */
  async fillMissingFields(
    input: string,
    intent: ParsedIntent,
    missingFields: string[]
  ): Promise<ParsedIntent | null> {
    if (!this.isAvailable() || missingFields.length === 0) {
      return null;
    }

    try {
      const config = this.getLLMConfig();
      const prompt = getEnhancementPrompt(input, intent, missingFields);
      
      const response = await this.provider!.call(prompt, {
        systemPrompt: INTENT_PARSING_SYSTEM_PROMPT,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });

      const enhanced = this.parseJSONResponse(response);
      
      if (enhanced) {
        // Merge, keeping original values for non-missing fields
        return {
          ...intent,
          ...enhanced,
        } as ParsedIntent;
      }
    } catch (error) {
      console.warn('Failed to fill missing fields:', error);
    }

    return null;
  }

  /**
   * Parses JSON from LLM response, handling markdown code blocks
   */
  private parseJSONResponse(response: string): any | null {
    try {
      // Remove markdown code blocks if present
      let jsonStr = response.trim();
      
      // Remove ```json or ``` markers
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '');
      jsonStr = jsonStr.replace(/\s*```$/i, '');
      jsonStr = jsonStr.trim();

      return JSON.parse(jsonStr);
    } catch (error) {
      console.warn('Failed to parse LLM JSON response:', error);
      return null;
    }
  }
}

// Export singleton instance
export const llmEnhancementService = new LLMEnhancementService();
