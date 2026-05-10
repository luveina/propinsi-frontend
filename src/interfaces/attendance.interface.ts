export interface ParticipantResponse {
  gantangan_no: number;
  participant_id: string;
  participant_name: string;
  bird_type: string;
  phone_number: string;
  is_present: boolean;
  class: string;
}

export interface CheckInRequest {
  is_present: boolean;
}

export interface AttendanceFilters {
  eventId: string;
  keyword?: string;
  attendance_status?: 'present' | 'absent' | null;
}

export interface BaseResponse<T> {
  status: string;
  message: string;
  data: T;
}
