import api from './api';
import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface IikoSettings {
  organization_name: string;
  terminal_group_name: string;
  payment_type_name: string;
  last_synced_at: string;
  organization: number;
  terminal_group: number;
  payment_type: number;
}

export interface IikoSettingsUpdate {
  organization: number;
  terminal_group: number;
  payment_type: number;
}

export interface BusinessSettings {
  open_time: string;
  close_time: string;
  delivery_enabled: boolean;
  delivery_fee: string;
  instagram_url: string;
  phone: string;
}

export interface IikoOrganization {
  id: number;
  name: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  is_active: boolean;
}

export interface IikoTerminalGroup {
  id: number;
  organization_name: string;
  name: string;
  address: string;
  is_alive: boolean;
  organization: number;
}

export interface IikoPaymentType {
  id: number;
  name: string;
  code: string;
  payment_type_kind: 'Cash' | 'Card' | 'Credit' | 'Writeoff' | 'Voucher' | 'External' | 'IikoCard';
  is_deleted: boolean;
}

// Create resource hooks for organizations, terminal groups, and payment types
export const iikoOrganizationsApi = createResourceApiHooks<IikoOrganization>('/iiko-organizations/', 'iiko-organizations');
export const iikoTerminalGroupsApi = createResourceApiHooks<IikoTerminalGroup>('/iiko-terminal-groups/', 'iiko-terminal-groups');
export const iikoPaymentTypesApi = createResourceApiHooks<IikoPaymentType>('/iiko-payment-types/', 'iiko-payment-types');

// Settings endpoints (singleton resources, not collections)
export const getIikoSettings = async (): Promise<IikoSettings> => {
  const response = await api.get('/settings/iiko/');
  return response.data;
};

export const updateIikoSettings = async (data: IikoSettingsUpdate): Promise<IikoSettings> => {
  const response = await api.patch('/settings/iiko/', data);
  return response.data;
};

export const getBusinessSettings = async (): Promise<BusinessSettings> => {
  const response = await api.get('/settings/business/');
  return response.data;
};

export const updateBusinessSettings = async (data: Partial<BusinessSettings>): Promise<BusinessSettings> => {
  const response = await api.patch('/settings/business/', data);
  return response.data;
};
