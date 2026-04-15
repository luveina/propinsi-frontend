<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { getAllReservasi, verifyReservasi, type ReservasiItem } from '@/services/reservasi.service'

const authStore = useAuthStore()

const reservasiList = ref<ReservasiItem[]>([])
const loading = ref(false)
const notification = ref('')
const notificationType = ref<'success' | 'error'>('success')

const filterLomba = ref('')
const filterStatus = ref('')
const sortByDate = ref('desc')

const isModalOpen = ref(false)
const selectedData = ref<ReservasiItem | null>(null)
const isSubmitting = ref(false)

const isConfirmModalOpen = ref(false)
const itemToConfirm = ref<ReservasiItem | null>(null)

const dummyData: ReservasiItem[] = [
  { id: '1', namaPeserta: 'Manuk Lover 67', username: 'manuk67', namaLomba: 'SILOBUR CUP Jateng XVII', nomorGantangan: 12, nominal: 500000, urlBukti: 'https://via.placeholder.com/300x500.png?text=Bukti+Transfer+BCA', status: 'MENUNGGU_KONFIRMASI', waktuReservasi: '2024-03-20T08:23:05' },
  { id: '2', namaPeserta: 'Zahra Burung', username: 'zahrabrg', namaLomba: 'KM CUP Jabar XII', nomorGantangan: 5, nominal: 250000, urlBukti: 'https://via.placeholder.com/300x500.png?text=Bukti+Transfer+Mandiri', status: 'PAID', waktuReservasi: '2024-03-19T08:23:05' },
];

const fetchReservasi = async () => {
  loading.value = true
  try {
    const data = await getAllReservasi()
    reservasiList.value = data.length > 0 ? data : dummyData
  } catch (error) {
    reservasiList.value = dummyData
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReservasi()
})

const filteredReservasi = computed(() => {
  let result = reservasiList.value

  if (filterLomba.value) {
    result = result.filter(r => r.namaLomba.includes(filterLomba.value))
  }
  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }

  result = result.sort((a, b) => {
    const dateA = new Date(a.waktuReservasi).getTime()
    const dateB = new Date(b.waktuReservasi).getTime()
    return sortByDate.value === 'desc' ? dateB - dateA : dateA - dateB
  })

  return result
})

function formatRupiah(angka: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
}

function formatWaktu(waktu: string) {
  const d = new Date(waktu)
  return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800 border-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800 border-red-800'
    default: return 'bg-gray-100 text-gray-800 border-gray-800'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PAID': return 'Diterima'
    case 'REJECTED': return 'Ditolak'
    default: return status
  }
}

const openModal = (data: ReservasiItem) => {
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

const executeTerima = async () => {
  if (!itemToConfirm.value) return

  isSubmitting.value = true
  try {
    await verifyReservasi(itemToConfirm.value.id, 'PAID')

    const index = reservasiList.value.findIndex(r => r.id === itemToConfirm.value!.id)
    if (index !== -1) {
      reservasiList.value[index].status = 'PAID'
    }

    notification.value = 'Sukses! Status transaksi telah diperbarui.'
    notificationType.value = 'success'

    closeConfirmModal()
    if (isModalOpen.value) closeModal()
  } catch (error) {
    notification.value = 'Gagal memverifikasi pembayaran.'
    notificationType.value = 'error'
  } finally {
    isSubmitting.value = false
    setTimeout(() => notification.value = '', 3000)
  }
}

const prosesTolakDummy = () => {
  alert('Fitur Tolak sedang dalam tahap pengembangan (Sesuai PBI).')
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="bg-white px-12 py-5 shadow-sm flex justify-between items-center shrink-0 font-plus-jakarta">
        <h1 class="text-3xl font-bold text-[#2E42B2]">Verifikasi Pembayaran</h1>
        <div class="text-right">
          <p class="font-semibold text-sm leading-tight text-gray-800">{{ authStore.user?.fullName || 'Koordinator' }}</p>
          <p class="text-xs text-[#6d717f] uppercase tracking-wide">Koordinator Pendaftaran</p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-12 py-8">
        <transition name="fade">
          <div v-if="notification" :class="notificationType === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'" class="p-4 rounded-lg mb-4 text-sm font-medium flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2">
              <svg v-if="notificationType === 'success'" class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              <span>{{ notification }}</span>
            </div>
            <button @click="notification = ''" class="text-current opacity-70 hover:opacity-100">&times;</button>
          </div>
        </transition>

        <div class="flex items-center gap-4 mb-6 flex-wrap font-plus-jakarta bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-[#2E42B2] mr-4">Daftar Transaksi</h2>

          <div class="relative flex-1 min-w-[200px]">
            <select v-model="filterLomba" class="w-full appearance-none bg-[#f3f4f6] border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Lomba</option>
              <option value="SILOBUR CUP">SILOBUR CUP</option>
              <option value="KM CUP">KM CUP</option>
            </select>
          </div>

          <div class="relative flex-1 min-w-[150px]">
            <select v-model="filterStatus" class="w-full appearance-none bg-[#f3f4f6] border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Status</option>
              <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
              <option value="PAID">Telah Diproses (Diterima)</option>
            </select>
          </div>

          <div class="relative flex-1 min-w-[150px]">
            <select v-model="sortByDate" class="w-full appearance-none bg-[#f3f4f6] border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400">
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-plus-jakarta">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#2E42B2] text-white">
              <tr>
                <th class="py-4 px-6 text-sm font-semibold text-center">Waktu</th>
                <th class="py-4 px-6 text-sm font-semibold text-center">Nama Peserta</th>
                <th class="py-4 px-6 text-sm font-semibold text-center">Lomba</th>
                <th class="py-4 px-6 text-sm font-semibold text-center">Nominal</th>
                <th class="py-4 px-6 text-sm font-semibold text-center">File Bukti</th>
                <th class="py-4 px-6 text-sm font-semibold text-center w-56">Status Konfirmasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading"><td colspan="6" class="py-12 text-center">Loading...</td></tr>
              <tr v-else-if="filteredReservasi.length === 0"><td colspan="6" class="py-12 text-center text-gray-500">Tidak ada data transaksi.</td></tr>

              <tr v-else v-for="item in filteredReservasi" :key="item.id" class="odd:bg-white even:bg-[#f8fafc] hover:bg-gray-50 transition-colors border-b">
                <td class="py-3 px-6 text-sm text-[#2E42B2] text-center whitespace-pre-line">{{ formatWaktu(item.waktuReservasi) }}</td>
                <td class="py-3 px-6 text-sm text-[#2E42B2] text-center font-medium">{{ item.namaPeserta }}<br><span class="text-xs text-gray-500 font-normal">(@{{ item.username }})</span></td>
                <td class="py-3 px-6 text-sm text-[#2E42B2] text-center font-semibold">{{ item.namaLomba }}</td>
                <td class="py-3 px-6 text-sm text-center text-gray-700">{{ formatRupiah(item.nominal) }}</td>

                <td class="py-3 px-6 text-sm text-center">
                  <button @click="openModal(item)" class="bg-[#eef2ff] hover:bg-[#d0d7f5] text-[#2E42B2] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border border-[#2E42B2]">
                    <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Lihat
                  </button>
                </td>

                <td class="py-3 px-6 text-sm text-center">
                  <div v-if="item.status === 'MENUNGGU_KONFIRMASI'" class="flex justify-center gap-2">
                    <button
                      @click="openConfirmModal(item)"
                      :disabled="isSubmitting"
                      class="bg-[#4ade80] hover:bg-[#22c55e] text-white px-4 py-1.5 rounded-md font-semibold text-xs shadow-sm transition-colors disabled:opacity-50">
                      Terima
                    </button>
                    <button
                      @click="prosesTolakDummy"
                      class="bg-[#f87171] hover:bg-[#ef4444] text-white px-4 py-1.5 rounded-md font-semibold text-xs shadow-sm transition-colors">
                      Tolak
                    </button>
                  </div>

                  <div v-else>
                    <span :class="['inline-block py-1 px-4 rounded-full text-xs font-semibold border', getStatusStyle(item.status)]">
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
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 font-plus-jakarta" @click.self="closeModal">
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
            {{ isSubmitting ? 'Memproses...' : 'Terima' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="isConfirmModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] font-plus-jakarta" @click.self="closeConfirmModal">
      <div class="bg-white rounded-xl shadow-xl w-[450px] p-8 text-center mx-4">

        <h2 class="text-2xl font-bold text-[#2E42B2] mb-3">
          Konfirmasi Bukti Pembayaran
        </h2>

        <p class="text-gray-600 mb-8 font-medium">
          Pastikan bukti pembayaran sudah valid.
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
            {{ isSubmitting ? 'Loading...' : 'Terima' }}
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
