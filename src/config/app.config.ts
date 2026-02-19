import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment schema
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().regex(/^\d+$/).transform(Number).default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // API Configuration
  API_PREFIX: z.string().default('/api/v1'),

  // Application Settings
  MAX_INPUT_LENGTH: z.string().regex(/^\d+$/).transform(Number).default(1000),
  DEFAULT_CURRENCY: z.string().default('USD'),
  DEFAULT_URGENCY: z.enum(['standard', 'high']).default('standard'),
});

type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig | null = null;

/**
 * Validates and loads environment configuration
 * @throws Error if required environment variables are missing or invalid
 */
export function loadConfig(): EnvConfig {
  if (config) {
    return config;
  }

  try {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      }).join('\n');

      throw new Error(
        `Invalid environment configuration:\n${errors}\n\n` +
        'Please check your .env file and ensure all required variables are set correctly.'
      );
    }

    config = parsed.data;
    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to load configuration');
  }
}

/**
 * Gets the current configuration
 * @throws Error if config has not been loaded
 */
export function getConfig(): EnvConfig {
  if (!config) {
    throw new Error(
      'Configuration not loaded. Call loadConfig() before using getConfig().'
    );
  }
  return config;
}

/**
 * Resets the configuration (useful for testing)
 */
export function resetConfig(): void {
  config = null;
}

// Export typed config for direct access
export const appConfig = {
  get server() {
    return {
      port: getConfig().PORT,
      host: getConfig().HOST,
      nodeEnv: getConfig().NODE_ENV,
    };
  },
  get logging() {
    return {
      level: getConfig().LOG_LEVEL,
    };
  },
  get api() {
    return {
      prefix: getConfig().API_PREFIX,
    };
  },
  get app() {
    return {
      maxInputLength: getConfig().MAX_INPUT_LENGTH,
      defaultCurrency: getConfig().DEFAULT_CURRENCY,
      defaultUrgency: getConfig().DEFAULT_URGENCY,
    };
  },
};
