#!/usr/bin/env node

import { parseIntent } from './parser.js';
import { loadConfig } from './config/app.config.js';

/**
 * CLI interface for intent parser
 */
function main() {
  // Load config (for max input length validation)
  try {
    loadConfig();
  } catch (error) {
    // Config not required for CLI, but helpful for validation
    console.warn('Warning: Could not load config, using defaults');
  }

  // Get input from command line arguments
  const args = process.argv.slice(2);

  // Handle help flag
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Intent Parser CLI');
    console.log('\nUsage:');
    console.log('  intent-parser "send $500 to John in Manila"');
    console.log('  intent-parser --json "pay my sister 200 euros"');
    console.log('  echo "send money" | intent-parser');
    console.log('\nOptions:');
    console.log('  --json, -j    Output as JSON');
    console.log('  --help, -h    Show this help message');
    process.exit(args.length === 0 ? 1 : 0);
  }

  // Check for JSON output flag
  const jsonOutput = args[0] === '--json' || args[0] === '-j';
  
  // Join remaining args as input (handles unquoted multi-word inputs)
  const input = jsonOutput 
    ? args.slice(1).join(' ')
    : args.join(' ');

  if (!input) {
    console.error('Error: No input provided');
    process.exit(1);
  }

  try {
    // Parse the intent
    const intent = parseIntent(input);

    // Output result
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: true,
        intent,
        raw_input: input,
        parsed_at: new Date().toISOString(),
      }, null, 2));
    } else {
      // Human-readable output
      console.log('\n📋 Parsed Payment Intent\n');
      console.log(`Input: "${input}"\n`);
      
      if (intent.amount !== null) {
        console.log(`💰 Amount: ${intent.amount} ${intent.currency || ''}`);
      } else {
        console.log('💰 Amount: (not specified)');
      }
      
      if (intent.currency) {
        console.log(`💵 Currency: ${intent.currency}`);
      } else {
        console.log('💵 Currency: (not specified)');
      }
      
      if (intent.recipient) {
        console.log(`👤 Recipient: ${intent.recipient}`);
      } else {
        console.log('👤 Recipient: (not specified)');
      }
      
      if (intent.destination_country) {
        console.log(`🌍 Destination: ${intent.destination_country}`);
      } else {
        console.log('🌍 Destination: (not specified)');
      }
      
      if (intent.corridor) {
        console.log(`🔄 Corridor: ${intent.corridor}`);
      } else {
        console.log('🔄 Corridor: (not specified)');
      }
      
      console.log(`⚡ Urgency: ${intent.urgency}`);
      console.log(`📊 Confidence: ${(intent.confidence * 100).toFixed(0)}%`);
      
      if (intent.reference) {
        console.log(`📄 Reference: ${intent.reference}`);
      }
      
      if (intent.missing_fields && intent.missing_fields.length > 0) {
        console.log(`\n⚠️  Missing Fields: ${intent.missing_fields.join(', ')}`);
      }
      
      if (intent.clarification_needed) {
        console.log(`\n❓ ${intent.clarification_needed}`);
      }
      
      console.log('');
    }
  } catch (error) {
    console.error('Error parsing intent:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Handle stdin input
// Check if we have command line arguments first
const hasArgs = process.argv.length > 2;

if (hasArgs || process.stdin.isTTY) {
  // Running in terminal with args, use command line args
  main();
} else {
  // Reading from stdin (pipe)
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  process.stdin.on('end', () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      console.error('Error: No input provided via stdin');
      process.exit(1);
    }
    
    // Check for JSON flag in original args
    const originalArgs = process.argv.slice(2);
    const jsonFlag = originalArgs.includes('--json') || originalArgs.includes('-j');
    
    // Process stdin input
    try {
      loadConfig();
    } catch (error) {
      console.warn('Warning: Could not load config, using defaults');
    }
    
    try {
      const intent = parseIntent(trimmedInput);
      
      if (jsonFlag) {
        console.log(JSON.stringify({
          success: true,
          intent,
          raw_input: trimmedInput,
          parsed_at: new Date().toISOString(),
        }, null, 2));
      } else {
        // Human-readable output (same as main function)
        console.log('\n📋 Parsed Payment Intent\n');
        console.log(`Input: "${trimmedInput}"\n`);
        
        if (intent.amount !== null) {
          console.log(`💰 Amount: ${intent.amount} ${intent.currency || ''}`);
        } else {
          console.log('💰 Amount: (not specified)');
        }
        
        if (intent.currency) {
          console.log(`💵 Currency: ${intent.currency}`);
        } else {
          console.log('💵 Currency: (not specified)');
        }
        
        if (intent.recipient) {
          console.log(`👤 Recipient: ${intent.recipient}`);
        } else {
          console.log('👤 Recipient: (not specified)');
        }
        
        if (intent.destination_country) {
          console.log(`🌍 Destination: ${intent.destination_country}`);
        } else {
          console.log('🌍 Destination: (not specified)');
        }
        
        if (intent.corridor) {
          console.log(`🔄 Corridor: ${intent.corridor}`);
        } else {
          console.log('🔄 Corridor: (not specified)');
        }
        
        console.log(`⚡ Urgency: ${intent.urgency}`);
        console.log(`📊 Confidence: ${(intent.confidence * 100).toFixed(0)}%`);
        
        if (intent.reference) {
          console.log(`📄 Reference: ${intent.reference}`);
        }
        
        if (intent.missing_fields && intent.missing_fields.length > 0) {
          console.log(`\n⚠️  Missing Fields: ${intent.missing_fields.join(', ')}`);
        }
        
        if (intent.clarification_needed) {
          console.log(`\n❓ ${intent.clarification_needed}`);
        }
        
        console.log('');
      }
    } catch (error) {
      console.error('Error parsing intent:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
}
