import api from './api';

export interface RegistrationGiftSettings {
  is_active: boolean;
  amount: string;
  expiry_hours: number | null;
  updated_at?: string;
}

export const registrationGiftApi = {
  get: () => api.get<RegistrationGiftSettings>('/settings/registration-gift/'),
  update: (data: Partial<RegistrationGiftSettings>) => api.patch<RegistrationGiftSettings>('/settings/registration-gift/', data),
};
