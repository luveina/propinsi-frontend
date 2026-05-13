export interface GantanganItem {
  nomorGantangan: number
  status: 'AVAILABLE' | 'BOOKED' | 'PAID'
}

export interface BookingRequest {
  lombaId: string
  nomorGantangan: number
}

export interface BookingResponse {
  reservationId: string
}

export interface BaseResponse<T> {
  status: number
  message: string
  data: T
}
export interface GantanganItem {
  nomorGantangan: number
  status: 'AVAILABLE' | 'BOOKED' | 'PAID'
}

export interface BookingRequest {
  lombaId: string
  nomorGantangan: number
}

export interface BookingResponse {
  reservationId: string
}

export interface BaseResponse<T> {
  status: number
  message: string
  data: T
}

export interface ReservasiResponse {
  id: string
  namaPeserta: string
  username: string
  namaLomba: string
  nomorGantangan: number
  nominal: number
  urlBukti: string
  status: string
  waktuReservasi: string
}
