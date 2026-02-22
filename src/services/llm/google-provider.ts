import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMProvider, LLMCallOptions } from './llm-provider.interface.js';

export class GoogleProvider implements LLMProvider {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string | undefined;
  private model: string;

  constructor(apiKey?: string, model: string = 'gemini-pro') {
    this.apiKey = apiKey || process.env.GOOGLE_API_KEY;
    this.model = process.env.GOOGLE_MODEL || model;
    
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.client;
  }

  async call(prompt: string, options?: LLMCallOptions): Promise<string> {
    if (!this.client) {
      throw new Error('Google client not configured. Set GOOGLE_API_KEY in environment variables.');
    }

    try {
      const genModel = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          temperature: options?.temperature ?? 0.3,
          maxOutputTokens: options?.maxTokens ?? 500,
        },
      });

      const systemInstruction = options?.systemPrompt;
      const fullPrompt = systemInstruction 
        ? `${systemInstruction}\n\n${prompt}`
        : prompt;

      const result = await genModel.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No content in Google response');
      }

      return text;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Google API error: ${error.message}`);
      }
      throw new Error('Unknown error calling Google API');
    }
  }
}
