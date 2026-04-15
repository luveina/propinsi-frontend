<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useTicketStore } from '@/stores/ticket/ticket.store'
import { storeToRefs } from 'pinia'

const route = useRoute()
const ticketStore = useTicketStore()
const { tickets, loading, error } = storeToRefs(ticketStore)

// Ambil tiket yang sesuai dari store berdasarkan id di route params
const ticket = computed(() =>
  tickets.value.find((t) => String(t.id) === String(route.params.id)) ?? null
)

onMounted(async () => {
  // Fetch hanya jika store masih kosong (misalnya direct access URL)
  if (tickets.value.length === 0) {
    await ticketStore.fetchMyTickets()
  }
})

function downloadTicket() {
  // TODO: implementasi unduh menggunakan html2canvas atau jspdf
  // import html2canvas from 'html2canvas'
  // const el = document.getElementById('ticket-printable')
  // html2canvas(el!).then(canvas => {
  //   const link = document.createElement('a')
  //   link.download = `eticket-${ticket.value?.nama_lomba}.png`
  //   link.href = canvas.toDataURL()
  //   link.click()
  // })
  alert('TODO: Unduh E-Ticket — implementasi setelah integrasi BE')
}
</script>

<template>
  <div class="flex flex-col items-center gap-5 bg-[#f9fafb] min-h-full pb-5 px-5 pt-5 font-plus-jakarta">

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <Icon icon="mdi:loading" class="w-10 h-10 text-[#2e42b2] animate-spin" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-sm text-[#d93e39] py-10">{{ error }}</div>

    <!-- Tiket tidak ditemukan -->
    <div v-else-if="!ticket" class="flex flex-col items-center justify-center py-24 gap-4">
      <Icon icon="mdi:ticket-off-outline" class="text-[#9cbff4]" style="width:80px;height:80px;" />
      <p class="text-sm text-gray-500">Tiket tidak ditemukan.</p>
    </div>

    <!-- Content -->
    <template v-else>

      <!-- Detail card (ini yang akan di-download) -->
      <div
        id="ticket-printable"
        class="self-stretch relative rounded-[6.85px] bg-[#f9fafb] border-[0.8px] border-[#2e42b2] overflow-hidden flex flex-col gap-[10px] p-[10px]"
      >
        <!-- Nama lomba -->
        <div class="flex items-center justify-between rounded-t-[6.85px] gap-5">
          <b class="text-[28px] leading-[34px] text-[#2e42b2]">{{ ticket.nama_lomba }}</b>
          <div class="h-[19.3px] w-[62.3px]" />
        </div>

        <!-- Badge Paid -->
        <div class="flex flex-col items-start">
          <div class="rounded-[15px] bg-[#3da755] flex items-center justify-center py-2 px-[15px]">
            <span class="text-sm font-semibold tracking-[0.15px] text-[#c5e9cd]">Dibayar</span>
          </div>
        </div>

        <!-- Kelas + Jenis Burung -->
        <div class="flex items-end gap-5 flex-wrap">
          <!-- Kelas -->
          <div class="flex-1 min-w-[120px] flex flex-col gap-[7px]">
            <span class="text-base font-semibold text-[#2e42b2] leading-6">Kelas:</span>
            <div class="relative h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
              <Icon icon="mdi:timer-sand" class="absolute top-[10px] left-[10px] w-6 h-6 text-[#2e42b2]" />
              <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.kelas }}</span>
            </div>
          </div>
          <!-- Jenis Burung -->
          <div class="flex-1 min-w-[120px] flex flex-col gap-[7px]">
            <span class="text-base font-semibold text-[#2e42b2] leading-6">Jenis Burung:</span>
            <div class="relative h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
              <Icon icon="mdi:bird" class="absolute top-[10.23px] left-[10px] w-6 h-6 text-[#2e42b2]" />
              <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.jenis_burung }}</span>
            </div>
          </div>
        </div>

        <!-- Tanggal - Waktu -->
        <div class="flex flex-col gap-[7px]">
          <span class="text-base font-semibold text-[#2e42b2] leading-6">Tanggal - Waktu:</span>
          <div class="relative w-full h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
            <Icon icon="mdi:calendar-outline" class="absolute top-[10px] left-[10px] w-6 h-6 text-[#2e42b2]" />
            <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.tanggal }}</span>
          </div>
        </div>

        <!-- Alamat -->
        <div class="flex flex-col gap-[7px]">
          <span class="text-base font-semibold text-[#2e42b2] leading-6">Alamat:</span>
          <div class="relative w-full h-11 rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] overflow-hidden">
            <Icon icon="mdi:map-marker-outline" class="absolute top-[10px] left-[9px] w-6 h-6 text-[#2e42b2]" />
            <span class="absolute top-[10px] left-11 text-sm font-medium text-[#2e42b2] leading-5">{{ ticket.lokasi }}</span>
          </div>
        </div>

        <!-- Blok + Nomor Gantangan -->
        <div class="rounded-[9px] bg-[#dee8fb] border border-[#2e42b2] w-full p-5 flex flex-col items-center gap-2">
          <span class="w-full text-[18px] font-semibold text-[#2e42b2] leading-7">
            Blok dipilih: {{ ticket.blok ?? '-' }}
          </span>
          <span class="w-full text-[18px] font-semibold text-[#2e42b2] leading-7">Nomor Gantangan:</span>
          <div class="rounded-[8px] bg-[#265bda] w-[100px] h-[100px] flex items-center justify-center">
            <b class="text-[32px] leading-[38px] text-[#f9fafb]">{{ ticket.nomor_gantangan ?? '-' }}</b>
          </div>
        </div>
      </div>

      <!-- Unduh E-Ticket -->
      <div
        class="w-[224px] rounded-[6px] bg-[#2e42b2] flex items-center justify-center py-[13px] px-6 cursor-pointer active:opacity-85 transition-opacity"
        @click="downloadTicket"
      >
        <b class="text-base tracking-[0.2px] leading-6 text-white">Unduh E-Ticket</b>
      </div>

    </template>
  </div>
</template>
