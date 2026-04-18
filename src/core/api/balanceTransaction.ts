import { createResourceApiHooks } from '../helpers/createResourceApi';

export type BalanceTransactionType = 'deposit' | 'cashback' | 'spend';

export interface BalanceTransaction {
  id?: number;
  customer_name: string;
  order_number: string | null;
  amount: string;
  tx_type: BalanceTransactionType;
  note: string;
  created_at: string;
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
