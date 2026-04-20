import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface AttendanceEvent {
  timestamp: string;
  photo: string | null;
}

export interface AttendanceSession {
  id: number;
  staff: number;
  staff_name: string;
  staff_position: string;
  check_in: AttendanceEvent | null;
  check_out: AttendanceEvent | null;
  duration_seconds: number | null;
  duration_display: string | null;
  is_open: boolean;
}

export interface AttendanceSessionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AttendanceSession[];
}

const ATTENDANCE_SESSIONS_URL = '/attendance/sessions/';

export const {
  useGetResources: useGetAttendanceSessions,
} = createResourceApiHooks<AttendanceSession, AttendanceSessionResponse>(
  ATTENDANCE_SESSIONS_URL,
  'attendanceSessions'
);
