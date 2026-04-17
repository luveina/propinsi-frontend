import axios from 'axios';
import type { LombaRequest, AssignJuriRequest, LombaDetailResponse } from '@/interfaces/lomba.interface';

const API_URL = `${import.meta.env.VITE_API_URL}/lomba`;

/**
 * Get authorization headers from localStorage
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

export const postCreateLomba = async (payload: LombaRequest) => {
  const response = await axios.post(API_URL, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const putUpdateLomba = async (id: string, payload: LombaRequest) => {
  const response = await axios.put(`${API_URL}/${id}`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getLombaById = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getAvailableJuri = async () => {
  const response = await axios.get(`${API_URL}/available-juri`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const postAssignJuri = async (lombaId: string, payload: AssignJuriRequest) => {
  const response = await axios.post(`${API_URL}/${lombaId}/assign-juri`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export interface LombaFilterParams {
  jenisBurung?: string
  status?: string
  sortBy?: string
  sortDir?: string
}

export interface LombaItem {
  id: string
  namaLomba: string
  lokasi: string
  waktuTanggal: string
  jenisBurung: string
  kelas: string
  hargaTiket: number
  status: string
  contactPerson: string
  jumlahJuri: number
  jumlahJuara: number
  hadiah: number[]
  listJuri?: Array<{
    id: number
    username: string
    fullName: string
    role: string
  }>
  deskripsi: string
}

export const getAllLomba = async (params?: LombaFilterParams) => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

export const deleteLomba = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getLombaDetail = async (id: string): Promise<LombaDetailResponse> => {
  const response = await axios.get(`${API_URL}/detail/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Fungsi untuk koordinator mengubah status ke "BERLANGSUNG"
export const updateLombaStatus = async (id: string, status: string) => {
  const response = await axios.patch(`${API_URL}/${id}/status`, { status }, {
    headers: getAuthHeaders()
  });
  return response.data;
};
