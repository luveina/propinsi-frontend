export interface Ticket {
  id: string
  nama_lomba: string
  tanggal: string
  lokasi: string
  jenis_burung: string
  kelas: string
  status: 'Paid' | 'Unpaid' | 'Menunggu Konfirmasi' | 'Invalid' | 'Expired'
  keterangan_tolak: string | null
  can_reupload: boolean
  nominal: number

  waktu_reservasi: string

  blok: number | null
  nomor_gantangan: number | null
}
