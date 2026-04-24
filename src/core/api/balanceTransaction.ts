import { createResourceApiHooks } from '../helpers/createResourceApi';

export type BalanceTransactionType =
  | 'deposit_topup'
  | 'deposit_spent'
  | 'cashback_earned'
  | 'cashback_spent'
  | 'other';

export interface BalanceTransaction {
  id?: number;
  customer_name: string;
  order_number: string | null;
  tx_type_display: string;
  channel_display: string;
  iiko_transaction_id: string | null;
  iiko_revision: number | null;
  iiko_wallet_id: string | null;
  iiko_type_raw: number | null;
  tx_type: BalanceTransactionType | string;
  channel: string;
  amount: string;
  balance_after: string;
  iiko_pos_order_id: string;
  iiko_order_number: number | null;
  order_sum: string | null;
  tier_at_time: string;
  note: string;
  created_at: string;
  synced_at: string;
  customer: number;
  order: number | null;
}

export interface BalanceTransactionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BalanceTransaction[];
}

const BALANCE_TRANSACTION_URL = '/balance-transactions/';

export const {
  useGetResources: useGetBalanceTransactions,
} = createResourceApiHooks<BalanceTransaction, BalanceTransactionResponse>(
  BALANCE_TRANSACTION_URL,
  'balanceTransactions'
);
