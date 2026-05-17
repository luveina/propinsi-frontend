/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AnalyticsData } from '@/interfaces/dashboard.interface'

const BASE_URL = `${import.meta.env.VITE_API_URL}/dashboard`

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export const useDashboardStore = defineStore('dashboard', () => {
  const analytics = ref<AnalyticsData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAnalytics(startDate: string, endDate: string, jenisBurung?: string[], kelas?: string[]) {
    const dateError = validateDateRange(startDate, endDate)
    if (dateError) {
      error.value = dateError
      return
    }

    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
      if (jenisBurung && jenisBurung.length > 0) {
        jenisBurung.forEach(jb => params.append('jenis_burung', jb.replace(/ /g, '_').toUpperCase()))
      }
      if (kelas && kelas.length > 0) {
        kelas.forEach(k => params.append('kelas', k))
      }
      const res = await fetch(`${BASE_URL}/analytics?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal memuat data analytics')

      const d = json.data

      const mapTrend = (arr: any[]) =>
        (arr ?? []).map((t: any) => ({ tanggal: t.tanggal, jumlah: Number(t.jumlah) }))

      const mapClass = (arr: any[]) =>
        (arr ?? []).map((c: any) => ({
          kelas: c.kelas,
          persentase: c.persentase,
          jumlah: Number(c.jumlah ?? 0),
          dailyBreakdown: mapTrend(c.dailyBreakdown ?? []),
        }))

      const mapBird = (arr: any[]) =>
        (arr ?? []).map((b: any) => ({
          jenisBurung: b.jenisBurung,
          persentase: b.persentase,
          jumlah: Number(b.jumlah ?? 0),
          dailyBreakdown: mapTrend(b.dailyBreakdown ?? []),
        }))

      analytics.value = {
        totalTiketTerjual: Number(d.totalTiketTerjual ?? 0),
        totalRevenue: Number(d.totalRevenue ?? 0),
        occupancyRate: Number(d.occupancyRate ?? 0),
        attendanceRate: Number(d.attendanceRate ?? 0),
        top5Classes: mapClass(d.top5Classes),
        top5BirdTypes: mapBird(d.top5BirdTypes),
        trendData: mapTrend(d.trendData),
        allClasses: mapClass(d.allClasses),
        allBirdTypes: mapBird(d.allBirdTypes),
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function validateDateRange(startDate: string, endDate: string): string | null {
    if (!startDate || !endDate) {
      return 'Tanggal mulai dan tanggal akhir wajib diisi'
    }

    if (startDate > endDate) {
      return 'Tanggal mulai tidak boleh lebih dari tanggal akhir'
    }

    return null
  }

  return { analytics, loading, error, fetchAnalytics, clearError }
})
