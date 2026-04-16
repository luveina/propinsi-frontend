<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { getAllReservasi, verifyReservasi, type ReservasiItem } from '@/services/reservasi.service'
import { getAllLomba } from '@/services/lomba.service'

const authStore = useAuthStore()

const reservasiList = ref<ReservasiItem[]>([])
const lombaOptions = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterLomba = ref('')
const filterStatus = ref('')
const sortBy = ref('date-desc')

const notification = ref('')
const notificationType = ref<'success' | 'error'>('success')

// State untuk Modal Lihat Bukti (Gambar)
const isModalOpen = ref(false)
const selectedData = ref<ReservasiItem | null>(null)

// State untuk Modal Konfirmasi (Terima)
const isConfirmModalOpen = ref(false)
const itemToConfirm = ref<ReservasiItem | null>(null)
const isSubmitting = ref(false)

// Load Data
const fetchData = async () => {
  loading.value = true
  try {
    const [resReservasi, resLomba] = await Promise.all([
      getAllReservasi(),
      getAllLomba()
    ])
    reservasiList.value = resReservasi
    lombaOptions.value = resLomba.data || resLomba
  } catch (error) {
    console.error("Fetch error:", error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const filteredReservasi = computed(() => {
  let result = [...reservasiList.value]

  // 1. Search Logic
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.namaPeserta.toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q) ||
      r.namaLomba.toLowerCase().includes(q)
    )
  }

  // 2. Filter Lomba
  if (filterLomba.value) {
    result = result.filter(r => r.namaLomba === filterLomba.value)
  }

  // 3. Filter Status
  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }

  // 4. Sorting Logic
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc': return new Date(b.waktuReservasi).getTime() - new Date(a.waktuReservasi).getTime()
      case 'date-asc': return new Date(a.waktuReservasi).getTime() - new Date(b.waktuReservasi).getTime()
      case 'name-asc': return a.namaPeserta.localeCompare(b.namaPeserta)
      case 'name-desc': return b.namaPeserta.localeCompare(a.namaPeserta)
      default: return 0
    }
  })

  return result
})

// Helper UI Formatting
function formatRupiah(angka: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800 border-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800 border-red-800'
    case 'EXPIRED': return 'bg-gray-200 text-gray-600 border-gray-400'
    case 'BOOKED': return 'bg-blue-100 text-blue-800 border-blue-800'
    case 'MENUNGGU_KONFIRMASI': return 'bg-orange-100 text-orange-800 border-orange-800'
    default: return 'bg-gray-50 text-gray-500 border-gray-300'
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    'BOOKED': 'Menunggu Upload',
    'MENUNGGU_KONFIRMASI': 'Perlu Verifikasi',
    'PAID': 'Diterima',
    'REJECTED': 'Ditolak',
    'EXPIRED': 'Kedaluwarsa'
  }
  return labels[status] || status
}

// Modal Handlers
const openModal = (data: ReservasiItem) => {
  if (data.status === 'BOOKED') return
  selectedData.value = data
  isModalOpen.value = true
}

const closeModal = () => {
  selectedData.value = null
  isModalOpen.value = false
}

const openConfirmModal = (item: ReservasiItem) => {
  itemToConfirm.value = item
  isConfirmModalOpen.value = true
}

const closeConfirmModal = () => {
  itemToConfirm.value = null
  isConfirmModalOpen.value = false
}

const prosesTolakDummy = () => {
  alert('Fitur Tolak sedang dalam tahap pengembangan (Sesuai PBI).')
}

// Eksekusi API
const executeTerima = async () => {
  if (!itemToConfirm.value) return
  isSubmitting.value = true
  try {
    await verifyReservasi(itemToConfirm.value.id, 'PAID')
    notification.value = 'Sukses! Pembayaran telah diverifikasi.'
    notificationType.value = 'success'
    fetchData() // Refresh data dr backend
    closeConfirmModal()
    if (isModalOpen.value) closeModal()
  } catch (error) {
    notification.value = 'Gagal memproses verifikasi.'
    notificationType.value = 'error'
  } finally {
    isSubmitting.value = false
    setTimeout(() => notification.value = '', 3000)
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden font-plus-jakarta">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="bg-white px-12 py-5 shadow-sm flex justify-between items-center shrink-0">
        <h1 class="text-3xl font-bold text-[#2E42B2]">Verifikasi Pembayaran</h1>
        <div class="text-right">
          <p class="font-semibold text-sm leading-tight text-gray-800">{{ authStore.user?.fullName || 'Koordinator' }}</p>
          <p class="text-xs text-[#6d717f] uppercase">Koordinator Pendaftaran</p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-12 py-8">
        <transition name="fade">
          <div v-if="notification" :class="notificationType === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'" class="p-4 rounded-lg mb-4 text-sm font-medium flex items-center justify-between shadow-sm">
            <span>{{ notification }}</span>
            <button @click="notification = ''" class="text-current opacity-70 hover:opacity-100">&times;</button>
          </div>
        </transition>

        <div class="flex flex-col gap-4 mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-[#2E42B2]">Daftar Transaksi</h2>
            <div class="relative w-72">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama, username, lomba..."
                class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <svg class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <select v-model="filterLomba" class="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Lomba</option>
              <option v-for="l in lombaOptions" :key="l.id" :value="l.namaLomba">{{ l.namaLomba }}</option>
            </select>

            <select v-model="filterStatus" class="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Status</option>
              <option value="BOOKED">Menunggu Upload (Attempt)</option>
              <option value="MENUNGGU_KONFIRMASI">Perlu Verifikasi</option>
              <option value="PAID">Diterima</option>
              <option value="REJECTED">Ditolak</option>
              <option value="EXPIRED">Kedaluwarsa</option>
            </select>

            <select v-model="sortBy" class="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400">
              <option value="date-desc">Terbaru</option>
              <option value="date-asc">Terlama</option>
              <option value="name-asc">Nama (A - Z)</option>
              <option value="name-desc">Nama (Z - A)</option>
            </select>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#2E42B2] text-white">
              <tr>
                <th class="py-4 px-6 text-sm font-semibold text-center">Waktu</th>
                <th class="py-4 px-6 text-sm font-semibold text-center">Peserta</th>
                <th class="py-4 px-6 text-sm font-semibold text-center">Lomba</th>
                <th class="py-4 px-6 text-sm font-semibold text-center">Nominal</th>
                <th class="py-4 px-6 text-sm font-semibold text-center">File Bukti</th>
                <th class="py-4 px-6 text-sm font-semibold text-center w-56">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="6" class="py-12 text-center text-gray-500 font-medium">Memuat data...</td></tr>
              <tr v-else-if="filteredReservasi.length === 0"><td colspan="6" class="py-12 text-center text-gray-500 font-medium">Tidak ada data transaksi.</td></tr>

              <tr v-else v-for="item in filteredReservasi" :key="item.id" class="border-b hover:bg-gray-50 transition-colors">
                <td class="py-4 px-6 text-xs text-[#2E42B2] text-center whitespace-pre-line">{{ new Date(item.waktuReservasi).toLocaleString('id-ID') }}</td>
                <td class="py-4 px-6 text-sm text-center">
                  <div class="font-bold text-[#2E42B2]">{{ item.namaPeserta }}</div>
                  <div class="text-xs text-gray-500">@{{ item.username }}</div>
                </td>
                <td class="py-4 px-6 text-sm text-[#2E42B2] text-center font-medium">{{ item.namaLomba }}</td>
                <td class="py-4 px-6 text-sm text-center text-gray-700 font-semibold">{{ formatRupiah(item.nominal) }}</td>

                <td class="py-4 px-6 text-sm text-center">
                  <button
                    @click="openModal(item)"
                    :disabled="item.status === 'BOOKED' || item.status === 'EXPIRED'"
                    class="bg-[#eef2ff] hover:bg-[#d0d7f5] text-[#2E42B2] px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed border border-[#2E42B2]"
                  >
                    Lihat
                  </button>
                </td>

                <td class="py-4 px-6 text-sm text-center">
                  <div v-if="item.status === 'MENUNGGU_KONFIRMASI'" class="flex justify-center gap-2">
                    <button @click="openConfirmModal(item)" class="bg-[#4ade80] hover:bg-[#22c55e] text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors">Terima</button>
                    <button @click="prosesTolakDummy" class="bg-[#f87171] hover:bg-[#ef4444] text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors">Tolak</button>
                  </div>
                  <div v-else>
                    <span :class="['py-1 px-3 rounded-full text-[10px] font-bold border uppercase', getStatusStyle(item.status)]">
                      {{ getStatusLabel(item.status) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] font-plus-jakarta" @click.self="closeModal">
      <div class="bg-white rounded-2xl w-[450px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        <div class="bg-[#eef2ff] p-5 text-center border-b border-gray-200">
          <h3 class="text-xl font-bold text-[#2E42B2] mb-2">Detail Bukti Pembayaran</h3>
          <div class="bg-[#d0d7f5] inline-block px-4 py-2 rounded-lg text-sm text-[#2E42B2] font-semibold text-left">
            <p>Nama &nbsp;&nbsp;&nbsp;: {{ selectedData?.namaPeserta }}</p>
            <p>Nominal : {{ formatRupiah(selectedData?.nominal || 0) }}</p>
          </div>
        </div>

        <div class="p-6 overflow-y-auto flex-1 flex justify-center bg-gray-50">
          <img :src="selectedData?.urlBukti" alt="Bukti Transfer" class="max-w-full rounded-lg shadow-sm border border-gray-200 object-contain max-h-[400px]">
        </div>

        <div class="p-5 border-t border-gray-200 flex justify-between items-center bg-white gap-4">
          <button @click="closeModal" class="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition-colors w-full">
            Tutup
          </button>
          <button v-if="selectedData?.status === 'MENUNGGU_KONFIRMASI'"
            @click="openConfirmModal(selectedData!)"
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-lg bg-[#22c55e] hover:bg-green-600 text-white font-bold transition-colors w-full disabled:opacity-50">
            Terima
          </button>
        </div>

      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="isConfirmModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] font-plus-jakarta" @click.self="closeConfirmModal">
      <div class="bg-white rounded-xl shadow-xl w-[450px] p-8 text-center mx-4">

        <h2 class="text-2xl font-bold text-[#2E42B2] mb-3">
          Konfirmasi Pembayaran
        </h2>
        <p class="text-gray-600 mb-8 font-medium">
          Pastikan bukti pembayaran dari <b>{{ itemToConfirm?.namaPeserta }}</b> sudah valid dan dana masuk ke rekening.
        </p>

        <div class="flex gap-4 justify-center">
          <button
            @click="closeConfirmModal"
            class="px-8 py-2.5 rounded-lg bg-[#e2e8f0] text-gray-700 font-bold hover:bg-gray-300 transition-colors w-full">
            Kembali
          </button>
          <button
            @click="executeTerima"
            :disabled="isSubmitting"
            class="px-8 py-2.5 rounded-lg bg-[#2E42B2] text-white font-bold hover:bg-blue-800 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isSubmitting ? 'Loading...' : 'Ya, Terima' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
