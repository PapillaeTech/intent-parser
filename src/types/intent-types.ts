/**
 * Intent type definitions for different query types
 */

export type IntentType = 
  | 'payment' 
  | 'query_transaction' 
  | 'query_status' 
  | 'query_balance' 
  | 'query_history' 
  | 'query_search'
  | 'query_list'
  | 'unknown';

export interface BaseIntent {
  type: IntentType;
  confidence: number;
  raw_input: string;
}

export interface PaymentIntent extends BaseIntent {
  type: 'payment';
  amount: number | null;
  currency: string | null;
  recipient: string | null;
  destination_country: string | null;
  corridor: string | null;
  urgency: 'standard' | 'high';
  reference?: string;
  missing_fields?: string[];
  clarification_needed?: string;
}

export interface QueryTransactionIntent extends BaseIntent {
  type: 'query_transaction';
  transaction_type?: 'last' | 'recent' | 'latest' | 'first' | 'oldest';
  count?: number;
  date_range?: {
    start?: string;
    end?: string;
  };
  filters?: {
    recipient?: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
}

export interface QueryStatusIntent extends BaseIntent {
  type: 'query_status';
  recipient?: string;
  reference?: string;
  transaction_id?: string;
  payment_id?: string;
  date?: string;
}

export interface QueryBalanceIntent extends BaseIntent {
  type: 'query_balance';
  currency?: string;
  account_type?: string;
}

export interface QueryHistoryIntent extends BaseIntent {
  type: 'query_history';
  date_range?: {
    start?: string;
    end?: string;
  };
  filters?: {
    recipient?: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
  limit?: number;
}

export interface QuerySearchIntent extends BaseIntent {
  type: 'query_search';
  search_term: string;
  filters?: {
    recipient?: string;
    amount?: number;
    currency?: string;
    date?: string;
  };
}

export interface QueryListIntent extends BaseIntent {
  type: 'query_list';
  entity_type: 'transactions' | 'payments' | 'recipients' | 'accounts';
  filters?: {
    status?: string;
    currency?: string;
    date?: string;
  };
  limit?: number;
}

export type ParsedIntent = 
  | PaymentIntent 
  | QueryTransactionIntent 
  | QueryStatusIntent 
  | QueryBalanceIntent 
  | QueryHistoryIntent 
  | QuerySearchIntent 
  | QueryListIntent;
