export interface LombaRequest {
  namaLomba: string;
  lokasi: string;
  waktuTanggal: string;
  jenisBurung: string;
  kelas: string;
  hargaTiket: number;
  hadiah: number[];
  jumlahJuri: number;
  contactPerson: string;
}

export interface UserSummary {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface AssignJuriRequest {
  juriIds: number[];
}

export interface LombaDetailResponse {
  id: string;
  namaLomba: string;
  deskripsi: string;
  lokasi: string;
  waktuTanggal: string;
  jenisBurung: string;
  kelas: string;
  hargaTiket: number;
  hadiah: number[];
  jumlahGantangan: number;
  listGantangan: any[]; // Tambahkan ini
  jumlahJuri: number;
  listJuri: { id: number; fullName: string; role: string }[];
  contactPerson: string;
  status: string;
  isEditable: boolean;
  isReservable: boolean;
  canToggleOngoing: boolean;
  canStartJudging: boolean;
  isFullBooked: boolean;
  canViewWinner: boolean;
}