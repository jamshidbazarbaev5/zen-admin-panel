import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface PaymentType {
  id?: number;
  name: string;
  code: string;
  payment_type_kind: 'Cash' | 'Card' | 'IikoCard';
  is_deleted: boolean;
}

export interface PaymentTypeResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentType[];
}

const PAYMENT_TYPE_URL = '/iiko-payment-types/';

export const {
  useGetResources: useGetPaymentTypes,
  useGetResource: useGetPaymentType,
  useCreateResource: useCreatePaymentType,
  useUpdateResource: useUpdatePaymentType,
  useDeleteResource: useDeletePaymentType,
} = createResourceApiHooks<PaymentType, PaymentTypeResponse>(PAYMENT_TYPE_URL, 'paymentTypes');
