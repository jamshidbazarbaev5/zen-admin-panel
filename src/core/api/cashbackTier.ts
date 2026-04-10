import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface CashbackTier {
  id?: number;
  name: string;
  min_spent: string;
  max_spent: string | null;
  percent: string;
}

export interface CashbackTierResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CashbackTier[];
}

const CASHBACK_TIER_URL = '/cashback-tiers/';

export const {
  useGetResources: useGetCashbackTiers,
  useGetResource: useGetCashbackTier,
  useCreateResource: useCreateCashbackTier,
  useUpdateResource: useUpdateCashbackTier,
  useDeleteResource: useDeleteCashbackTier,
} = createResourceApiHooks<CashbackTier, CashbackTierResponse>(CASHBACK_TIER_URL, 'cashbackTiers');
