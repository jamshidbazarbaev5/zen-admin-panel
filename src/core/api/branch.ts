import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Branch {
  id?: number;
  organization: number;
  organization_name?: string;
  terminal_group: number;
  terminal_group_name?: string;
  name: string;
  address: string;
  latitude: number | string | null;
  longitude: number | string | null;
  is_active: boolean;
}

export interface BranchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

const BRANCH_URL = '/branches/';

export const {
  useGetResources: useGetBranches,
  useGetResource: useGetBranch,
  useCreateResource: useCreateBranch,
  useUpdateResource: useUpdateBranch,
  useDeleteResource: useDeleteBranch,
} = createResourceApiHooks<Branch, BranchResponse>(BRANCH_URL, 'branches');
