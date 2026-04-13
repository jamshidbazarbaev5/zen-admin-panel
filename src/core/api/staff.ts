import { createResourceApiHooks } from '../helpers/createResourceApi';
import api from './api';

export interface Staff {
  id?: number;
  hikvision_id: number;
  name: string;
  position: 'barista' | 'cook' | 'waiter' | 'cashier' | 'admin';
  is_active: boolean;
  username?: string;
  password?: string;
  created_at?: string;
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
  useUpdateResource: useUpdateStaff,
  useDeleteResource: useDeleteStaff,
} = createResourceApiHooks<Staff, StaffResponse>(STAFF_URL, 'staff');

export const useSetStaffPassword = () => {
  return async (id: number, password: string) => {
    const response = await api.post(`${STAFF_URL}${id}/set-password/`, { password });
    return response.data;
  };
};
