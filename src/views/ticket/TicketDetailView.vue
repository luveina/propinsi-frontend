<template>
  <div class="min-h-screen bg-[#F4F7FE] font-plus-jakarta flex flex-col">

    <!-- Backdrop + Drawer (mobile only) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="!isDesktop && isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" />
      </Transition>
      <Transition name="slide">
        <div v-if="!isDesktop && isSidebarOpen" class="fixed inset-y-0 left-0 z-[70] w-64 shadow-2xl">
          <Sidebar />
        </div>
      </Transition>
    </Teleport>

    <!-- ── DESKTOP ─────────────────────────────────────────────────── -->
    <div v-if="isDesktop" class="flex h-screen overflow-hidden">
      <Sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="bg-white px-10 py-5 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h1 class="text-4xl font-bold text-[#2E42B2]">Detail E-Ticket</h1>
          <RouterLink to="/profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline">
            <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
            <div class="text-right">
              <p class="font-semibold text-sm leading-tight text-gray-900">{{ authStore.user?.fullName }}</p>
              <p class="text-xs text-gray-500">{{ authStore.user?.role?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </RouterLink>
        </div>

        <div class="flex-1 overflow-y-auto px-10 pt-6 pb-8">
          <button @click="router.back()" class="text-[#2E42B2] font-semibold text-xl flex items-center gap-2 hover:opacity-70 cursor-pointer mb-6">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
            Kembali
          </button>

          <div v-if="loading" class="flex justify-center items-center py-24">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"></div>
          </div>
          <div v-else-if="error" class="text-base text-[#d93e39] py-10">{{ error }}</div>
          <div v-else-if="!ticket" class="flex flex-col items-center justify-center py-24 gap-4">
            <img src="@/assets/empty-box.svg" alt="Tidak ada tiket" class="w-[150px] h-[150px]" />
            <p class="text-2xl font-bold text-[#2e42b2] text-center">Tiket tidak ditemukan</p>
          </div>

          <template v-else>
            <div class="flex flex-col gap-6">

              <!-- Ticket printable -->
              <div id="ticket-printable" class="w-full rounded-[6.85px] bg-[#f9fafb] border border-[#2e42b2] flex flex-col gap-4 p-6">

                <!-- Nama + Badge -->
                <div class="flex items-center justify-between gap-4 flex-wrap">
                  <b class="text-3xl leading-9 text-[#2e42b2]">{{ ticket.nama_lomba }}</b>
                  <div class="rounded-full bg-[#3da755] px-5 py-2 flex-shrink-0">
                    <span class="text-base font-bold text-[#c5e9cd]">Dibayar</span>
                  </div>
                </div>

                <!-- Nama Peserta -->
                <div class="flex flex-col gap-2">
                  <span class="text-base font-semibold text-[#2e42b2]">Nama Peserta:</span>
                  <div class="h-14 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-3 px-4">
                    <span class="text-base font-medium text-[#2e42b2]">{{ ticket.nama_peserta }}</span>
                  </div>
                </div>

                <!-- Kelas + Jenis Burung -->
                <div class="flex gap-5 flex-wrap">
                  <div class="flex-1 min-w-[160px] flex flex-col gap-2">
                    <span class="text-base font-semibold text-[#2e42b2]">Kelas:</span>
                    <div class="h-14 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-3 px-4">
                      <img :src="hourglassIcon" class="w-6 h-6 flex-shrink-0" />
                      <span class="text-base font-medium text-[#2e42b2]">{{ ticket.kelas }}</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-[160px] flex flex-col gap-2">
                    <span class="text-base font-semibold text-[#2e42b2]">Jenis Burung:</span>
                    <div class="h-14 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-3 px-4">
                      <img :src="birdIcon" class="w-6 h-6 flex-shrink-0" />
                      <span class="text-base font-medium text-[#2e42b2]">{{ ticket.jenis_burung }}</span>
                    </div>
                  </div>
                </div>

                <!-- Tanggal - Waktu -->
                <div class="flex flex-col gap-2">
                  <span class="text-base font-semibold text-[#2e42b2]">Tanggal - Waktu:</span>
                  <div class="h-14 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-3 px-4">
                    <img :src="calendarIcon" class="w-6 h-6 flex-shrink-0" />
                    <span class="text-base font-medium text-[#2e42b2]">{{ ticket.tanggal }}</span>
                  </div>
                </div>

                <!-- Alamat -->
                <div class="flex flex-col gap-2">
                  <span class="text-base font-semibold text-[#2e42b2]">Alamat:</span>
                  <div class="h-14 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-3 px-4">
                    <img :src="locationIcon" class="w-6 h-6 flex-shrink-0" />
                    <span class="text-base font-medium text-[#2e42b2]">{{ ticket.lokasi }}</span>
                  </div>
                </div>

                <!-- Blok + Nomor Gantangan -->
                <div class="rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] w-full p-5 flex flex-col items-center gap-3">
                  <span class="w-full text-xl font-semibold text-[#2e42b2]">Blok dipilih: {{ ticket.blok ?? '-' }}</span>
                  <span class="w-full text-xl font-semibold text-[#2e42b2]">Nomor Gantangan:</span>
                  <div class="rounded-[8px] bg-[#265bda] w-[110px] h-[110px] flex items-center justify-center">
                    <b class="text-[40px] leading-[48px] text-[#f9fafb]">{{ ticket.nomor_gantangan ?? '-' }}</b>
                  </div>
                </div>

              </div>

              <!-- Tombol unduh -->
              <div class="flex justify-center">
                <button
                  class="rounded-[6px] bg-[#2e42b2] py-4 px-14 cursor-pointer hover:bg-[#1c2d8f] transition-colors border-none"
                  :disabled="downloading"
                  @click="downloadTicket"
                >
                  <b class="text-lg tracking-[0.2px] text-white">
                    {{ downloading ? 'Mengunduh...' : 'Unduh E-Ticket' }}
                  </b>
                </button>
              </div>

            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ── MOBILE ──────────────────────────────────────────────────── -->
    <div v-else class="flex flex-col min-h-screen bg-white">
      <HeaderMobile title="Detail E-Ticket" @menu-click="isSidebarOpen = true" />
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-md mx-auto px-5 py-5 flex flex-col items-center gap-5">

          <div class="w-full">
            <button @click="router.back()" class="text-[#2E42B2] font-semibold text-[18px] flex items-center gap-2 hover:opacity-70 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
              Kembali
            </button>
          </div>

          <div v-if="loading" class="flex justify-center items-center py-24 w-full">
            <Icon icon="mdi:loading" class="w-10 h-10 text-[#2e42b2] animate-spin" />
          </div>
          <div v-else-if="error" class="text-sm text-[#d93e39] py-10">{{ error }}</div>
          <div v-else-if="!ticket" class="flex flex-col items-center justify-center py-24 gap-4 w-full">
            <img src="@/assets/empty-box.svg" alt="Tidak ada tiket" class="w-[150px] h-[150px]" />
            <p class="text-sm text-gray-500">Tiket tidak ditemukan.</p>
          </div>

          <template v-else>
            <div id="ticket-printable" class="self-stretch rounded-[6.85px] bg-[#f9fafb] border border-[#2e42b2] flex flex-col gap-[10px] p-[10px]">

              <!-- Nama + Badge -->
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <b class="text-[22px] leading-[28px] text-[#2e42b2] flex-1">{{ ticket.nama_lomba }}</b>
                <div class="rounded-[15px] bg-[#3da755] px-[14px] py-[6px] flex-shrink-0">
                  <span class="text-sm font-bold text-[#c5e9cd]">Dibayar</span>
                </div>
              </div>

              <!-- Nama Peserta -->
              <div class="flex flex-col gap-[6px]">
                <span class="text-sm font-semibold text-[#2e42b2]">Nama Peserta:</span>
                <div class="h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-2 px-3">
                  <span class="text-sm font-medium text-[#2e42b2]">{{ ticket.nama_peserta }}</span>
                </div>
              </div>

              <!-- Kelas + Jenis Burung -->
              <div class="flex gap-4 flex-wrap">
                <div class="flex-1 min-w-[120px] flex flex-col gap-[6px]">
                  <span class="text-sm font-semibold text-[#2e42b2]">Kelas:</span>
                  <div class="h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-2 px-3">
                    <img :src="hourglassIcon" class="w-5 h-5 flex-shrink-0" />
                    <span class="text-sm font-medium text-[#2e42b2]">{{ ticket.kelas }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-[120px] flex flex-col gap-[6px]">
                  <span class="text-sm font-semibold text-[#2e42b2]">Jenis Burung:</span>
                  <div class="h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-2 px-3">
                    <img :src="birdIcon" class="w-5 h-5 flex-shrink-0" />
                    <span class="text-sm font-medium text-[#2e42b2]">{{ ticket.jenis_burung }}</span>
                  </div>
                </div>
              </div>

              <!-- Tanggal -->
              <div class="flex flex-col gap-[6px]">
                <span class="text-sm font-semibold text-[#2e42b2]">Tanggal - Waktu:</span>
                <div class="h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-2 px-3">
                  <img :src="calendarIcon" class="w-5 h-5 flex-shrink-0" />
                  <span class="text-sm font-medium text-[#2e42b2]">{{ ticket.tanggal }}</span>
                </div>
              </div>

              <!-- Alamat -->
              <div class="flex flex-col gap-[6px]">
                <span class="text-sm font-semibold text-[#2e42b2]">Alamat:</span>
                <div class="h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] flex items-center gap-2 px-3">
                  <img :src="locationIcon" class="w-5 h-5 flex-shrink-0" />
                  <span class="text-sm font-medium text-[#2e42b2]">{{ ticket.lokasi }}</span>
                </div>
              </div>

              <!-- Blok + Nomor Gantangan -->
              <div class="rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] p-4 flex flex-col items-center gap-2">
                <span class="w-full text-base font-semibold text-[#2e42b2]">Blok dipilih: {{ ticket.blok ?? '-' }}</span>
                <span class="w-full text-base font-semibold text-[#2e42b2]">Nomor Gantangan:</span>
                <div class="rounded-[8px] bg-[#265bda] w-[90px] h-[90px] flex items-center justify-center">
                  <b class="text-[32px] leading-[38px] text-[#f9fafb]">{{ ticket.nomor_gantangan ?? '-' }}</b>
                </div>
              </div>

            </div>

            <!-- Tombol unduh -->
            <button
              class="rounded-[6px] bg-[#2e42b2] py-[13px] px-10 cursor-pointer hover:bg-[#1c2d8f] transition-colors border-none"
              :disabled="downloading"
              @click="downloadTicket"
            >
              <b class="text-base tracking-[0.2px] text-white">
                {{ downloading ? 'Mengunduh...' : 'Unduh E-Ticket' }}
              </b>
            </button>
          </template>

        </div>
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import html2canvas from 'html2canvas'
import Sidebar from '@/components/Sidebar.vue'
import HeaderMobile from '@/components/HeaderMobile.vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useTicketStore } from '@/stores/ticket/ticket.store'
import { storeToRefs } from 'pinia'
import calendarIcon from '@/assets/calendar-outline.svg'
import locationIcon from '@/assets/location-sharp.svg'
import birdIcon from '@/assets/lucide_bird.svg'
import hourglassIcon from '@/assets/hourglass-empty.svg'

const { isDesktop } = useBreakpoint()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)
const downloading = ref(false)
const route = useRoute()
const router = useRouter()

const ticketStore = useTicketStore()
const { tickets, loading, error } = storeToRefs(ticketStore)

const ticket = computed(() =>
  tickets.value.find((t) => String(t.id) === String(route.params.id)) ?? null
)

onMounted(async () => {
  if (tickets.value.length === 0) {
    await ticketStore.fetchMyTickets()
  }
})

async function downloadTicket() {
  const el = document.getElementById('ticket-printable')
  if (!el) return
  downloading.value = true
  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const link = document.createElement('a')
    link.download = `eticket-${ticket.value?.nama_lomba ?? 'tiket'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (e) {
    console.error('Gagal mengunduh tiket:', e)
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
