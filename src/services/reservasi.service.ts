import axios from 'axios';

const API_URL = 'http://localhost:8080/api/';

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
}

export const getAllReservasi = async (): Promise<ReservasiItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reservasi:", error);
    throw error;
  }
};

export const verifyReservasi = async (id: string, status: 'PAID' | 'REJECTED') => {
  try {
    const response = await axios.patch(`${API_URL}/verify/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error verifying reservasi:", error);
    throw error;
  }
};
