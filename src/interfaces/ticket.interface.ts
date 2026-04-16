export interface Ticket {
  id: string
  nama_lomba: string
  tanggal: string
  lokasi: string
  jenis_burung: string
  kelas: string
  status: 'Paid' | 'Unpaid' | 'Menunggu Konfirmasi' | 'Invalid'
  keterangan_tolak: string | null
  can_reupload: boolean
  created_at: string

  // Hanya ada jika status === 'Paid'
  blok: number | null
  nomor_gantangan: number | null
}
