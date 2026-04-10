import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Payment {
  id?: number;
  order_number: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: string;
  rahmat_invoice_id: string;
  rahmat_payment_url: string;
  rahmat_trans_id: string;
  created_at: string;
  updated_at: string;
  order: number;
}

export interface PaymentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Payment[];
}

const PAYMENT_URL = '/payments/';

export const {
  useGetResources: useGetPayments,
  useGetResource: useGetPayment,
  useCreateResource: useCreatePayment,
  useUpdateResource: useUpdatePayment,
  useDeleteResource: useDeletePayment,
} = createResourceApiHooks<Payment, PaymentResponse>(PAYMENT_URL, 'payments');
