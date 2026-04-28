import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';

export interface Policy {
  policy: string;
}

const POLICY_URL = '/policy/';
const POLICY_KEY = 'policy';

export const useGetPolicy = () => {
  return useQuery({
    queryKey: [POLICY_KEY],
    queryFn: async () => {
      const response = await api.get<Policy>(POLICY_URL);
      return response.data;
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Policy) => {
      const response = await api.patch<Policy>(POLICY_URL, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POLICY_KEY] });
    },
  });
};
