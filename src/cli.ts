#!/usr/bin/env node

import { parse } from './parser.js';
import { loadConfig } from './config/app.config.js';
import type { ParsedIntent } from './types/index.js';

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
    // Parse the intent using new parser
    const parsedIntent = parse(input);

    // Output result
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: true,
        intent: parsedIntent,
        raw_input: input,
        parsed_at: new Date().toISOString(),
      }, null, 2));
    } else {
      // Human-readable output based on intent type
      displayIntent(parsedIntent, input);
    }
  } catch (error) {
    console.error('Error parsing intent:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Displays parsed intent in human-readable format
 */
function displayIntent(intent: ParsedIntent, input: string): void {
  const intentTypeLabels: Record<string, string> = {
    payment: 'Payment Intent',
    query_transaction: 'Transaction Query',
    query_status: 'Status Query',
    query_balance: 'Balance Query',
    query_history: 'History Query',
    query_search: 'Search Query',
    query_list: 'List Query',
    unknown: 'Unknown Intent',
  };

  console.log(`\n📋 Parsed ${intentTypeLabels[intent.type] || 'Intent'}\n`);
  console.log(`Input: "${input}"\n`);
  console.log(`🎯 Intent Type: ${intent.type}`);
  console.log(`📊 Confidence: ${(intent.confidence * 100).toFixed(0)}%\n`);

  switch (intent.type) {
    case 'payment':
      displayPaymentIntent(intent);
      break;
    case 'query_transaction':
      displayTransactionQuery(intent);
      break;
    case 'query_status':
      displayStatusQuery(intent);
      break;
    case 'query_balance':
      displayBalanceQuery(intent);
      break;
    case 'query_history':
      displayHistoryQuery(intent);
      break;
    case 'query_search':
      displaySearchQuery(intent);
      break;
    case 'query_list':
      displayListQuery(intent);
      break;
    default:
      console.log('⚠️  Unknown intent type');
  }
  
  console.log('');
}

function displayPaymentIntent(intent: any): void {
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
  
  if (intent.reference) {
    console.log(`📄 Reference: ${intent.reference}`);
  }
  
  if (intent.missing_fields && intent.missing_fields.length > 0) {
    console.log(`\n⚠️  Missing Fields: ${intent.missing_fields.join(', ')}`);
  }
  
  if (intent.clarification_needed) {
    console.log(`\n❓ ${intent.clarification_needed}`);
  }
}

function displayTransactionQuery(intent: any): void {
  if (intent.transaction_type) {
    console.log(`📅 Transaction Type: ${intent.transaction_type}`);
  }
  if (intent.count) {
    console.log(`🔢 Count: ${intent.count}`);
  }
  if (intent.date_range) {
    if (intent.date_range.start) {
      console.log(`📆 Start Date: ${intent.date_range.start}`);
    }
    if (intent.date_range.end) {
      console.log(`📆 End Date: ${intent.date_range.end}`);
    }
  }
  if (intent.filters) {
    console.log('\n🔍 Filters:');
    if (intent.filters.recipient) {
      console.log(`  👤 Recipient: ${intent.filters.recipient}`);
    }
    if (intent.filters.amount) {
      console.log(`  💰 Amount: ${intent.filters.amount}`);
    }
    if (intent.filters.currency) {
      console.log(`  💵 Currency: ${intent.filters.currency}`);
    }
    if (intent.filters.status) {
      console.log(`  📊 Status: ${intent.filters.status}`);
    }
  }
}

function displayStatusQuery(intent: any): void {
  if (intent.recipient) {
    console.log(`👤 Recipient: ${intent.recipient}`);
  }
  if (intent.reference) {
    console.log(`📄 Reference: ${intent.reference}`);
  }
  if (intent.transaction_id) {
    console.log(`🆔 Transaction ID: ${intent.transaction_id}`);
  }
  if (intent.payment_id) {
    console.log(`💳 Payment ID: ${intent.payment_id}`);
  }
  if (intent.date) {
    console.log(`📆 Date: ${intent.date}`);
  }
  if (!intent.recipient && !intent.reference && !intent.transaction_id && !intent.payment_id) {
    console.log('⚠️  No specific identifier found');
  }
}

function displayBalanceQuery(intent: any): void {
  if (intent.currency) {
    console.log(`💵 Currency: ${intent.currency}`);
  }
  if (intent.account_type) {
    console.log(`🏦 Account Type: ${intent.account_type}`);
  }
}

function displayHistoryQuery(intent: any): void {
  if (intent.date_range) {
    if (intent.date_range.start) {
      console.log(`📆 Start Date: ${intent.date_range.start}`);
    }
    if (intent.date_range.end) {
      console.log(`📆 End Date: ${intent.date_range.end}`);
    }
  }
  if (intent.limit) {
    console.log(`🔢 Limit: ${intent.limit}`);
  }
  if (intent.filters) {
    console.log('\n🔍 Filters:');
    if (intent.filters.recipient) {
      console.log(`  👤 Recipient: ${intent.filters.recipient}`);
    }
    if (intent.filters.amount) {
      console.log(`  💰 Amount: ${intent.filters.amount}`);
    }
    if (intent.filters.currency) {
      console.log(`  💵 Currency: ${intent.filters.currency}`);
    }
    if (intent.filters.status) {
      console.log(`  📊 Status: ${intent.filters.status}`);
    }
  }
}

function displaySearchQuery(intent: any): void {
  console.log(`🔍 Search Term: ${intent.search_term}`);
  if (intent.filters) {
    console.log('\n🔍 Additional Filters:');
    if (intent.filters.amount) {
      console.log(`  💰 Amount: ${intent.filters.amount}`);
    }
    if (intent.filters.currency) {
      console.log(`  💵 Currency: ${intent.filters.currency}`);
    }
    if (intent.filters.date) {
      console.log(`  📆 Date: ${intent.filters.date}`);
    }
  }
}

function displayListQuery(intent: any): void {
  console.log(`📋 Entity Type: ${intent.entity_type}`);
  if (intent.limit) {
    console.log(`🔢 Limit: ${intent.limit}`);
  }
  if (intent.filters) {
    console.log('\n🔍 Filters:');
    if (intent.filters.status) {
      console.log(`  📊 Status: ${intent.filters.status}`);
    }
    if (intent.filters.currency) {
      console.log(`  💵 Currency: ${intent.filters.currency}`);
    }
    if (intent.filters.date) {
      console.log(`  📆 Date: ${intent.filters.date}`);
    }
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
      const parsedIntent = parse(trimmedInput);
      
      if (jsonFlag) {
        console.log(JSON.stringify({
          success: true,
          intent: parsedIntent,
          raw_input: trimmedInput,
          parsed_at: new Date().toISOString(),
        }, null, 2));
      } else {
        // Human-readable output
        displayIntent(parsedIntent, trimmedInput);
      }
    } catch (error) {
      console.error('Error parsing intent:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
}
