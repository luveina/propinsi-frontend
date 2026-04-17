<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Ticket } from '@/interfaces/ticket.interface'
import calendarIcon from '@/assets/calendar-outline.svg'
import locationIcon from '@/assets/location-sharp.svg'
import birdIcon from '@/assets/lucide_bird.svg'

const props = defineProps<{ ticket: Ticket }>()
const router = useRouter()

const badgeClass = computed(() => {
  const map: Record<string, string> = {
    Paid: 'bg-[#3da755] text-[#c5e9cd]',
    Unpaid: 'bg-[#6d717f] text-[#e2e4e8]',
    'Menunggu Konfirmasi': 'bg-[#ffaa00] text-[#fff1d6]',
    Invalid: 'bg-[#d93e39] text-[#fac5c3]',
    Expired: 'bg-[#d93e39] text-[#fac5c3]',  // sama styling dengan Invalid
  }
  return map[props.ticket.status] ?? ''
})

const badgeLabel = computed(() => {
  const map: Record<string, string> = {
    Paid: 'Dibayar',
    Unpaid: 'Belum dibayar',
    'Menunggu Konfirmasi': 'Menunggu Konfirmasi',
    Invalid: 'Invalid',
    Expired: 'Expired',
  }
  return map[props.ticket.status] ?? props.ticket.status
})

const messageText = computed(() => {
  switch (props.ticket.status) {
    case 'Paid':
      return 'Pembayaran terkonfirmasi. Harap unduh E-Ticket!'
    case 'Unpaid':
      return 'Pembayaran belum dilakukan. Harap lakukan pembayaran.'
    case 'Menunggu Konfirmasi':
      return 'Mohon tunggu, bukti pembayaran sedang diverifikasi oleh admin.'
    case 'Invalid':
      return `Alasan ditolak: ${props.ticket.keterangan_tolak ?? '-'}`
    case 'Expired':
      return 'E-Ticket sudah expired karena tiket tidak dibayar dalam kurun waktu 2 jam.'
    default:
      return ''
  }
})

function goToDetail() {
  router.push({ name: 'TicketDetail', params: { id: props.ticket.id } })
}

function goToUpload() {
  // TODO: arahkan ke halaman Upload Bukti Pembayaran (PBI-17)
  // router.push({ name: 'UploadBukti', params: { id: props.ticket.id } })
}

function goToUploadUlang() {
  if (!props.ticket.can_reupload) {
    // Reservasi expired — arahkan ke reservasi ulang
    // TODO: router.push({ name: 'ReservasiUlang' })
    return
  }
  // TODO: arahkan ke halaman Upload Bukti Pembayaran (PBI-17)
  // router.push({ name: 'UploadBukti', params: { id: props.ticket.id } })
}
</script>

<template>
  <div
    class="self-stretch rounded-[6.85px] bg-[#f9fafb] border-[0.8px] border-[#2e42b2] overflow-hidden flex flex-col items-start py-[10px] gap-[7.5px] font-plus-jakarta"
    :class="ticket.status === 'Paid' ? 'cursor-pointer hover:shadow-md hover:shadow-[#2e42b2]/10 transition-shadow' : ''"
    @click="ticket.status === 'Paid' ? goToDetail() : undefined"
  >
    <!-- Header: nama lomba + badge -->
    <div class="self-stretch flex items-center justify-between px-[10px] gap-5">
      <b class="text-base leading-6 text-[#2e42b2]">{{ ticket.nama_lomba }}</b>
      <div :class="['rounded-[11.14px] flex items-center justify-center py-[5.9px] px-[11.1px] flex-shrink-0', badgeClass]">
        <span class="text-[10.4px] font-semibold tracking-[0.15px] leading-[17.82px] whitespace-nowrap">{{ badgeLabel }}</span>
      </div>
    </div>

    <!-- Pesan kontekstual -->
    <div class="self-stretch bg-[#f9fafb] overflow-hidden flex flex-col items-start px-[10px]">
      <p
        class="self-stretch text-sm font-medium leading-5"
        :class="ticket.status === 'Invalid' || ticket.status === 'Expired' ? 'text-[#a9302d]' : 'text-[#374151]'"
      >
        {{ messageText }}
      </p>
    </div>

    <!-- Meta info: tanggal, lokasi, jenis burung -->
    <div class="self-stretch flex items-start px-[10px] gap-[10px] flex-wrap">
      <div class="flex items-center gap-[5px]">
        <img :src="calendarIcon" style="width:13.5px;height:13.5px;" />
        <span class="text-[9.01px] leading-[140%] font-inter text-[#374151]">{{ ticket.tanggal }}</span>
      </div>
      <div class="flex items-center gap-[5px]">
        <img :src="locationIcon" style="width:13.5px;height:13.5px;" />
        <span class="text-[9.01px] leading-[140%] font-inter text-[#374151]">{{ ticket.lokasi }}</span>
      </div>
      <div class="flex items-center gap-[5px]">
        <img :src="birdIcon" style="width:13.5px;height:13.5px;" />
        <span class="text-[9.01px] leading-[140%] font-inter text-[#374151]">{{ ticket.jenis_burung }}</span>
      </div>
    </div>

    <!-- Action button -->
    <div class="self-stretch bg-[#f9fafb] overflow-hidden flex flex-col items-start px-[10px]">

      <!-- PAID -->
      <div
        v-if="ticket.status === 'Paid'"
        class="self-stretch rounded-[5.76px] bg-[#2e42b2] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-pointer active:opacity-85 transition-opacity"
        @click.stop="goToDetail"
      >
        <b class="text-sm leading-5 text-[#f9fafb]">Lihat E-Ticket</b>
      </div>

      <!-- UNPAID -->
      <div
        v-else-if="ticket.status === 'Unpaid'"
        class="self-stretch rounded-[5.76px] bg-[#6d717f] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-pointer active:opacity-85 transition-opacity"
        @click.stop="goToUpload"
      >
        <b class="text-sm leading-5 text-[#f9fafb]">Upload Bukti Pembayaran</b>
      </div>

      <!-- MENUNGGU KONFIRMASI — disabled -->
      <div
        v-else-if="ticket.status === 'Menunggu Konfirmasi'"
        class="self-stretch rounded-[5.76px] bg-[#9cbff4] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-not-allowed opacity-75"
        title="Mohon tunggu, bukti pembayaran sedang diverifikasi oleh admin."
      >
        <span class="text-sm font-medium leading-5 text-[#2e42b2]">Lihat E-Ticket</span>
      </div>

      <!-- INVALID -->
      <div
        v-else-if="ticket.status === 'Invalid'"
        class="self-stretch rounded-[5.76px] bg-[#a9302d] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-pointer active:opacity-85 transition-opacity"
        @click.stop="goToUploadUlang"
      >
        <b class="text-sm leading-5 text-[#f9fafb]">Upload Ulang Bukti Pembayaran</b>
      </div>

      <!-- EXPIRED — tidak bisa upload ulang, harus reservasi baru -->
      <div
        v-else-if="ticket.status === 'Expired'"
        class="self-stretch rounded-[5.76px] bg-[#6d717f] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-not-allowed opacity-75"
        title="Tiket sudah expired. Silakan lakukan reservasi ulang."
      >
        <span class="text-sm font-medium leading-5 text-[#f9fafb]">Reservasi Ulang</span>
      </div>

    </div>
  </div>
</template>
