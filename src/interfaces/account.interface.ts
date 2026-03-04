export interface AccountRequest {
  namaLengkap: string;
  username: string;
  nomorWhatsapp: string;
  role: string;
}

export interface AccountResponse {
  id: number;
  username: string;
  namaLengkap: string;
  nomorWhatsapp: string;
  role: string;
  createdAt: string;
}