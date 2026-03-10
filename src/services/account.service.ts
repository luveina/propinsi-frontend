import axios, { AxiosError } from 'axios';
import type { AccountRequest } from '@/interfaces/account.interface';

const API_URL = `${import.meta.env.VITE_API_URL}/accounts`;

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

/**
 * Service untuk mengirim data pendaftaran akun baru ke Backend.
 * @param payload - Data akun (nama, username, telp, role)
 */
export const postCreateAccount = async (payload: AccountRequest): Promise<any> => {
  try {
    const response = await axios.post(API_URL, payload, {
      headers: getAuthHeaders()
    });
    
    // response.data is BaseResponse<User>; return inner data if needed
    return response.data.data;
  } catch (error: unknown) {
    // Menangani error dari Axios secara spesifik agar tidak muncul error 'unknown'
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      // Mengambil pesan error dari backend
      const serverMessage = axiosError.response?.data;
      
      // Melempar kembali error agar bisa ditangkap oleh komponen UI (Modal)
      throw serverMessage || 'Terjadi kesalahan pada server';
    }
    
    // Jika error bukan dari Axios
    throw 'Terjadi kesalahan sistem yang tidak diketahui';
  }
};
// Tambahkan ini di bawah fungsi POST yang kemarin
export const getAllAccounts = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeaders()
    });
    // unwrap wrapper
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data akun", error);
    throw error;
  }
};

export const updateAccount = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: getAuthHeaders()
    });
    return response.data.data;
  } catch (error) {
    console.error("Gagal update akun", error);
    throw error;
  }
};

export const deleteAccount = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus akun", error);
    throw error;
  }
};

export const resetPasswordAccount = async (id: number): Promise<any> => {
  const token = localStorage.getItem('token'); // Ambil token dari storage
  try {
    const response = await axios.put(`${API_URL}/${id}/reset`, {}, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || 'Gagal mereset password';
    }
    throw 'Terjadi kesalahan sistem';
  }
};