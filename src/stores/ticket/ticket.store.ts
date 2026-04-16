/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ticket } from '@/interfaces/ticket.interface'

const BASE_URL = `${import.meta.env.VITE_API_URL}/profile`

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref<Ticket[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyTickets() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/my-tickets`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal memuat tiket')

      // Map response BE → shape Ticket interface di FE
      tickets.value = data.map((item: any) => ({
        id: item.id,
        nama_lomba: item.namaLomba,
        tanggal: item.tanggal,
        lokasi: item.lokasi,
        jenis_burung: item.jenisBurung,
        kelas: item.kelas,
        status: item.status,
        keterangan_tolak: item.keteranganTolak ?? null,
        can_reupload: item.canReupload,
        blok: item.blok ?? null,
        nomor_gantangan: item.nomorGantangan ?? null,
        created_at: item.waktuReservasi ?? '',
      }))
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    tickets,
    loading,
    error,
    fetchMyTickets,
    clearError,
  }
})
