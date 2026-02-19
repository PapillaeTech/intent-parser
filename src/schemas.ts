import { z } from 'zod';

export const ParseRequestSchema = z.object({
  input: z.string().min(1, 'Input cannot be empty'),
});

// Base intent schema
const BaseIntentSchema = z.object({
  type: z.string(),
  confidence: z.number().min(0).max(1),
  raw_input: z.string(),
});

// Payment intent schema (for backward compatibility)
export const PaymentIntentSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  recipient: z.string().nullable(),
  destination_country: z.string().nullable(),
  corridor: z.string().nullable(),
  urgency: z.enum(['standard', 'high']),
  confidence: z.number().min(0).max(1),
  reference: z.string().optional(),
  missing_fields: z.array(z.string()).optional(),
  clarification_needed: z.string().optional(),
});

// New intent schemas
const QueryTransactionIntentSchema = BaseIntentSchema.extend({
  type: z.literal('query_transaction'),
  transaction_type: z.enum(['last', 'recent', 'latest', 'first', 'oldest']).optional(),
  count: z.number().optional(),
  date_range: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  filters: z.object({
    recipient: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
});

const QueryStatusIntentSchema = BaseIntentSchema.extend({
  type: z.literal('query_status'),
  recipient: z.string().optional(),
  reference: z.string().optional(),
  transaction_id: z.string().optional(),
  payment_id: z.string().optional(),
  date: z.string().optional(),
});

const QueryBalanceIntentSchema = BaseIntentSchema.extend({
  type: z.literal('query_balance'),
  currency: z.string().optional(),
  account_type: z.string().optional(),
});

const QueryHistoryIntentSchema = BaseIntentSchema.extend({
  type: z.literal('query_history'),
  date_range: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  filters: z.object({
    recipient: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
  limit: z.number().optional(),
});

const QuerySearchIntentSchema = BaseIntentSchema.extend({
  type: z.literal('query_search'),
  search_term: z.string(),
  filters: z.object({
    recipient: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    date: z.string().optional(),
  }).optional(),
});

const QueryListIntentSchema = BaseIntentSchema.extend({
  type: z.literal('query_list'),
  entity_type: z.enum(['transactions', 'payments', 'recipients', 'accounts']),
  filters: z.object({
    status: z.string().optional(),
    currency: z.string().optional(),
    date: z.string().optional(),
  }).optional(),
  limit: z.number().optional(),
});

const PaymentIntentNewSchema = BaseIntentSchema.extend({
  type: z.literal('payment'),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  recipient: z.string().nullable(),
  destination_country: z.string().nullable(),
  corridor: z.string().nullable(),
  urgency: z.enum(['standard', 'high']),
  reference: z.string().optional(),
  missing_fields: z.array(z.string()).optional(),
  clarification_needed: z.string().optional(),
});

// Union of all intent types
export const ParsedIntentSchema = z.discriminatedUnion('type', [
  PaymentIntentNewSchema,
  QueryTransactionIntentSchema,
  QueryStatusIntentSchema,
  QueryBalanceIntentSchema,
  QueryHistoryIntentSchema,
  QuerySearchIntentSchema,
  QueryListIntentSchema,
]);

// Response schema (backward compatible - uses old PaymentIntent)
export const ParseResponseSchema = z.object({
  success: z.boolean(),
  intent: PaymentIntentSchema,
  raw_input: z.string(),
  parsed_at: z.string(),
});

// New response schema that supports all intent types
export const ParseResponseNewSchema = z.object({
  success: z.boolean(),
  intent: ParsedIntentSchema,
  raw_input: z.string(),
  parsed_at: z.string(),
});
