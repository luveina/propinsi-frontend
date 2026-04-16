<template>
  <div class="min-h-screen bg-[#F4F7FE] font-plus-jakarta flex flex-col">

    <!-- Backdrop + Drawer (mobile only) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="!isDesktop && isSidebarOpen"
          @click="isSidebarOpen = false"
          class="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
        />
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

        <!-- Header putih -->
        <div class="bg-white px-10 py-5 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h1 class="text-4xl font-bold text-[#2E42B2] font-plus-jakarta">Detail E-Ticket</h1>
          <RouterLink
            to="/profile"
            class="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline"
          >
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

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-10 pt-6 pb-8">

          <!-- Tombol Kembali -->
          <button @click="router.back()" class="text-[#2E42B2] font-semibold text-[18px] flex items-center gap-2 hover:opacity-70 cursor-pointer mb-6">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
            </svg>
            Kembali
          </button>

          <!-- Loading -->
          <div v-if="loading" class="flex justify-center items-center py-24">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"></div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="text-sm text-[#d93e39] py-10">{{ error }}</div>

          <!-- Tiket tidak ditemukan -->
          <div v-else-if="!ticket" class="flex flex-col items-center justify-center py-24 gap-4">
            <img src="@/assets/empty-box.svg" alt="Tidak ada tiket" class="w-[150px] h-[150px]" />
            <p class="text-xl font-bold text-[#2e42b2] text-center">Tiket tidak ditemukan</p>
          </div>

          <!-- Content -->
          <template v-else>
            <div class="max-w-md flex flex-col gap-5">
              <div id="ticket-printable" class="rounded-[6.85px] bg-[#f9fafb] border-[0.8px] border-[#2e42b2] overflow-hidden flex flex-col gap-[10px] p-[10px]">
                <div class="flex items-center justify-between gap-5">
                  <b class="text-[28px] leading-[34px] text-[#2e42b2]">{{ ticket.nama_lomba }}</b>
                </div>
                <div class="flex flex-col items-start">
                  <div class="rounded-[15px] bg-[#3da755] flex items-center justify-center py-2 px-[15px]">
                    <span class="text-sm font-semibold tracking-[0.15px] text-[#c5e9cd]">Dibayar</span>
                  </div>
                </div>
                <div class="flex items-end gap-5 flex-wrap">
                  <div class="flex-1 min-w-[120px] flex flex-col gap-[7px]">
                    <span class="text-base font-semibold text-[#2e42b2] leading-6">Kelas:</span>
                    <div class="relative h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
                      <Icon icon="mdi:timer-sand" class="absolute top-[10px] left-[10px] w-6 h-6 text-[#2e42b2]" />
                      <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.kelas }}</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-[120px] flex flex-col gap-[7px]">
                    <span class="text-base font-semibold text-[#2e42b2] leading-6">Jenis Burung:</span>
                    <div class="relative h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
                      <Icon icon="mdi:bird" class="absolute top-[10.23px] left-[10px] w-6 h-6 text-[#2e42b2]" />
                      <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.jenis_burung }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-[7px]">
                  <span class="text-base font-semibold text-[#2e42b2] leading-6">Tanggal - Waktu:</span>
                  <div class="relative w-full h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
                    <Icon icon="mdi:calendar-outline" class="absolute top-[10px] left-[10px] w-6 h-6 text-[#2e42b2]" />
                    <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.tanggal }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-[7px]">
                  <span class="text-base font-semibold text-[#2e42b2] leading-6">Alamat:</span>
                  <div class="relative w-full h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
                    <Icon icon="mdi:map-marker-outline" class="absolute top-[10px] left-[9px] w-6 h-6 text-[#2e42b2]" />
                    <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.lokasi }}</span>
                  </div>
                </div>
                <div class="rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] w-full p-5 flex flex-col items-center gap-2">
                  <span class="w-full text-[18px] font-semibold text-[#2e42b2] leading-7">Blok dipilih: {{ ticket.blok ?? '-' }}</span>
                  <span class="w-full text-[18px] font-semibold text-[#2e42b2] leading-7">Nomor Gantangan:</span>
                  <div class="rounded-[8px] bg-[#265bda] w-[100px] h-[100px] flex items-center justify-center">
                    <b class="text-[32px] leading-[38px] text-[#f9fafb]">{{ ticket.nomor_gantangan ?? '-' }}</b>
                  </div>
                </div>
              </div>
              <div
                class="w-[224px] rounded-[6px] bg-[#2e42b2] flex items-center justify-center py-[13px] px-6 cursor-pointer active:opacity-85 transition-opacity"
                @click="downloadTicket"
              >
                <b class="text-base tracking-[0.2px] leading-6 text-white">Unduh E-Ticket</b>
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

          <!-- Tombol Kembali -->
          <div class="w-full">
            <button @click="router.back()" class="text-[#2E42B2] font-semibold text-[18px] flex items-center gap-2 hover:opacity-70 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
              </svg>
              Kembali
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex justify-center items-center py-24 w-full">
            <Icon icon="mdi:loading" class="w-10 h-10 text-[#2e42b2] animate-spin" />
          </div>

          <!-- Error -->
          <div v-else-if="error" class="text-sm text-[#d93e39] py-10">{{ error }}</div>

          <!-- Tiket tidak ditemukan -->
          <div v-else-if="!ticket" class="flex flex-col items-center justify-center py-24 gap-4 w-full">
            <img src="@/assets/empty-box.svg" alt="Tidak ada tiket" class="w-[150px] h-[150px]" />
            <p class="text-sm text-gray-500">Tiket tidak ditemukan.</p>
          </div>

          <!-- Content -->
          <template v-else>
            <div id="ticket-printable" class="self-stretch rounded-[6.85px] bg-[#f9fafb] border-[0.8px] border-[#2e42b2] overflow-hidden flex flex-col gap-[10px] p-[10px]">
              <div class="flex items-center justify-between gap-5">
                <b class="text-[28px] leading-[34px] text-[#2e42b2]">{{ ticket.nama_lomba }}</b>
              </div>
              <div class="flex flex-col items-start">
                <div class="rounded-[15px] bg-[#3da755] flex items-center justify-center py-2 px-[15px]">
                  <span class="text-sm font-semibold tracking-[0.15px] text-[#c5e9cd]">Dibayar</span>
                </div>
              </div>
              <div class="flex items-end gap-5 flex-wrap">
                <div class="flex-1 min-w-[120px] flex flex-col gap-[7px]">
                  <span class="text-base font-semibold text-[#2e42b2] leading-6">Kelas:</span>
                  <div class="relative h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
                    <Icon icon="mdi:timer-sand" class="absolute top-[10px] left-[10px] w-6 h-6 text-[#2e42b2]" />
                    <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.kelas }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-[120px] flex flex-col gap-[7px]">
                  <span class="text-base font-semibold text-[#2e42b2] leading-6">Jenis Burung:</span>
                  <div class="relative h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
                    <Icon icon="mdi:bird" class="absolute top-[10.23px] left-[10px] w-6 h-6 text-[#2e42b2]" />
                    <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.jenis_burung }}</span>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-[7px]">
                <span class="text-base font-semibold text-[#2e42b2] leading-6">Tanggal - Waktu:</span>
                <div class="relative w-full h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
                  <Icon icon="mdi:calendar-outline" class="absolute top-[10px] left-[10px] w-6 h-6 text-[#2e42b2]" />
                  <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.tanggal }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-[7px]">
                <span class="text-base font-semibold text-[#2e42b2] leading-6">Alamat:</span>
                <div class="relative w-full h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
                  <Icon icon="mdi:map-marker-outline" class="absolute top-[10px] left-[9px] w-6 h-6 text-[#2e42b2]" />
                  <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.lokasi }}</span>
                </div>
              </div>
              <div class="rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] w-full p-5 flex flex-col items-center gap-2">
                <span class="w-full text-[18px] font-semibold text-[#2e42b2] leading-7">Blok dipilih: {{ ticket.blok ?? '-' }}</span>
                <span class="w-full text-[18px] font-semibold text-[#2e42b2] leading-7">Nomor Gantangan:</span>
                <div class="rounded-[8px] bg-[#265bda] w-[100px] h-[100px] flex items-center justify-center">
                  <b class="text-[32px] leading-[38px] text-[#f9fafb]">{{ ticket.nomor_gantangan ?? '-' }}</b>
                </div>
              </div>
            </div>
            <div
              class="w-[224px] rounded-[6px] bg-[#2e42b2] flex items-center justify-center py-[13px] px-6 cursor-pointer active:opacity-85 transition-opacity"
              @click="downloadTicket"
            >
              <b class="text-base tracking-[0.2px] leading-6 text-white">Unduh E-Ticket</b>
            </div>
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
import Sidebar from '@/components/Sidebar.vue'
import HeaderMobile from '@/components/HeaderMobile.vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useTicketStore } from '@/stores/ticket/ticket.store'
import { storeToRefs } from 'pinia'
import html2canvas from 'html2canvas'

const { isDesktop } = useBreakpoint()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)
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

  const canvas = await html2canvas(el, { scale: 2 })
  const link = document.createElement('a')
  link.download = `eticket-${ticket.value?.nama_lomba ?? 'tiket'}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
