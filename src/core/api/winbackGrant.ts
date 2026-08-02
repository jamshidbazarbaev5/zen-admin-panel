import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface WinbackGrant {
  id: number;
  program: number;
  customer: number;
  step_order: number;
  voucher: number;
  created_at: string;
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
