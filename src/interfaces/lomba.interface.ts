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
  deskripsi?: string;
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
