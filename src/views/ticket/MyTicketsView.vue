<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import TicketCard from '@/components/ticket/TicketCard.vue'
import FilterSheet from '@/components/ticket/FilterSheet.vue'
import { useTicketStore } from '@/stores/ticket/ticket.store'
import { storeToRefs } from 'pinia'

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

<template>
  <div class="flex flex-col gap-5 bg-[#f9fafb] min-h-full pb-5 font-plus-jakarta">

    <!-- Search + Filter row -->
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
      <button
        class="px-5 py-2 rounded-lg bg-[#2e42b2] text-white text-sm font-semibold"
        @click="ticketStore.fetchMyTickets()"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Ticket list / empty state -->
    <div v-else class="flex flex-col gap-[10px] px-5">
      <div
        v-if="filteredTickets.length === 0"
        class="flex flex-col items-center justify-center py-24 gap-4"
      >
        <Icon icon="mdi:ticket-outline" class="text-[#9cbff4]" style="width:100px;height:100px;" />
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
