import { loadConfig } from './config/app.config.js';
import { startServer } from './server.js';

// Load and validate configuration before starting server
try {
  loadConfig();
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Configuration error:', error instanceof Error ? error.message : error);
  process.exit(1);
}
