import axios from 'axios';
import type { ParticipantResponse, CheckInRequest, BaseResponse } from '@/interfaces/attendance.interface';

const API_URL = `${import.meta.env.VITE_API_URL}/events`;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const getParticipants = async (
  eventId: string,
  keyword?: string,
  attendanceStatus?: string
): Promise<ParticipantResponse[]> => {
  try {
    const params: Record<string, string> = {};

    if (keyword) {
      params.keyword = keyword;
    }

    if (attendanceStatus) {
      params.attendance_status = attendanceStatus;
    }

    const response = await axios.get<BaseResponse<ParticipantResponse[]>>(
      `${API_URL}/${eventId}/participants`,
      {
        params,
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMessage = error.response?.data?.message;
      throw serverMessage || 'Gagal mengambil data peserta';
    }
    throw 'Terjadi kesalahan sistem yang tidak diketahui';
  }
};

export const checkIn = async (participantId: string, isPresent: boolean): Promise<ParticipantResponse> => {
  try {
    const payload: CheckInRequest = {
      is_present: isPresent,
    };

    const response = await axios.put<BaseResponse<ParticipantResponse>>(
      `${API_URL}/participants/${participantId}/check-in`,
      payload,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMessage = error.response?.data?.message;
      throw serverMessage || 'Gagal mengubah status kehadiran';
    }
    throw 'Terjadi kesalahan sistem yang tidak diketahui';
  }
};
