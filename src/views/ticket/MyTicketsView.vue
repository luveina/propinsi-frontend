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

        <!-- Header putih seperti KatalogLombaView -->
        <div class="bg-white px-10 py-5 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h1 class="text-4xl font-bold text-[#2E42B2] font-plus-jakarta">Tiket Saya</h1>
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
              <p class="font-semibold text-sm leading-tight text-gray-900 font-plus-jakarta">{{ authStore.user?.fullName }}</p>
              <p class="text-xs text-gray-500 font-plus-jakarta">{{ authStore.user?.role?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </RouterLink>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-10 pt-6 pb-8">

          <!-- Filter bar inline seperti KatalogLombaView -->
          <div class="flex items-end gap-3 mb-6 flex-wrap font-plus-jakarta">

            <!-- Search -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari Tiket Saya"
                class="bg-[#E8EDF5] border border-[#2e42b2] text-[#2e42b2] placeholder-[#2e42b2] placeholder:opacity-60 text-sm rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e42b2] w-[190px] font-medium"
              />
              <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
            </div>

            <!-- Filter Status -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-[#2e42b2] font-bold pl-0.5 uppercase tracking-wider">Status Tiket</label>
              <div class="relative">
                <select
                  v-model="activeStatus"
                  class="appearance-none bg-[#E8EDF5] border border-[#2e42b2] text-[#2e42b2] text-sm rounded-lg pl-4 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e42b2] w-[180px] font-medium cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="Paid">Dibayar</option>
                  <option value="Unpaid">Belum Dibayar</option>
                  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                  <option value="Invalid">Invalid</option>
                  <option value="Expired">Expired</option>
                </select>
                <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Sort By -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-[#2e42b2] font-bold pl-0.5 uppercase tracking-wider">Sort By</label>
              <div class="relative">
                <select
                  v-model="activeSort"
                  class="appearance-none bg-[#E8EDF5] border border-[#2e42b2] text-[#2e42b2] text-sm rounded-lg pl-4 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-[#2e42b2] w-[160px] font-medium cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
                <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#2e42b2] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex justify-center items-center py-24">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"></div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-24 gap-3">
            <Icon icon="mdi:alert-circle-outline" class="w-16 h-16 text-[#d93e39]" />
            <p class="text-sm text-[#d93e39] text-center">{{ error }}</p>
            <button class="px-5 py-2 rounded-lg bg-[#2e42b2] text-white text-sm font-semibold" @click="ticketStore.fetchMyTickets()">Coba Lagi</button>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredTickets.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
            <img src="@/assets/data-not-found.svg" alt="Tidak ada tiket" class="w-[150px] h-[150px]" />
            <p class="text-xl font-bold text-[#2e42b2] text-center">Tiket tidak ditemukan</p>
          </div>

          <!-- Ticket list -->
          <div v-else class="flex flex-col gap-4">
            <TicketCard v-for="ticket in filteredTickets" :key="ticket.id" :ticket="ticket" />
          </div>

        </div>
      </div>
    </div>

    <!-- ── MOBILE ──────────────────────────────────────────────────── -->
    <div v-else class="flex flex-col min-h-screen bg-white">
      <HeaderMobile title="Tiket Saya" @menu-click="isSidebarOpen = true" />

      <main class="flex-1 flex flex-col gap-5 pb-5">

        <!-- Search + Filter -->
        <div class="flex items-center gap-2 px-5 pt-5">
          <div class="flex flex-1 items-center gap-2 h-[38px] rounded-[6px] bg-[#dee8fb] border border-[#2e42b2] px-5 overflow-hidden">
            <input
              v-model="searchQuery"
              class="flex-1 bg-transparent outline-none text-base font-medium text-[#2e42b2] placeholder-[#2e42b2]/70"
              placeholder="Cari Tiket Saya"
            />
            <Icon icon="mdi:magnify" class="w-5 h-5 flex-shrink-0 text-[#2e42b2]" />
          </div>
          <button
            class="flex-shrink-0 w-[38px] h-[38px] flex items-center justify-center rounded-lg bg-[#dee8fb] border border-[#2e42b2] cursor-pointer hover:bg-[#c7d7f5] transition-colors"
            @click="showFilter = true"
          >
            <svg class="w-5 h-5 text-[#2e42b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6" stroke-width="2" stroke-linecap="round"/>
              <line x1="7" y1="12" x2="17" y2="12" stroke-width="2" stroke-linecap="round"/>
              <line x1="10" y1="18" x2="14" y2="18" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-24">
          <Icon icon="mdi:loading" class="w-10 h-10 text-[#2e42b2] animate-spin" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-24 gap-3 px-5">
          <Icon icon="mdi:alert-circle-outline" class="w-16 h-16 text-[#d93e39]" />
          <p class="text-sm text-[#d93e39] text-center">{{ error }}</p>
          <button class="px-5 py-2 rounded-lg bg-[#2e42b2] text-white text-sm font-semibold" @click="ticketStore.fetchMyTickets()">Coba Lagi</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTickets.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
          <img src="@/assets/data-not-found.svg" alt="Tidak ada tiket" class="w-[150px] h-[150px]" />
          <b class="text-[28px] leading-[34px] text-[#2e42b2] text-center">Tiket tidak ditemukan</b>
        </div>

        <!-- Ticket list -->
        <div v-else class="flex flex-col gap-[10px] px-5">
          <TicketCard v-for="ticket in filteredTickets" :key="ticket.id" :ticket="ticket" />
        </div>

      </main>

      <!-- Filter Sheet (mobile only) -->
      <FilterSheet
        v-model="showFilter"
        v-model:status="activeStatus"
        v-model:sort="activeSort"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import Sidebar from '@/components/Sidebar.vue'
import HeaderMobile from '@/components/HeaderMobile.vue'
import TicketCard from '@/components/ticket/TicketCard.vue'
import FilterSheet from '@/components/ticket/FilterSheet.vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useTicketStore } from '@/stores/ticket/ticket.store'
import { storeToRefs } from 'pinia'

const { isDesktop } = useBreakpoint()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)
const showFilter = ref(false)
const searchQuery = ref('')
const activeStatus = ref('all')
const activeSort = ref('newest')

const ticketStore = useTicketStore()
const { tickets, loading, error } = storeToRefs(ticketStore)

onMounted(() => {
  ticketStore.fetchMyTickets()
})

const filteredTickets = computed(() => {
  let result = [...tickets.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((t) => t.nama_lomba.toLowerCase().includes(q))
  }

  if (activeStatus.value !== 'all') {
    result = result.filter((t) => t.status === activeStatus.value)
  }

  result.sort((a, b) => {
    const da = new Date(a.created_at).getTime()
    const db = new Date(b.created_at).getTime()
    return activeSort.value === 'newest' ? db - da : da - db
  })

  return result
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
