<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import type { Ticket } from '@/interfaces/ticket.interface'

const props = defineProps<{ ticket: Ticket }>()
const router = useRouter()

const now = ref(Date.now())
let timer: any

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 10000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const effectiveStatus = computed(() => {
  if (props.ticket.status !== 'Unpaid') return props.ticket.status

  const reservasiTime = new Date(props.ticket.waktu_reservasi + 'Z').getTime()
  const limit = 2 * 60 * 60 * 1000

  if (now.value - reservasiTime > limit) {
    return 'Expired'
  }
  return 'Unpaid'
})
// ----------------------------------

const badgeClass = computed(() => {
  const map: Record<string, string> = {
    Paid: 'bg-[#3da755] text-[#c5e9cd]',
    Unpaid: 'bg-[#6d717f] text-[#e2e4e8]',
    'Menunggu Konfirmasi': 'bg-[#ffaa00] text-[#fff1d6]',
    Invalid: 'bg-[#d93e39] text-[#fac5c3]',
    Expired: 'bg-[#d93e39] text-[#fac5c3]',
  }
  return map[effectiveStatus.value] ?? ''
})

const badgeLabel = computed(() => {
  const map: Record<string, string> = {
    Paid: 'Dibayar',
    Unpaid: 'Unpaid',
    'Menunggu Konfirmasi': 'Menunggu Konfirmasi',
    Invalid: 'Invalid',
    Expired: 'Expired',
  }
  return map[effectiveStatus.value] ?? effectiveStatus.value
})

const messageText = computed(() => {
  switch (effectiveStatus.value) {
    case 'Paid': return 'Pembayaran terkonfirmasi. Harap unduh E-Ticket!'
    case 'Unpaid': return 'Pembayaran belum dilakukan. Harap lakukan pembayaran.'
    case 'Menunggu Konfirmasi': return 'Mohon tunggu, bukti pembayaran sedang diverifikasi oleh admin.'
    case 'Invalid':
      return `Alasan ditolak: ${props.ticket.keterangan_tolak ?? '-'}` +
             (props.ticket.can_reupload ? ' (Batas maksimal upload ulang 1 Hari)' : '')
    case 'Expired': return 'Waktu pembayaran telah habis. Tiket expired.'
    default: return ''
  }
})

function goToDetail() {
  router.push({ name: 'TicketDetail', params: { id: props.ticket.id } })
}

function goToUpload() {
  const ticketId = props.ticket.id
  router.push({
    name: 'UploadBukti',
    params: { id: String(ticketId) },
    query: {
      reservasiId: String(ticketId),
      namaLomba: props.ticket.nama_lomba,
      nomorGantangan: props.ticket.nomor_gantangan || 0,
      nominal: props.ticket.nominal,
      waktuReservasi: props.ticket.waktu_reservasi
    }
  })
}

function goToUploadUlang() {
  if (!props.ticket.can_reupload) {
    return
  }
  const ticketId = props.ticket.id

  // Hapus state success lama agar form upload kembali muncul
  sessionStorage.removeItem(`payment_uploaded_${ticketId}`)

  router.push({
    name: 'UploadBukti',
    params: { id: String(ticketId) },
    query: {
      reservasiId: String(ticketId),
      namaLomba: props.ticket.nama_lomba,
      nomorGantangan: props.ticket.nomor_gantangan || 0,
      nominal: props.ticket.nominal,
      waktuReservasi: props.ticket.waktu_reservasi,
      status: props.ticket.status
    }
  })
}
</script>

<template>
  <div
    class="self-stretch rounded-[6.85px] bg-[#f9fafb] border-[0.8px] border-[#2e42b2] overflow-hidden flex flex-col items-start py-[10px] gap-[7.5px] font-plus-jakarta"
    :class="effectiveStatus === 'Paid' ? 'cursor-pointer hover:shadow-md hover:shadow-[#2e42b2]/10 transition-shadow' : ''"
    @click="effectiveStatus === 'Paid' ? goToDetail() : undefined"
  >
    <div class="self-stretch flex items-center justify-between px-[10px] gap-5">
      <b class="text-base leading-6 text-[#2e42b2]">{{ ticket.nama_lomba }}</b>
      <div :class="['rounded-[11.14px] flex items-center justify-center py-[5.9px] px-[11.1px] flex-shrink-0', badgeClass]">
        <span class="text-[10.4px] font-semibold tracking-[0.15px] leading-[17.82px] whitespace-nowrap">{{ badgeLabel }}</span>
      </div>
    </div>

    <div class="self-stretch bg-[#f9fafb] overflow-hidden flex flex-col items-start px-[10px]">
      <p
        class="self-stretch text-sm font-medium leading-5"
        :class="effectiveStatus === 'Invalid' || effectiveStatus === 'Expired' ? 'text-[#a9302d]' : 'text-[#374151]'"
      >
        {{ messageText }}
      </p>
    </div>

    <div class="self-stretch flex items-start px-[10px] gap-[10px] flex-wrap">
      <div class="flex items-center gap-[5px]">
        <Icon icon="mdi:calendar-outline" class="text-[#2e42b2]" style="width:13.5px;height:13.5px;" />
        <span class="text-[9.01px] leading-[140%] font-inter text-[#374151]">{{ ticket.tanggal }}</span>
      </div>
      <div class="flex items-center gap-[5px]">
        <Icon icon="mdi:map-marker-outline" class="text-[#2e42b2]" style="width:13.5px;height:13.5px;" />
        <span class="text-[9.01px] leading-[140%] font-inter text-[#374151]">{{ ticket.lokasi }}</span>
      </div>
      <div class="flex items-center gap-[5px]">
        <Icon icon="mdi:bird" class="text-[#2e42b2]" style="width:13.5px;height:13.5px;" />
        <span class="text-[9.01px] leading-[140%] font-inter text-[#374151]">{{ ticket.jenis_burung }}</span>
      </div>
    </div>

    <!-- Action button -->
    <div class="self-stretch bg-[#f9fafb] overflow-hidden flex flex-col items-start px-[10px]">

      <!-- PAID -->
      <div
        v-if="effectiveStatus === 'Paid'"
        class="self-stretch rounded-[5.76px] bg-[#2e42b2] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-pointer active:opacity-85 transition-opacity"
        @click.stop="goToDetail"
      >
        <b class="text-sm leading-5 text-[#f9fafb]">Lihat E-Ticket</b>
      </div>

      <!-- UNPAID -->
      <div
        v-else-if="effectiveStatus === 'Unpaid'"
        class="self-stretch rounded-[5.76px] bg-[#6d717f] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-pointer active:opacity-85 transition-opacity"
        @click.stop="goToUpload"
      >
        <b class="text-sm leading-5 text-[#f9fafb]">Upload Bukti Pembayaran</b>
      </div>

      <!-- MENUNGGU KONFIRMASI — disabled -->
      <div
        v-else-if="effectiveStatus === 'Menunggu Konfirmasi'"
        class="self-stretch rounded-[5.76px] bg-[#9cbff4] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-not-allowed opacity-75"
        title="Mohon tunggu, bukti pembayaran sedang diverifikasi oleh admin."
      >
        <span class="text-sm font-medium leading-5 text-[#2e42b2]">Lihat E-Ticket</span>
      </div>

      <!-- INVALID -->
      <div
        v-else-if="ticket.status === 'Invalid'"
        class="self-stretch rounded-[5.76px] bg-[#a9302d] overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] transition-opacity"
        :class="ticket.can_reupload ? 'cursor-pointer active:opacity-85' : 'cursor-not-allowed opacity-50'"
        @click.stop="ticket.can_reupload ? goToUploadUlang() : undefined"
      >
        <b class="text-sm leading-5 text-[#f9fafb]">
          {{ ticket.can_reupload ? 'Upload Ulang Bukti Pembayaran' : 'Upload Ulang Dinonaktifkan' }}
        </b>
      </div>

      <!-- EXPIRED — disabled -->
      <div
        v-else-if="effectiveStatus === 'Expired'"
        class="self-stretch rounded-[5.76px] bg-[#a9302d]/50 overflow-hidden flex items-center justify-center py-[5px] px-[28.2px] cursor-not-allowed opacity-75"
        title="Waktu pembayaran telah habis. Silakan pesan ulang tiket."
      >
        <span class="text-sm font-bold leading-5 text-white">Tiket Kadaluwarsa</span>
      </div>

    </div>
  </div>
</template>
