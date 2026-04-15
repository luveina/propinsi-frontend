<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const filterJenisBurung = ref('')
const filterStatus = ref('')
const sortBy = ref('')
const sortDir = ref('asc')

const isDeleteModalOpen = ref(false)
const lombaToDelete = ref<LombaItem | null>(null)

//fetch data
const fetchLomba = async () => {
  loading.value = true
  error.value = null
  try {
    lombaList.value = await getAllLomba({
      jenisBurung: filterJenisBurung.value || undefined,
      status: filterStatus.value || undefined,
      sortBy: sortBy.value || undefined,
      sortDir: sortDir.value || undefined,
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

// helper
function formatJenisBurung(jenis: string): string {
  return jenis
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function formatWaktu(waktuTanggal: string): string {
  const d = new Date(waktuTanggal)
  const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  return `${date} - ${time}`
}

function formatHarga(harga: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(harga)
}

interface StatusStyle {
  bg: string
  text: string
  border: string
  label: string
}

function getStatusStyle(status: string): StatusStyle {
  switch (status) {
    case 'BERLANGSUNG':
      return { bg: '#ffd88a', text: '#bf6a02', border: '#bf6a02', label: 'Berlangsung' }
    case 'BELUM_DIMULAI':
      return { bg: '#aff4c6', text: '#02542d', border: '#02542d', label: 'Belum Dimulai' }
    case 'SELESAI':
      return { bg: '#d2d5db', text: '#6d717f', border: '#6d717f', label: 'Selesai' }
    case 'DIBATALKAN':
      return { bg: '#fcb3ad', text: '#900b09', border: '#900b09', label: 'Dibatalkan' }
    default:
      return { bg: '#d2d5db', text: '#6d717f', border: '#6d717f', label: status }
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
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <div
        class="bg-white px-12 py-5 shadow-sm flex justify-between items-center shrink-0 font-plus-jakarta"
      >
        <h1 class="text-3xl font-bold text-[#2E42B2]">
          {{ authStore.user?.role === 'KOORDINATOR_LOMBA' ? 'Manajemen Lomba' : 'Katalog Lomba' }}
        </h1>
        <RouterLink
          to="/profile"
          class="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline"
        >
          <div class="text-right">
            <p class="font-semibold text-sm leading-tight text-gray-800">
              {{ authStore.user?.fullName }}
            </p>
            <p class="text-xs text-[#6d717f] uppercase tracking-wide">
              {{ authStore.user?.role?.replace(/_/g, ' ') }}
            </p>
          </div>
        </RouterLink>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-12 py-8">
        <!-- Notification Banner -->
        <transition name="fade">
          <div
            v-if="notification"
            :class="
              notificationType === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            "
            class="p-3 rounded-lg mb-4 text-sm font-medium"
          >
            {{ notification }}
          </div>
        </transition>

        <!-- Error Banner -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm"
        >
          {{ error }}
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center gap-3 mb-8 flex-wrap font-plus-jakarta">
          <!-- Jenis Burung -->
          <div class="relative">
            <select
              v-model="filterJenisBurung"
              @change="onFilterChange"
              class="appearance-none bg-[#f3f4f6] border border-[#6d717f] text-[#6d717f] font-medium text-sm rounded-lg px-4 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[170px] cursor-pointer"
            >
              <option value="">Jenis Burung</option>
              <option value="MURAI_BATU">Murai Batu</option>
              <option value="CUCAK_IJO">Cucak Ijo</option>
              <option value="KACER">Kacer</option>
              <option value="KENARI">Kenari</option>
              <option value="ANIS_KEMBANG">Anis Kembang</option>
              <option value="LOVE_BIRD">Lovebird</option>
            </select>
            <svg
              class="w-4 h-4 absolute right-3 top-2.5 text-[#6d717f] pointer-events-none"
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

          <!-- Status Lomba -->
          <div class="relative">
            <select
              v-model="filterStatus"
              @change="onFilterChange"
              class="appearance-none bg-[#f3f4f6] border border-[#6d717f] text-[#6d717f] font-medium text-sm rounded-lg px-4 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[170px] cursor-pointer"
            >
              <option value="">Status Lomba</option>
              <option value="BELUM_DIMULAI">Belum Dimulai</option>
              <option value="BERLANGSUNG">Berlangsung</option>
              <option value="SELESAI">Selesai</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
            <svg
              class="w-4 h-4 absolute right-3 top-2.5 text-[#6d717f] pointer-events-none"
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

          <!-- Sort By -->
          <div class="relative">
            <select
              v-model="sortBy"
              @change="onFilterChange"
              class="appearance-none bg-[#f3f4f6] border border-[#6d717f] text-[#6d717f] font-medium text-sm rounded-lg px-4 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[170px] cursor-pointer"
            >
              <option value="">Sort By</option>
              <option value="waktuTanggal">Tanggal (Terdekat)</option>
              <option value="namaLomba">Nama Lomba A-Z</option>
              <option value="hargaTiket">Harga Tiket (Terendah)</option>
            </select>
            <svg
              class="w-4 h-4 absolute right-3 top-2.5 text-[#6d717f] pointer-events-none"
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

          <!-- Tambah Lomba -->
          <div class="ml-auto">
            <button
              v-if="authStore.user?.role === 'KOORDINATOR_LOMBA'"
              @click="goToTambah"
              class="bg-[#2e42b2] hover:bg-blue-800 text-white font-semibold text-sm px-5 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Lomba
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-24">
          <div
            class="animate-spin rounded-full h-10 w-10 border-4 border-[#2e42b2] border-t-transparent"
          ></div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!loading && lombaList.length === 0"
          class="flex flex-col items-center justify-center py-24 gap-4"
        >
          <svg
            class="w-36 h-36 text-gray-300"
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
          <p class="text-2xl font-bold text-[#2e42b2] font-plus-jakarta text-center">
            Belum ada lomba yang terdaftar
          </p>
        </div>

        <!-- Lomba List -->
        <div v-else class="flex flex-col gap-4">
          <div
            v-for="lomba in lombaList"
            :key="lomba.id"
            class="bg-white rounded-xl border border-[#1c244f] px-6 py-5 flex items-center gap-6"
          >
            <!-- Left: Info -->
            <div class="flex-1 min-w-0">
              <!-- Top row: nama, badge status, edit -->
              <div class="flex items-center gap-3 flex-wrap mb-2">
                <h2 class="text-xl font-semibold tracking-tight text-gray-900 font-plus-jakarta">
                  {{ lomba.namaLomba }}
                </h2>

                <!-- Status Badge -->
                <span
                  class="px-4 py-1 rounded-full text-xs font-semibold border font-plus-jakarta shrink-0"
                  :style="{
                    backgroundColor: getStatusStyle(lomba.status).bg,
                    color: getStatusStyle(lomba.status).text,
                    borderColor: getStatusStyle(lomba.status).border,
                  }"
                >
                  {{ getStatusStyle(lomba.status).label }}
                </span>

                <!-- Edit Icon (only for BELUM_DIMULAI) -->
                <button
                  v-if="canEdit(lomba.status)"
                  @click="goToEdit(lomba.id)"
                  class="text-gray-400 hover:text-[#2e42b2] transition-colors cursor-pointer"
                  title="Edit Lomba"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.415.586H8v-2.414a2 2 0 01.586-1.414z"
                    />
                  </svg>
                </button>
              </div>

              <!-- Harga -->
              <p class="text-lg text-gray-700 mb-3">{{ formatHarga(lomba.hargaTiket) }}</p>

              <!-- Info chips -->
              <div class="flex flex-wrap gap-3">
                <!-- Tanggal & Waktu -->
                <div
                  class="flex items-center gap-1.5 bg-[#dee8fb] border border-[#131927] text-[#131927] text-sm px-3 py-2 rounded-lg"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {{ formatWaktu(lomba.waktuTanggal) }}
                </div>

                <!-- Lokasi -->
                <div
                  class="flex items-center gap-1.5 bg-[#dee8fb] border border-[#1c244f] text-[#1c244f] text-sm px-3 py-2 rounded-lg"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  {{ lomba.lokasi }}
                </div>

                <!-- Jenis Burung -->
                <div
                  class="flex items-center gap-1.5 bg-[#dee8fb] border border-[#1c244f] text-[#1c244f] text-sm px-3 py-2 rounded-lg"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  {{ formatJenisBurung(lomba.jenisBurung) }}
                </div>
              </div>
            </div>

            <!-- Right: Actions -->
            <div class="flex flex-col gap-2 shrink-0 min-w-[140px]">
              <button
                @click="goToDetail(lomba.id)"
                class="bg-[#2e42b2] hover:bg-blue-800 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer w-full font-plus-jakarta"
              >
                Detail
              </button>
              <button
                v-if="canScore(lomba)"
                @click="router.push({ path: '/penjurian', query: { lombaId: lomba.id } })"
                class="bg-[#2e42b2] hover:bg-blue-800 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer w-full font-plus-jakarta"
              >
                Penilaian
              </button>
              <button
                v-if="canEdit(lomba.status)"
                @click="openDeleteModal(lomba)"
                class="bg-[#ec221f] hover:bg-red-700 text-white text-sm font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer w-full font-plus-jakarta"
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
          Apakah Anda yakin ingin menghapus {{ lombaToDelete?.namaLomba }}?
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
            class="flex-1 py-2.5 rounded-xl bg-[#2E42B2] text-white text-sm font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
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
