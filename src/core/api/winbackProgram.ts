import { useQuery } from '@tanstack/react-query';
import { createResourceApiHooks } from '../helpers/createResourceApi';
import api from './api';

export interface WinbackStep {
  id?: number;
  order: number;
  trigger_after_days: number;
  amount: string;
  expiry_hours: number | null;
  message?: string;
  is_auto_credited?: boolean;
}

export interface WinbackProgram {
  id?: number;
  name: string;
  is_active: boolean;
  steps: WinbackStep[];
  created_at?: string;
  updated_at?: string;
}

export interface WinbackProgramResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WinbackProgram[];
}

export interface FunnelStep {
  step_id: number;
  order: number;
  trigger_after_days: number;
  amount: string;
  is_auto_credited: boolean;
  total_grants: number;
  redeemed: number;
  redemption_rate: number;
  expired: number;
  returned: number;
  return_rate: number;
}

export interface WinbackFunnel {
  program: {
    id: number;
    name: string;
  };
  steps: FunnelStep[];
}

const WINBACK_PROGRAMS_URL = '/winback-programs/';

export const {
  useGetResources: useGetWinbackPrograms,
  useGetResource: useGetWinbackProgram,
  useCreateResource: useCreateWinbackProgram,
  useUpdateResource: useUpdateWinbackProgram,
  useDeleteResource: useDeleteWinbackProgram,
} = createResourceApiHooks<WinbackProgram, WinbackProgramResponse>(WINBACK_PROGRAMS_URL, 'winback-programs');

export const useGetWinbackFunnel = (programId: number | null) => {
  return useQuery<WinbackFunnel>({
    queryKey: ['winback-programs', programId, 'funnel'],
    queryFn: async () => {
      const response = await api.get<WinbackFunnel>(`/winback-programs/${programId}/funnel/`);
      return response.data;
    },
    enabled: !!programId,
  });
};
