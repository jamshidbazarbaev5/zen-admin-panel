import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface WinbackStep {
  order: number;
  trigger_after_days: number;
  amount: string;
  expiry_hours: number | null;
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

const WINBACK_PROGRAMS_URL = '/winback-programs/';

export const {
  useGetResources: useGetWinbackPrograms,
  useGetResource: useGetWinbackProgram,
  useCreateResource: useCreateWinbackProgram,
  useUpdateResource: useUpdateWinbackProgram,
  useDeleteResource: useDeleteWinbackProgram,
} = createResourceApiHooks<WinbackProgram, WinbackProgramResponse>(WINBACK_PROGRAMS_URL, 'winback-programs');
