import { createResourceApiHooks } from '../helpers/createResourceApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

export interface ModifierGroup {
  id?: number;
  iiko_id: string;
  name_ru: string;
  name_uz: string;
  name_kaa: string;
  name_en: string;
  is_active: boolean;
  order: number;
  modifiers_count?: number;
}

export interface ModifierGroupResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ModifierGroup[];
}

export interface ModifierGroupBulkUpdate {
  id: number;
  order: number;
  is_active: boolean;
}

export interface Modifier {
  id?: number;
  modifier_group: number;
  iiko_id: string;
  name_ru: string;
  name_uz: string;
  name_kaa: string;
  name_en: string;
  price: string;
  is_active: boolean;
  order: number;
}

export interface ModifierBulkUpdate {
  id: number;
  order: number;
  is_active: boolean;
}

const MODIFIER_GROUP_URL = '/modifier-groups/';
const MODIFIER_URL = '/modifiers/';

export const {
  useGetResources: useGetModifierGroups,
  useGetResource: useGetModifierGroup,
  useCreateResource: useCreateModifierGroup,
  useUpdateResource: useUpdateModifierGroup,
  useDeleteResource: useDeleteModifierGroup,
} = createResourceApiHooks<ModifierGroup, ModifierGroupResponse>(MODIFIER_GROUP_URL, 'modifierGroups');

export const useBulkUpdateModifierGroups = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: ModifierGroupBulkUpdate[]) => {
      const response = await api.post(`${MODIFIER_GROUP_URL}bulk-update/`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifierGroups'] });
    },
  });
};

export const useBulkUpdateModifiers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: ModifierBulkUpdate[]) => {
      const response = await api.post(`${MODIFIER_URL}bulk-update/`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
    },
  });
};
