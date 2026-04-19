<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { getAllLomba, deleteLomba } from '@/services/lomba.service'
import type { LombaItem } from '@/services/lomba.service'

const router = useRouter()
const authStore = useAuthStore()

const lombaList = ref<LombaItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const searchQuery = ref('')
const filterJenisBurung = ref('')
const filterStatus = ref('')
const sortDir = ref('asc')

// Filter Modal States (Temp variables to hold selection before "Simpan")
const isFilterOpen = ref(false)
const tempJenisBurung = ref('')
const tempStatus = ref('')
const tempSort = ref('asc')

const isSidebarOpen = ref(false)

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
      nama: searchQuery.value || undefined,
    })
  } catch (e: any) {
    error.value = 'Gagal mengambil data lomba.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLomba)

// Filter Actions
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
  return jenis
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function formatWaktu(waktuTanggal: string): string {
  const d = new Date(waktuTanggal)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} - ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')} WIB`
}

function formatHarga(harga: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(harga)
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'BELUM_DIMULAI': return 'bg-[#FFB800] text-white'
    case 'BERLANGSUNG': return 'bg-[#5CB85C] text-white'
    case 'SELESAI': return 'bg-[#828282] text-white'
    case 'DIBATALKAN': return 'bg-[#D9534F] text-white'
    default: return 'bg-gray-200'
  }
}

function getStatusLabel(status: string) {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function goToDetail(id: string) {
  router.push(`/katalog-lomba/${id}`)
}

const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value
</script>

<template>
  <div class="w-full min-h-screen bg-white flex flex-col font-plus-jakarta pb-20">
    <!-- Header -->
    <header class="bg-[#2E42B2] text-white px-4 py-5 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <button @click="toggleSidebar" class="p-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <h1 class="text-xl font-bold">Katalog Lomba</h1>
      <RouterLink to="/profile" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
      </RouterLink>
    </header>

    <main class="flex-1 p-4">
      <!-- Search & Filter Row -->
      <div class="flex gap-3 mb-6">
        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari Lomba"
            class="w-full bg-[#E8EDF5] border border-transparent rounded-xl px-4 py-3 text-[#2E42B2] placeholder-[#2E42B2]/50 focus:outline-none focus:ring-2 focus:ring-[#2E42B2]/20"
          />
          <svg class="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E42B2]" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <button @click="openFilter" class="p-3 rounded-xl border-2 border-[#E8EDF5] text-[#2E42B2] active:bg-[#E8EDF5]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-[#2E42B2] border-t-transparent"></div>
      </div>

      <!-- Lomba List -->
      <div v-else-if="filteredLombaList.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
        <svg class="w-28 h-28 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-xl font-bold text-[#2e42b2] font-plus-jakarta text-center">
          Belum ada lomba yang terdaftar
        </p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="lomba in filteredLombaList" :key="lomba.id" class="bg-white border-2 border-[#2E42B2]/10 rounded-2xl overflow-hidden shadow-sm">
          <div class="p-4">
            <div class="flex justify-between items-start mb-1">
              <h2 class="text-lg font-extrabold text-[#2E42B2] leading-tight flex-1 pr-2">{{ lomba.namaLomba }}</h2>
              <span :class="getStatusBadge(lomba.status)" class="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {{ getStatusLabel(lomba.status) }}
              </span>
            </div>
            
            <p class="text-base font-medium text-[#2E42B2] mb-3">{{ formatHarga(lomba.hargaTiket) }}</p>

            <div class="flex items-center gap-2 text-[#2E42B2] mb-4 text-[10px]">
              <div class="flex items-center gap-1 whitespace-nowrap">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>{{ formatWaktu(lomba.waktuTanggal) }}</span>
              </div>
              <div class="flex items-center gap-1 truncate">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span class="truncate">{{ lomba.lokasi }}</span>
              </div>
              <div class="flex items-center gap-1 whitespace-nowrap font-semibold">
                <img src="@/assets/lucide_bird.svg" class="w-3 h-3" alt="Jenis Burung" />
                <span>{{ formatJenisBurung(lomba.jenisBurung) }}</span>
              </div>
            </div>

            <button @click="goToDetail(lomba.id)" class="w-full bg-[#2E42B2] text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform">
              Detail
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Sidebar Overlay (Placeholder) -->
    <transition name="fade">
      <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/40 z-50"></div>
    </transition>

    <!-- Filter Bottom Sheet -->
    <transition name="slide-up">
      <div v-if="isFilterOpen" class="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-6 max-h-[90vh] overflow-y-auto">
        <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <h2 class="text-2xl font-bold text-[#2E42B2] text-center mb-8">Filters</h2>

        <!-- Jenis Burung -->
        <div class="mb-6">
          <h3 class="text-base font-bold text-[#2E42B2] mb-3">Jenis Burung</h3>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="item in ['', 'MURAI_BATU', 'KACER', 'CUCAK_IJO', 'KENARI', 'ANIS_KEMBANG', 'LOVE_BIRD']" 
              :key="item"
              @click="tempJenisBurung = item"
              :class="tempJenisBurung === item ? 'bg-[#2E42B2] text-white border-[#2E42B2]' : 'bg-[#E8EDF5] text-[#2E42B2] border-transparent'"
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
              :class="tempStatus === item ? 'bg-[#2E42B2] text-white border-[#2E42B2]' : 'bg-[#E8EDF5] text-[#2E42B2] border-transparent'"
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
            <button @click="tempSort = 'asc'" :class="tempSort === 'asc' ? 'bg-[#2E42B2] text-white' : 'bg-[#E8EDF5] text-[#2E42B2]'" class="px-6 py-2 rounded-xl text-xs font-semibold">Terdekat</button>
            <button @click="tempSort = 'desc'" :class="tempSort === 'desc' ? 'bg-[#2E42B2] text-white' : 'bg-[#E8EDF5] text-[#2E42B2]'" class="px-6 py-2 rounded-xl text-xs font-semibold">Terjauh</button>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex gap-4">
          <button @click="resetFilter" class="flex-1 bg-[#E0E0E0] text-[#333] py-4 rounded-xl font-bold text-sm">Hapus Filter</button>
          <button @click="applyFilter" class="flex-1 bg-[#2E42B2] text-white py-4 rounded-xl font-bold text-sm">Simpan Filter</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.font-plus-jakarta {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }

/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>