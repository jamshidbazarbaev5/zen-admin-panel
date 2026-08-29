import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

export interface FailedPaymentCustomer {
  id: number;
  name: string;
  phone: string;
  telegram_id: number;
  deposit_balance: number;
  iiko_linked: boolean;
}

export interface FailedPaymentResolvedBy {
  id: number;
  username: string;
}

export interface FailedPayment {
  type: 'order' | 'deposit' | 'voucher';
  id: number;
  reference: string;
  customer: FailedPaymentCustomer;
  amount: string;
  reason: string;
  failed_at: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: FailedPaymentResolvedBy | null;
  resolution_method: 'balance_credit' | 'cash' | null;
  resolve_error: string;
}

export interface FailedPaymentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FailedPayment[];
}

export const useGetFailedPayments = (params: Record<string, any>) => {
  return useQuery<FailedPaymentResponse>({
    queryKey: ['failed-payments', params],
    queryFn: async () => {
      const response = await api.get<FailedPaymentResponse>('/failed-payments/', { params });
      return response.data;
    },
  });
};

export const useResolveFailedPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemType, itemId, method }: { itemType: string; itemId: number; method: 'balance_credit' | 'cash' }) =>
      api.post(`/failed-payments/${itemType}/${itemId}/resolve/`, { method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['failed-payments'] });
    },
  });
};
