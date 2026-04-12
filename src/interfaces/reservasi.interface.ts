export interface GantanganItem {
  nomorGantangan: number;
  status: 'AVAILABLE' | 'BOOKED' | 'PAID';
}

export interface BookingRequest {
  lombaId: string;
  nomorGantangan: number;
}

export interface BookingResponse {
  reservationId: string;
}

export interface BaseResponse<T> {
  status: number;
  message: string;
  data: T;
}