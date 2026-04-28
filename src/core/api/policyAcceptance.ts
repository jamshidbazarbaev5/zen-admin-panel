import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface PolicyAcceptance {
  id?: number;
  customer: number;
  customer_name: string;
  customer_phone: string;
  accepted_at: string;
}

export interface PolicyAcceptanceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PolicyAcceptance[];
}

const POLICY_ACCEPTANCE_URL = '/policy-acceptances/';

export const {
  useGetResources: useGetPolicyAcceptances,
  useGetResource: useGetPolicyAcceptance,
  useCreateResource: useCreatePolicyAcceptance,
  useUpdateResource: useUpdatePolicyAcceptance,
  useDeleteResource: useDeletePolicyAcceptance,
} = createResourceApiHooks<PolicyAcceptance, PolicyAcceptanceResponse>(
  POLICY_ACCEPTANCE_URL,
  'policyAcceptances',
);
