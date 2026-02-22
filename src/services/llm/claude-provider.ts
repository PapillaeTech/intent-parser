import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, LLMCallOptions } from './llm-provider.interface.js';

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic | null = null;
  private apiKey: string | undefined;
  private model: string;

  constructor(apiKey?: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = process.env.ANTHROPIC_MODEL || model;
    
    if (this.apiKey) {
      this.client = new Anthropic({ apiKey: this.apiKey });
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  async call(prompt: string, options?: LLMCallOptions): Promise<string> {
    if (!this.client) {
      throw new Error('Anthropic client not configured. Set ANTHROPIC_API_KEY in environment variables.');
    }

    try {
      const systemPrompt = options?.systemPrompt || '';
      
      const response = await this.client.messages.create({
        model: this.model as any,
        max_tokens: options?.maxTokens ?? 500,
        temperature: options?.temperature ?? 0.3,
        system: systemPrompt || undefined,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content.find((block) => block.type === 'text');
      if (!content || content.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      return content.text;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic API error: ${error.message}`);
      }
      throw new Error('Unknown error calling Anthropic API');
    }
  }
}
