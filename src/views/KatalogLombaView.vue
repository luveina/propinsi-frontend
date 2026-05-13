<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { getAllLomba, getLombaByJuri, deleteLomba } from '@/services/lomba.service'
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
const sortDir = ref('asc')

const isDeleteModalOpen = ref(false)
const lombaToDelete = ref<LombaItem | null>(null)

// Mobile state
const isMobileSidebarOpen = ref(false)
const isFilterOpen = ref(false)
const tempJenisBurung = ref('')
const tempStatus = ref('')
const tempSort = ref('asc')

// Fetch data
const fetchLomba = async () => {
  loading.value = true
  error.value = null
  try {
    // If user is a JURI, fetch only lombas where they are assigned as a judge
    const fetchFunction = authStore.user?.role === 'JURI' ? getLombaByJuri : getAllLomba

    lombaList.value = await fetchFunction({
      jenisBurung: filterJenisBurung.value || undefined,
      status: filterStatus.value || undefined,
      sortBy: 'waktuTanggal',
      sortDir: sortDir.value,
      nama: searchQuery.value || undefined,
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

// Mobile filter handlers
const openFilter = () => {
  tempJenisBurung.value = filterJenisBurung.value
  tempStatus.value = filterStatus.value
  tempSort.value = sortDir.value
  isFilterOpen.value = true
}

const applyFilter = () => {
  filterJenisBurung.value = tempJenisBurung.value
  filterStatus.value = tempStatus.value
  sortDir.value = tempSort.value
  isFilterOpen.value = false
  fetchLomba()
}

const resetFilter = () => {
  tempJenisBurung.value = ''
  tempStatus.value = ''
  tempSort.value = 'asc'
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

// Watch for search query changes
watch(searchQuery, () => {
  fetchLomba()
})

// Client-side search filter
const filteredLombaList = computed(() => {
  return lombaList.value
})

// Helpers
function formatJenisBurung(jenis: string): string {
  if (!jenis) return ''
  return jenis
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function formatWaktu(waktuTanggal: string): string {
  const d = new Date(waktuTanggal)
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]
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

function getStatusLabel(status: string): string {
  return getStatusStyle(status).label
}

function canEdit(status: string): boolean {
  return status === 'BELUM_DIMULAI' && authStore.user?.role === 'KOORDINATOR_LOMBA'
}

// Actions
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
  // Lomba deletion is now handled in DetailLombaView
}

function closeDeleteModal() {
  lombaToDelete.value = null
  isDeleteModalOpen.value = false
}

async function confirmDelete() {
  // Lomba deletion is now handled in DetailLombaView
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Desktop Sidebar (hidden on mobile) -->
    <div class="hidden md:!block">
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden w-full">
      <!-- Desktop Header -->
      <div
        class="hidden md:!flex bg-white px-10 py-5 border-b border-gray-200 justify-between items-center shrink-0"
      >
        <h1 class="text-4xl font-bold text-[#2E42B2] font-plus-jakarta">
          {{ authStore.user?.role === 'KOORDINATOR_LOMBA' ? 'Manajemen Lomba' : 'Katalog Lomba' }}
        </h1>
        <RouterLink
          to="/profile"
          class="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline"
        >
          <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
              />
            </svg>
          </div>
          <div class="text-right">
            <p class="font-semibold text-sm leading-tight text-gray-900 font-plus-jakarta">
              {{ authStore.user?.fullName }}
            </p>
            <p class="text-xs text-gray-500 font-plus-jakarta">
              {{
                authStore.user?.role
                  ?.replace(/_/g, ' ')
                  .replace(/\b\w/g, (c: string) => c.toUpperCase())
              }}
            </p>
          </div>
        </RouterLink>
      </div>

      <!-- Mobile Header -->
      <header
        class="md:!hidden bg-[#2E42B2] text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md"
      >
        <button @click="isMobileSidebarOpen = true" class="p-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="text-lg font-bold flex-1 text-center">
          {{ authStore.user?.role === 'KOORDINATOR_LOMBA' ? 'Manajemen Lomba' : 'Katalog Lomba' }}
        </h1>
        <RouterLink
          to="/profile"
          class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
            />
          </svg>
        </RouterLink>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto px-4 md:px-10 pt-4 md:pt-6 pb-8 md:pb-8 w-full">
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

        <!-- Desktop Filter Bar -->
        <div class="hidden md:!flex items-end gap-3 mb-6 flex-wrap font-plus-jakarta">
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
              />
            </svg>
          </div>

          <!-- Jenis Burung -->
          <div class="flex flex-col gap-1">
            <label
              class="text-[10px] text-[#2e42b2] font-bold font-plus-jakarta pl-0.5 uppercase tracking-wider"
              >Jenis Burung</label
            >
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
              <svg
                class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <!-- Status Lomba -->
          <div class="flex flex-col gap-1">
            <label
              class="text-[10px] text-[#2e42b2] font-bold font-plus-jakarta pl-0.5 uppercase tracking-wider"
              >Status Lomba</label
            >
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
              <svg
                class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <!-- Sort By -->
          <div class="flex flex-col gap-1">
            <label
              class="text-[10px] text-[#2e42b2] font-bold font-plus-jakarta pl-0.5 uppercase tracking-wider"
              >Tanggal</label
            >
            <div class="relative">
              <select
                v-model="sortDir"
                @change="onFilterChange"
                class="appearance-none bg-[#E8EDF5] border border-[#2e42b2] text-[#2e42b2] text-sm rounded-lg pl-4 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e42b2] w-[160px] font-medium cursor-pointer"
              >
                <option value="desc">Terjauh</option>
                <option value="asc">Terdekat</option>
              </select>
              <svg
                class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
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
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Lomba
            </button>
          </div>
        </div>

        <!-- Mobile Filter Bar -->
        <div class="md:!hidden flex gap-3 mb-6">
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari Lomba"
              class="w-full bg-[#E8EDF5] border border-transparent rounded-xl px-4 py-3 text-[#2E42B2] placeholder-[#2E42B2]/50 focus:outline-none focus:ring-2 focus:ring-[#2E42B2]/20 font-medium"
            />
            <svg
              class="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E42B2]"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            @click="openFilter"
            class="p-3 rounded-xl border-2 border-[#E8EDF5] text-[#2E42B2] active:bg-[#E8EDF5] shrink-0"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-24">
          <div
            class="animate-spin rounded-full h-10 w-10 border-4 border-[#2e42b2] border-t-transparent"
          ></div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!loading && filteredLombaList.length === 0"
          class="flex flex-col items-center justify-center py-24 gap-4"
        >
          <svg
            class="w-28 h-28 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p class="text-xl font-bold text-[#2e42b2] font-plus-jakarta text-center">
            Belum ada lomba yang terdaftar
          </p>
        </div>

        <!-- Lomba List Container -->
        <div v-else>
          <!-- Desktop List (Muncul hanya di layar medium ke atas) -->
          <div class="hidden md:!flex flex-col gap-4">
            <div
              v-for="lomba in filteredLombaList"
              :key="lomba.id"
              class="rounded-xl overflow-hidden border border-[#2e42b2] bg-white shadow-sm"
            >
              <!-- Card Header -->
              <div class="bg-[#2e42b2] px-6 py-4 flex items-center gap-3">
                <h2 class="text-base font-bold text-white font-plus-jakarta tracking-tight">
                  {{ lomba.namaLomba }}
                </h2>
                <span
                  class="px-3 py-0.5 rounded-full text-xs font-semibold font-plus-jakarta shrink-0"
                  :style="{
                    backgroundColor: getStatusStyle(lomba.status).bg,
                    color: getStatusStyle(lomba.status).text,
                  }"
                >
                  {{ getStatusStyle(lomba.status).label }}
                </span>
                <button
                  v-if="canEdit(lomba.status)"
                  @click.stop="goToEdit(lomba.id)"
                  class="ml-1 text-white hover:text-white transition-colors cursor-pointer"
                  title="Edit Lomba"
                >
                  <img src="@/assets/pencil.svg" alt="Edit" class="w-6 h-6" />
                </button>
              </div>

              <!-- Card Body -->
              <div class="bg-white px-6 py-5 flex items-center gap-6">
                <div class="flex-1 min-w-0">
                  <p class="text-xl font-bold text-[#2e42b2] mb-3 font-plus-jakarta">
                    {{ formatHarga(lomba.hargaTiket) }}
                  </p>
                  <div class="flex fl ex-wrap gap-2">
                    <div
                      class="flex items-center gap-1.5 border border-[#2E42B2] bg-[#E8EDF5] text-[#2E42B2] px-3 py-1.5 rounded-lg"
                    >
                      <svg
                        class="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span class="font-plus-jakarta text-sm font-medium">{{
                        formatWaktu(lomba.waktuTanggal)
                      }}</span>
                    </div>
                    <div
                      class="flex items-center gap-1.5 border border-[#2E42B2] bg-[#E8EDF5] text-[#2E42B2] px-3 py-1.5 rounded-lg"
                    >
                      <svg
                        class="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span class="font-plus-jakarta text-sm font-medium">{{ lomba.lokasi }}</span>
                    </div>
                    <div
                      class="flex items-center gap-1.5 border border-[#2E42B2] bg-[#E8EDF5] text-[#2E42B2] px-3 py-1.5 rounded-lg"
                    >
                      <img src="@/assets/lucide_bird.svg" />
                      <span class="font-plus-jakarta text-sm font-medium">{{
                        formatJenisBurung(lomba.jenisBurung)
                      }}</span>
                    </div>
                  </div>
                </div>
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
                      <path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile List (Muncul hanya di layar kecil) -->
          <div class="md:!hidden space-y-4 pb-20">
            <div
              v-for="lomba in filteredLombaList"
              :key="lomba.id"
              class="bg-white border-2 border-[#2E42B2]/10 rounded-2xl overflow-hidden shadow-sm"
            >
              <div class="p-4">
                <div class="flex justify-between items-start mb-1">
                  <h2 class="text-lg font-extrabold text-[#2E42B2] leading-tight flex-1 pr-2">
                    {{ lomba.namaLomba }}
                  </h2>
                  <!-- Menggunakan getStatusStyle yang sudah ada -->
                  <span
                    :style="{
                      backgroundColor: getStatusStyle(lomba.status).bg,
                      color: getStatusStyle(lomba.status).text,
                    }"
                    class="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                  >
                    {{ getStatusStyle(lomba.status).label }}
                  </span>
                </div>

                <p class="text-base font-medium text-[#2E42B2] mb-3">
                  {{ formatHarga(lomba.hargaTiket) }}
                </p>

                <div class="flex items-center gap-2 text-[#2E42B2] mb-4 text-[10px]">
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{{ formatWaktu(lomba.waktuTanggal) }}</span>
                  </div>
                  <div class="flex items-center gap-1 truncate">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span class="truncate">{{ lomba.lokasi }}</span>
                  </div>
                  <div class="flex items-center gap-1 whitespace-nowrap font-semibold">
                    <img src="@/assets/lucide_bird.svg" class="w-3 h-3" alt="Jenis Burung" />
                    <span>{{ formatJenisBurung(lomba.jenisBurung) }}</span>
                  </div>
                </div>

                <button
                  @click="goToDetail(lomba.id)"
                  class="w-full bg-[#2E42B2] text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Mobile Sidebar Overlay -->
  <transition name="fade">
    <div
      v-if="isMobileSidebarOpen"
      @click="closeMobileSidebar"
      class="fixed inset-0 bg-black/40 z-50 md:hidden"
    ></div>
  </transition>

  <!-- Mobile Sidebar -->
  <transition name="slide-right">
    <div
      v-if="isMobileSidebarOpen"
      class="fixed left-0 top-0 h-screen w-64 bg-[#314EAE] z-50 md:hidden overflow-y-auto shadow-xl"
    >
      <div class="pt-8 pb-2 px-4 flex items-center justify-center gap-3">
        <img src="@/assets/siloburputih.png" alt="Logo" class="h-17 w-auto object-contain" />
      </div>

      <nav class="flex-1 px-4 pt-2 pb-6 space-y-2 mt-4">
        <RouterLink
          v-if="authStore.user?.role === 'ADMIN'"
          to="/manajemen-akun"
          @click="closeMobileSidebar"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A] text-white"
          active-class="bg-[#1E3A8A] shadow-inner"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          Manajemen Akun
        </RouterLink>

        <RouterLink
          v-else-if="authStore.user?.role === 'KOORDINATOR_LOMBA'"
          to="/katalog-lomba"
          @click="closeMobileSidebar"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A] text-white"
          active-class="bg-[#1E3A8A] shadow-inner"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            ></path>
          </svg>
          Manajemen Lomba
        </RouterLink>
        <RouterLink
          v-else
          to="/katalog-lomba"
          @click="closeMobileSidebar"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A] text-white"
          active-class="bg-[#1E3A8A] shadow-inner"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            ></path>
          </svg>
          Katalog Lomba
        </RouterLink>

        <RouterLink
          to="/profile"
          @click="closeMobileSidebar"
          class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A] text-white"
          active-class="bg-[#1E3A8A] shadow-inner"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          Profil Saya
        </RouterLink>
      </nav>

      <div class="p-5 mb-2">
        <button
          @click="authStore.logout()"
          class="w-full bg-white text-[#314EAE] font-bold py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors flex justify-center items-center shadow-md cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </div>
  </transition>

  <!-- Mobile Filter Bottom Sheet -->
  <transition name="slide-up">
    <div
      v-if="isFilterOpen"
      class="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-6 max-h-[90vh] overflow-y-auto md:hidden"
    >
      <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
      <h2 class="text-2xl font-bold text-[#2E42B2] text-center mb-8">Filters</h2>

      <!-- Jenis Burung -->
      <div class="mb-6">
        <h3 class="text-base font-bold text-[#2E42B2] mb-3">Jenis Burung</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in [
              '',
              'MURAI_BATU',
              'KACER',
              'CUCAK_IJO',
              'KENARI',
              'ANIS_KEMBANG',
              'LOVE_BIRD',
            ]"
            :key="item"
            @click="tempJenisBurung = item"
            :class="
              tempJenisBurung === item
                ? 'bg-[#2E42B2] text-white border-[#2E42B2]'
                : 'bg-[#E8EDF5] text-[#2E42B2] border-transparent'
            "
            class="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
          >
            {{ item === '' ? 'Semua Jenis Burung' : formatJenisBurung(item) }}
          </button>
        </div>
      </div>

      <!-- Status Lomba -->
      <div class="mb-6">
        <h3 class="text-base font-bold text-[#2E42B2] mb-3">Status Lomba</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in ['', 'BELUM_DIMULAI', 'BERLANGSUNG', 'SELESAI', 'DIBATALKAN']"
            :key="item"
            @click="tempStatus = item"
            :class="
              tempStatus === item
                ? 'bg-[#2E42B2] text-white border-[#2E42B2]'
                : 'bg-[#E8EDF5] text-[#2E42B2] border-transparent'
            "
            class="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
          >
            {{ item === '' ? 'Semua Status' : getStatusLabel(item) }}
          </button>
        </div>
      </div>

      <!-- Sort By -->
      <div class="mb-10">
        <h3 class="text-base font-bold text-[#2E42B2] mb-3">Tanggal</h3>
        <div class="flex gap-2">
          <button
            @click="tempSort = 'asc'"
            :class="tempSort === 'asc' ? 'bg-[#2E42B2] text-white' : 'bg-[#E8EDF5] text-[#2E42B2]'"
            class="px-6 py-2 rounded-xl text-xs font-semibold"
          >
            Terdekat
          </button>
          <button
            @click="tempSort = 'desc'"
            :class="tempSort === 'desc' ? 'bg-[#2E42B2] text-white' : 'bg-[#E8EDF5] text-[#2E42B2]'"
            class="px-6 py-2 rounded-xl text-xs font-semibold"
          >
            Terjauh
          </button>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="flex gap-4">
        <button
          @click="resetFilter"
          class="flex-1 bg-[#E0E0E0] text-[#333] py-4 rounded-xl font-bold text-sm"
        >
          Hapus Filter
        </button>
        <button
          @click="applyFilter"
          class="flex-1 bg-[#2E42B2] text-white py-4 rounded-xl font-bold text-sm"
        >
          Simpan Filter
        </button>
      </div>
    </div>
  </transition>
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
