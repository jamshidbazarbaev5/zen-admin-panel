import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createResourceApiHooks } from '../helpers/createResourceApi';
import api from './api';

export interface Staff {
  id?: number;
  device?: number;
  device_name?: string;
  hikvision_id: number;
  name: string;
  position: 'barista' | 'cook' | 'waiter' | 'cashier' | 'admin' | '';
  is_active: boolean;
  username?: string | null;
  password?: string;
  created_at?: string;
  is_at_work?: boolean;
  at_work_since?: string | null;
}

export interface StaffResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Staff[];
}

const STAFF_URL = '/staff/';

export const {
  useGetResources: useGetStaff,
  useGetResource: useGetStaffMember,
  useCreateResource: useCreateStaff,
  useDeleteResource: useDeleteStaff,
} = createResourceApiHooks<Staff, StaffResponse>(STAFF_URL, 'staff');

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Staff> & { id: number }) => {
      const { id, ...body } = payload;
      const response = await api.patch<Staff>(`${STAFF_URL}${id}/`, body);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['staff', data.id] });
      }
    },
  });
};

export const useSetStaffPassword = () => {
  return async (id: number, password: string) => {
    const response = await api.post(`${STAFF_URL}${id}/set-password/`, { password });
    return response.data;
  };
};
