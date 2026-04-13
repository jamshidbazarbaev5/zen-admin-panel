import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface Attendance {
  id: number;
  staff: number;
  staff_name: string;
  staff_position: string;
  event: 'in' | 'out';
  event_display: string;
  timestamp: string;
  created_at: string;
}

export interface AttendanceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Attendance[];
}

const ATTENDANCE_URL = '/attendance/';

export const {
  useGetResources: useGetAttendance,
} = createResourceApiHooks<Attendance, AttendanceResponse>(ATTENDANCE_URL, 'attendance');
