import axios from 'axios';
import type { BaseResponse, GantanganItem, BookingRequest, BookingResponse } from '@/interfaces/reservasi.interface';

const API_URL = `${import.meta.env.VITE_API_URL}/reservasi`;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

export const getDenahGantangan = async (lombaId: string): Promise<BaseResponse<GantanganItem[]>> => {
  const response = await axios.get(`${API_URL}/denah/${lombaId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const postBookSeat = async (payload: BookingRequest): Promise<BaseResponse<BookingResponse>> => {
  const response = await axios.post(`${API_URL}/book-seat`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
};