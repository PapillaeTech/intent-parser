import OpenAI from 'openai';
import type { LLMProvider, LLMCallOptions } from './llm-provider.interface.js';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI | null = null;
  private apiKey: string | undefined;
  private model: string;

  constructor(apiKey?: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || model;
    
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  async call(prompt: string, options?: LLMCallOptions): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not configured. Set OPENAI_API_KEY in environment variables.');
    }

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      
      if (options?.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt,
        });
      }
      
      messages.push({
        role: 'user',
        content: prompt,
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('Unknown error calling OpenAI API');
    }
  }
}
