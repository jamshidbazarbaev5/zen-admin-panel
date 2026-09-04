import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Customer {
  id?: number;
  telegram_id: number;
  name: string;
  phone: string;
  lang: string;
  balance: string;
  deposit_balance: string;
  total_spent: string;
  is_active: boolean;
  orders_count: number;
  created_at: string;
  updated_at: string;
  last_order_at: string | null;
  current_tier_name: string | null;
  date_of_birth: string | null;
  gender: string;
}

export interface CustomerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

const CUSTOMER_URL = '/customers/';

export const {
  useGetResources: useGetCustomers,
  useGetResource: useGetCustomer,
  useCreateResource: useCreateCustomer,
  useUpdateResource: useUpdateCustomer,
  useDeleteResource: useDeleteCustomer,
} = createResourceApiHooks<Customer, CustomerResponse>(CUSTOMER_URL, 'customers');
