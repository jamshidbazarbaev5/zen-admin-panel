import api from './api';

export interface BusinessSettings {
  open_time: string;
  close_time: string;
  delivery_enabled: boolean;
  delivery_fee: string;
  instagram_url: string;
  phone: string;
}

export const businessSettingsApi = {
  get: () => api.get<BusinessSettings>('/settings/business/'),
  update: (data: Partial<BusinessSettings>) => api.patch<BusinessSettings>('/settings/business/', data),
};
