import { createResourceApiHooks } from '../helpers/createResourceApi';

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

const MODIFIER_GROUP_URL = '/modifier-groups/';

export const {
  useGetResources: useGetModifierGroups,
  useGetResource: useGetModifierGroup,
  useCreateResource: useCreateModifierGroup,
  useUpdateResource: useUpdateModifierGroup,
  useDeleteResource: useDeleteModifierGroup,
} = createResourceApiHooks<ModifierGroup, ModifierGroupResponse>(MODIFIER_GROUP_URL, 'modifierGroups');
