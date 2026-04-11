import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Organization {
  id?: number;
  name: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  is_active: boolean;
}

export interface OrganizationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Organization[];
}

const ORGANIZATION_URL = '/iiko-organizations/';

export const {
  useGetResources: useGetOrganizations,
  useGetResource: useGetOrganization,
  useCreateResource: useCreateOrganization,
  useUpdateResource: useUpdateOrganization,
  useDeleteResource: useDeleteOrganization,
} = createResourceApiHooks<Organization, OrganizationResponse>(ORGANIZATION_URL, 'organizations');
