import axios from 'axios';

const API_URL = 'http://localhost:8080/api/profile';

export const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updatePassword = async (payload: any) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/password`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};