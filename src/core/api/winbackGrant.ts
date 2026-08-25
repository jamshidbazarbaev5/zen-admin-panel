import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface WinbackGrant {
  id: number;
  program_name: string;
  customer_name: string;
  customer_phone: string;
  voucher_code: string;
  voucher_status: string;
  step_order: number;
  last_order_at_snapshot: string;
  granted_at: string;
  program: number;
  step: number;
  customer: number;
  voucher: number;
  returned?: boolean;
  customer_id?: number;
}

export interface WinbackGrantResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WinbackGrant[];
}

const WINBACK_GRANTS_URL = '/winback-grants/';

export const {
  useGetResources: useGetWinbackGrants,
  useGetResource: useGetWinbackGrant,
} = createResourceApiHooks<WinbackGrant, WinbackGrantResponse>(WINBACK_GRANTS_URL, 'winback-grants');
