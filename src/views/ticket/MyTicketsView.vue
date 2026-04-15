<script setup lang="ts">
import { ref, computed } from 'vue'
import TicketCard from '@/components/ticket/TicketCard.vue'
import FilterSheet from '@/components/ticket/FilterSheet.vue'
import type { Ticket } from '@/interfaces/ticket.interface'

const showFilter = ref(false)
const searchQuery = ref('')
const activeStatus = ref('all')
const activeSort = ref('newest')

// -------------------------------------------------------
// TODO: ganti mock ini dengan data dari API
// GET /api/profile/my-tickets
// -------------------------------------------------------
const tickets = ref<Ticket[]>([
  {
    id: 1,
    nama_lomba: 'SILOBUR KM CUP 2026',
    tanggal: 'Mar 28, 2026 - 11.00 WIB',
    lokasi: 'Jl. Jatijajar, Depok',
    jenis_burung: 'Murai Batu',
    kelas: 'RADJA',
    status: 'Paid',
    keterangan_tolak: null,
    can_reupload: true,
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 2,
    nama_lomba: 'BERKICAU 2025',
    tanggal: 'Mar 28, 2026 - 11.00 WIB',
    lokasi: 'Jl. Jatijajar, Depok',
    jenis_burung: 'Murai Batu',
    kelas: 'UTAMA',
    status: 'Unpaid',
    keterangan_tolak: null,
    can_reupload: true,
    created_at: '2026-02-20T08:00:00Z',
  },
  {
    id: 3,
    nama_lomba: 'Piala Bupati Kebumen',
    tanggal: 'Mar 20, 2026 - 11.00 WIB',
    lokasi: 'Alun-Alun Pancasila',
    jenis_burung: 'Cucak Ijo',
    kelas: 'PRATAMA',
    status: 'Menunggu Konfirmasi',
    keterangan_tolak: null,
    can_reupload: true,
    created_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 4,
    nama_lomba: 'Piala Walikota 2026',
    tanggal: 'Feb 23, 2026 - 11.00 WIB',
    lokasi: 'GOR Kota Bandung',
    jenis_burung: 'Murai Batu',
    kelas: 'RADJA',
    status: 'Invalid',
    keterangan_tolak: 'Foto bukti transfer buram dan kurang jelas',
    can_reupload: true,
    created_at: '2026-02-01T07:00:00Z',
  },
])

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

<template>
  <!-- Header sudah dihandle AppLayout — AppHeader mobile + AppSidebar desktop -->
  <div class="flex flex-col gap-5 bg-[#f9fafb] min-h-full pb-5 font-plus-jakarta">

    <!-- Search + Filter -->
    <div class="flex items-center gap-2 px-5 pt-5">
      <div class="flex flex-1 items-center gap-2 h-[38px] rounded-[6px] bg-[#dee8fb] border border-[#2e42b2] px-5 overflow-hidden">
        <span class="flex-1 text-base font-medium text-[#2e42b2] opacity-70 leading-6 select-none">
          Cari Tiket Saya
        </span>
        <!--
          TODO: uncomment saat integrasi BE, hapus <span> di atas
          <input
            v-model="searchQuery"
            class="flex-1 bg-transparent outline-none text-base font-medium text-[#2e42b2] placeholder-[#2e42b2]/70"
            placeholder="Cari Tiket Saya"
          />
        -->
        <img src="/icons/search.svg" alt="" class="w-5 h-5 flex-shrink-0" />
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

    <!-- Ticket list / empty state -->
    <div class="flex flex-col gap-[10px] px-5">
      <div
        v-if="filteredTickets.length === 0"
        class="flex flex-col items-center justify-center py-24 gap-4"
      >
        <img src="/illustrations/data-not-found.svg" alt="Tidak ada tiket" class="w-[150px] h-[150px]" />
        <b class="text-[28px] leading-[34px] text-[#2e42b2] text-center">Tiket tidak ditemukan</b>
      </div>

      <TicketCard
        v-else
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        :ticket="ticket"
      />
    </div>

    <!-- Filter Sheet -->
    <FilterSheet
      v-model="showFilter"
      v-model:status="activeStatus"
      v-model:sort="activeSort"
    />
  </div>
</template>
