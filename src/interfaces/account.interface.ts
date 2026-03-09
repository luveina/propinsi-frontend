export interface AccountRequest {
  fullName: string;
  username: string;
  phoneNumber: string;
  role: string;
}

export interface AccountResponse {
  id: number;
  username: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}