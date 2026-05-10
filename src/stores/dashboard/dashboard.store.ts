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

  async function fetchAnalytics(startDate: string, endDate: string, jenisBurung?: string, kelas?: string) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
      if (jenisBurung) params.set('jenis_burung', jenisBurung.replace(/ /g, '_').toUpperCase())
      if (kelas) params.set('kelas', kelas)
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

  return { analytics, loading, error, fetchAnalytics, clearError }
})
