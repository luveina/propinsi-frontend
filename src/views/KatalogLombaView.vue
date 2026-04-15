<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { getAllLomba, deleteLomba } from '@/services/lomba.service'
import type { LombaItem } from '@/services/lomba.service'

const router = useRouter()
const authStore = useAuthStore()

const lombaList = ref<LombaItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const notification = ref('')
const notificationType = ref<'success' | 'error'>('success')

const searchQuery = ref('')
const filterJenisBurung = ref('')
const filterStatus = ref('')
const sortDir = ref('desc') // 'desc' = Newest, 'asc' = Oldest

const isDeleteModalOpen = ref(false)
const lombaToDelete = ref<LombaItem | null>(null)

// Fetch data
const fetchLomba = async () => {
  loading.value = true
  error.value = null
  try {
    lombaList.value = await getAllLomba({
      jenisBurung: filterJenisBurung.value || undefined,
      status: filterStatus.value || undefined,
      sortBy: 'waktuTanggal',
      sortDir: sortDir.value,
    })
  } catch (e: any) {
    error.value = 'Gagal mengambil data lomba. Pastikan server berjalan.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLomba)

function onFilterChange() {
  fetchLomba()
}

// Client-side search filter
const filteredLombaList = computed(() => {
  if (!searchQuery.value.trim()) return lombaList.value
  const q = searchQuery.value.toLowerCase()
  return lombaList.value.filter(
    (l) =>
      l.namaLomba.toLowerCase().includes(q) ||
      l.lokasi.toLowerCase().includes(q) ||
      formatJenisBurung(l.jenisBurung).toLowerCase().includes(q),
  )
})

// Helpers
function formatJenisBurung(jenis: string): string {
  return jenis
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function formatWaktu(waktuTanggal: string): string {
  const d = new Date(waktuTanggal)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const day = String(d.getDate()).padStart(2, '0')
  const month = monthNames[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month} ${day}, ${year} - ${hours}.${minutes} WIB`
}

function formatHarga(harga: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
  }).format(harga)
}

interface StatusStyle {
  bg: string
  text: string
  label: string
}

function getStatusStyle(status: string): StatusStyle {
  switch (status) {
    case 'BERLANGSUNG':
      return { bg: '#22c55e', text: '#ffffff', label: 'Berlangsung' }
    case 'BELUM_DIMULAI':
      return { bg: '#f97316', text: '#ffffff', label: 'Belum Dimulai' }
    case 'SELESAI':
      return { bg: '#6b7280', text: '#ffffff', label: 'Selesai' }
    case 'DIBATALKAN':
      return { bg: '#ef4444', text: '#ffffff', label: 'Dibatalkan' }
    default:
      return { bg: '#6b7280', text: '#ffffff', label: status }
  }
}

function canEdit(status: string): boolean {
  return status === 'BELUM_DIMULAI' && authStore.user?.role === 'KOORDINATOR_LOMBA'
}

function canScore(lomba: LombaItem): boolean {
  if (!authStore.user?.role?.toUpperCase().includes('JURI')) return false
  if (!lomba.listJuri || lomba.listJuri.length === 0) return false
  return lomba.listJuri.some((juri) => juri.id === authStore.user?.id)
}

//actions
function goToDetail(id: string) {
  router.push(`/katalog-lomba/${id}`)
}

function goToTambah() {
  router.push('/buat-lomba')
}

function goToEdit(id: string) {
  router.push(`/edit-lomba/${id}`)
}

function openDeleteModal(lomba: LombaItem) {
  lombaToDelete.value = lomba
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  lombaToDelete.value = null
  isDeleteModalOpen.value = false
}

async function confirmDelete() {
  if (!lombaToDelete.value) return
  try {
    await deleteLomba(lombaToDelete.value.id)
    notification.value = `Lomba "${lombaToDelete.value.namaLomba}" berhasil dihapus`
    notificationType.value = 'success'
    await fetchLomba()
  } catch {
    notification.value = 'Gagal menghapus lomba. Coba lagi.'
    notificationType.value = 'error'
  } finally {
    closeDeleteModal()
    setTimeout(() => (notification.value = ''), 3000)
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="bg-white px-10 py-5 border-b border-gray-200 flex justify-between items-center shrink-0">
        <h1 class="text-4xl font-bold text-[#2E42B2] font-plus-jakarta">
          {{ authStore.user?.role === 'KOORDINATOR_LOMBA' ? 'Manajemen Lomba' : 'Katalog Lomba' }}
        </h1>
        <RouterLink
          to="/profile"
          class="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline"
        >
          <!-- Avatar circle -->
          <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div class="text-right">
            <p class="font-semibold text-sm leading-tight text-gray-900 font-plus-jakarta">
              {{ authStore.user?.fullName }}
            </p>
            <p class="text-xs text-gray-500 font-plus-jakarta">
              {{ authStore.user?.role?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }}
            </p>
          </div>
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </RouterLink>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-10 pt-6 pb-8">

        <!-- Notification Banner -->
        <transition name="fade">
          <div
            v-if="notification"
            :class="
              notificationType === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            "
            class="p-3 rounded-lg mb-5 text-sm font-medium font-plus-jakarta"
          >
            {{ notification }}
          </div>
        </transition>

        <!-- Error Banner -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-5 text-sm font-plus-jakarta"
        >
          {{ error }}
        </div>

        <!-- Filter Bar -->
        <div class="flex items-end gap-3 mb-6 flex-wrap font-plus-jakarta">

          <!-- Search -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari Lomba"
                class="bg-[#E8EDF5] border border-[#2e42b2] text-[#2e42b2] placeholder-[#2e42b2] placeholder:opacity-60 text-sm rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e42b2] w-[190px] font-medium"
              />
              <svg
                class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
            </div>

          <!-- Jenis Burung -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-[#2e42b2] font-bold font-plus-jakarta pl-0.5 uppercase tracking-wider">Jenis Burung</label>
              <div class="relative">
                <select
                  v-model="filterJenisBurung"
                  @change="onFilterChange"
                  class="appearance-none bg-[#E8EDF5] border border-[#2e42b2] text-[#2e42b2] text-sm rounded-lg pl-4 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e42b2] w-[160px] font-medium cursor-pointer"
                >
                  <option value="">Semua Jenis</option>
                  <option value="MURAI_BATU">Murai Batu</option>
                  <option value="CUCAK_IJO">Cucak Ijo</option>
                  <option value="KACER">Kacer</option>
                  <option value="KENARI">Kenari</option>
                  <option value="ANIS_KEMBANG">Anis Kembang</option>
                  <option value="LOVE_BIRD">Lovebird</option>
                </select>
                <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Status Lomba -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-[#2e42b2] font-bold font-plus-jakarta pl-0.5 uppercase tracking-wider">Status Lomba</label>
              <div class="relative">
                <select
                  v-model="filterStatus"
                  @change="onFilterChange"
                  class="appearance-none bg-[#E8EDF5] border border-[#2e42b2] text-[#2e42b2] text-sm rounded-lg pl-4 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e42b2] w-[160px] font-medium cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="BELUM_DIMULAI">Belum Dimulai</option>
                  <option value="BERLANGSUNG">Berlangsung</option>
                  <option value="SELESAI">Selesai</option>
                  <option value="DIBATALKAN">Dibatalkan</option>
                </select>
                <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Sort By -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-[#2e42b2] font-bold font-plus-jakarta pl-0.5 uppercase tracking-wider">Sort By</label>
              <div class="relative">
                <select
                  v-model="sortDir"
                  @change="onFilterChange"
                  class="appearance-none bg-[#E8EDF5] border border-[#2e42b2] text-[#2e42b2] text-sm rounded-lg pl-4 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e42b2] w-[160px] font-medium cursor-pointer"
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
                <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          <!-- Tambah Lomba -->
          <div class="ml-auto">
            <button
              v-if="authStore.user?.role === 'KOORDINATOR_LOMBA'"
              @click="goToTambah"
              class="bg-[#2e42b2] hover:bg-[#1c2d8f] text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer font-plus-jakarta"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Lomba
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-24">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2e42b2] border-t-transparent"></div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!loading && filteredLombaList.length === 0"
          class="flex flex-col items-center justify-center py-24 gap-4"
        >
          <svg class="w-28 h-28 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-xl font-bold text-[#2e42b2] font-plus-jakarta text-center">
            Belum ada lomba yang terdaftar
          </p>
        </div>

        <!-- Lomba List -->
        <div v-else class="flex flex-col gap-4">
          <div
            v-for="lomba in filteredLombaList"
            :key="lomba.id"
            class="rounded-xl overflow-hidden border border-[#2e42b2] shadow-sm"
          >
            <!-- Card Header — dark navy blue, same shade as sidebar -->
            <div class="bg-[#2e42b2] px-6 py-4 flex items-center gap-3">
              <h2 class="text-base font-bold text-white font-plus-jakarta tracking-tight">
                {{ lomba.namaLomba }}
              </h2>
              <!-- Status Badge -->
              <span
                class="px-3 py-0.5 rounded-full text-xs font-semibold font-plus-jakarta shrink-0"
                :style="{
                  backgroundColor: getStatusStyle(lomba.status).bg,
                  color: getStatusStyle(lomba.status).text,
                }"
              >
                {{ getStatusStyle(lomba.status).label }}
              </span>
              <!-- Edit icon -->
              <button
                v-if="canScore(lomba)"
                @click="router.push({ path: '/penjurian', query: { lombaId: lomba.id } })"
                class="bg-[#2e42b2] hover:bg-blue-800 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer w-full font-plus-jakarta"
              >
                Penilaian
              </button>
              <button
                v-if="canEdit(lomba.status)"
                @click.stop="goToEdit(lomba.id)"
                class="ml-1 text-blue-200 hover:text-white transition-colors cursor-pointer"
                title="Edit Lomba"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.415.586H8v-2.414a2 2 0 01.586-1.414z" />
                </svg>
              </button>
            </div>

            <!-- Card Body — white -->
            <div class="bg-white px-6 py-5 flex items-center gap-6">
              <!-- Left: harga + chips -->
              <div class="flex-1 min-w-0">
                <p class="text-xl font-bold text-[#2e42b2] mb-3 font-plus-jakarta">
                  {{ formatHarga(lomba.hargaTiket) }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <!-- Tanggal & Waktu -->
                  <div class="flex items-center gap-1.5 border border-[#2E42B2] bg-[#E8EDF5] text-[#2E42B2] px-3 py-1.5 rounded-lg">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="font-plus-jakarta text-sm font-medium">{{ formatWaktu(lomba.waktuTanggal) }}</span>
                  </div>

                  <!-- Lokasi -->
                  <div class="flex items-center gap-1.5 border border-[#2E42B2] bg-[#E8EDF5] text-[#2E42B2] px-3 py-1.5 rounded-lg">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="font-plus-jakarta text-sm font-medium">{{ lomba.lokasi }}</span>
                  </div>

                  <!-- Jenis Burung -->
                  <div class="flex items-center gap-1.5 border border-[#2E42B2] bg-[#E8EDF5] text-[#2E42B2] px-3 py-1.5 rounded-lg">
                    <img src="@/assets/lucide_bird.svg"/>
                    <span class="font-plus-jakarta text-sm font-medium">{{ formatJenisBurung(lomba.jenisBurung) }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Actions -->
              <div class="flex flex-col gap-2 shrink-0 w-[130px]">
                <button
                  @click="goToDetail(lomba.id)"
                  class="bg-[#2e42b2] hover:bg-[#1c2d8f] text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer w-full font-plus-jakarta"
                >
                  Detail
                </button>
                <button
                  v-if="canEdit(lomba.status)"
                  @click="openDeleteModal(lomba)"
                  class="bg-[#ec221f] hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer w-full font-plus-jakarta"
                >
                  <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <Teleport to="body">
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="closeDeleteModal"
    >
      <div class="bg-white rounded-2xl p-8 w-[360px] mx-4 shadow-lg border border-gray-200 font-plus-jakarta text-center">
        <h3 class="text-xl font-bold text-[#2E42B2] mb-3">Hapus Lomba</h3>
        <p class="text-sm text-gray-600 mb-8 leading-relaxed">
          Apakah Anda yakin ingin menghapus <strong>{{ lombaToDelete?.namaLomba }}</strong>?
        </p>
        <div class="flex gap-3">
          <button
            @click="closeDeleteModal"
            class="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Kembali
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 py-2.5 rounded-xl bg-[#2E42B2] text-white text-sm font-semibold hover:bg-[#1c2d8f] transition-colors cursor-pointer"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
a {
  text-decoration: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
