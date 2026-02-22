/**
 * Interface for LLM providers
 */
export interface LLMProvider {
  /**
   * Calls the LLM with a prompt and returns the response
   */
  call(prompt: string, options?: LLMCallOptions): Promise<string>;
  
  /**
   * Checks if the provider is properly configured
   */
  isConfigured(): boolean;
}

export interface LLMCallOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}
