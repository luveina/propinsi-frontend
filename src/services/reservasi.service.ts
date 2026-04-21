import axios from 'axios';
import type { BaseResponse, GantanganItem, BookingRequest, BookingResponse } from '@/interfaces/reservasi.interface';

// Gunakan API URL yang dinamis dari env (Cara yang benar)
const API_URL = `${import.meta.env.VITE_API_URL}/reservasi`;

// Interface dari hasil pull temenmu
export interface ReservasiItem {
  id: string;
  namaPeserta: string;
  username: string;
  namaLomba: string;
  nomorGantangan: number;
  nominal: number;
  urlBukti: string;
  status: string;
  waktuReservasi: string;
  keteranganTolak?: string;
  rejectionCount: number;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

// ==========================================
// SCOPE: PESERTA (PBI KAMU)
// ==========================================

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

export const postUploadBukti = async (reservasiId: string, file: File): Promise<BaseResponse<any>> => {
  const formData = new FormData();
  formData.append('reservasiId', reservasiId);
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/upload-bukti`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  return response.data;
};

// ==========================================
// SCOPE: KOORDINATOR / ADMIN (HASIL PULL)
// ==========================================

export const getAllReservasi = async (): Promise<ReservasiItem[]> => {
  try {
    // Tambah AuthHeader agar request tidak ditolak (401/403) oleh Spring Security
    const response = await axios.get(`${API_URL}/all`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reservasi:", error);
    throw error;
  }
};

export const verifyReservasi = async (id: string, status: 'PAID' | 'Invalid' | 'REJECTED', komentar?: string) => {
  try {
    // Tambah AuthHeader karena ini aksi khusus Koordinator
    const response = await axios.patch(`${API_URL}/verify/${id}`, { status, komentar }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying reservasi:", error);
    throw error;
  }
};
