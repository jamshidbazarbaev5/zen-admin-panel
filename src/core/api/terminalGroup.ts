import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface TerminalGroup {
  id?: number;
  organization_name: string;
  name: string;
  address: string;
  is_alive: boolean;
  organization: number;
}

export interface TerminalGroupResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TerminalGroup[];
}

const TERMINAL_GROUP_URL = '/iiko-terminal-groups/';

export const {
  useGetResources: useGetTerminalGroups,
  useGetResource: useGetTerminalGroup,
  useCreateResource: useCreateTerminalGroup,
  useUpdateResource: useUpdateTerminalGroup,
  useDeleteResource: useDeleteTerminalGroup,
} = createResourceApiHooks<TerminalGroup, TerminalGroupResponse>(TERMINAL_GROUP_URL, 'terminalGroups');
