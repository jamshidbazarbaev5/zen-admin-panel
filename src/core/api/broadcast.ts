import { createResourceApiHooks } from '../helpers/createResourceApi';
import api from './api';

export interface Broadcast {
  id: number;
  text: string;
  media: string | null;
  media_type: 'photo' | 'video';
  target: 'all' | 'active';
  sent_at: string | null;
  status: 'draft' | 'sent' | 'done';
  sent_count: number;
  created_at: string;
}


export interface BroadcastFormData {
  text: string;
  media?: File | null;
  media_type: 'photo' | 'video';
  target: 'all' | 'active';
}

const broadcastApi = createResourceApiHooks<Broadcast>('/broadcasts/', 'broadcasts');

export const sendBroadcast = async (id: number): Promise<Broadcast> => {
  const response = await api.post(`/broadcasts/${id}/send/`);
  return response.data;
};

export default broadcastApi;
