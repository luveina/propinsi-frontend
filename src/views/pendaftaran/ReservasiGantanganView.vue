<template>
  <!-- h-screen dan overflow-hidden supaya body utama tidak scroll -->
  <div class="h-screen flex flex-col bg-white font-plus-jakarta overflow-hidden">

    <!-- Sidebar Teleport tetap sama -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"></div>
      </Transition>
      <Transition name="slide">
        <div v-if="isSidebarOpen" class="fixed inset-y-0 left-0 z-[70] w-64 shadow-2xl">
          <Sidebar />
        </div>
      </Transition>
    </Teleport>

    <!-- Header tetap di atas -->
    <header_mobile
      title="Reservasi Gantangan"
      @menu-click="isSidebarOpen = true"
      class="flex-none"
    />

    <!-- Main Content: flex-1 dan overflow-y-auto supaya hanya bagian ini yang bisa di-scroll -->
    <main class="flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center">
      <div class="w-full max-w-md">
        <!-- Tombol Kembali -->
        <div class="w-full mb-4">
          <button @click="router.back()" class="text-[#2E42B2] font-semibold text-[16px] flex items-center gap-2 hover:opacity-70 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
            Kembali
          </button>
        </div>

        <h2 class="text-[#2E42B2] text-[17px] font-bold text-center mb-6 uppercase leading-tight px-4">
          {{ lombaName || 'Memuat Nama Lomba...' }}
        </h2>

        <!-- Legend Status -->
        <div class="flex justify-center gap-6 mb-8 text-[11px] font-medium">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-[#6D9BED]"></div>
            <span class="text-gray-700">Gantangan Tersedia</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-[#C4D8F9]"></div>
            <span class="text-gray-700">Gantangan Tidak Tersedia</span>
          </div>
        </div>

        <!-- Denah Gantangan (Grid) -->
        <div class="relative p-2 flex justify-center">
          <!-- Garis Salib Tengah -->
          <div class="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#2E42B2]/20 -translate-x-1/2 z-0"></div>
          <div class="absolute left-0 right-0 top-1/2 h-[2px] bg-[#2E42B2]/20 -translate-y-1/2 z-0"></div>

          <div class="grid grid-cols-2 gap-x-12 gap-y-10 relative z-10">
            <!-- Blok II -->
            <div class="grid grid-cols-2 gap-3">
              <p class="col-span-2 text-center text-[12px] font-bold text-[#2E42B2] uppercase mb-1">Blok II</p>
              <SeatButton v-for="n in [24, 23, 17, 18, 16, 15]" :key="n" :nomor="n" :status="getSeatStatus(n)" :isSelected="selectedSeat === n" @click="handleSelect(n)" />
            </div>
            <!-- Blok III -->
            <div class="grid grid-cols-2 gap-3">
              <p class="col-span-2 text-center text-[12px] font-bold text-[#2E42B2] uppercase mb-1">Blok III</p>
              <SeatButton v-for="n in [22, 21, 19, 20, 14, 13]" :key="n" :nomor="n" :status="getSeatStatus(n)" :isSelected="selectedSeat === n" @click="handleSelect(n)" />
            </div>
            <!-- Blok I -->
            <div class="grid grid-cols-2 gap-3">
              <SeatButton v-for="n in [9, 10, 8, 7, 1, 2]" :key="n" :nomor="n" :status="getSeatStatus(n)" :isSelected="selectedSeat === n" @click="handleSelect(n)" />
              <p class="col-span-2 text-center text-[12px] font-bold text-[#2E42B2] uppercase mt-1">Blok I</p>
            </div>
            <!-- Blok IV -->
            <div class="grid grid-cols-2 gap-3">
              <SeatButton v-for="n in [11, 12, 6, 5, 3, 4]" :key="n" :nomor="n" :status="getSeatStatus(n)" :isSelected="selectedSeat === n" @click="handleSelect(n)" />
              <p class="col-span-2 text-center text-[12px] font-bold text-[#2E42B2] uppercase mt-1">Blok IV</p>
            </div>
          </div>
        </div>

        <!-- Spacer agar tidak tertutup tombol bottom -->
        <div class="h-24"></div>
      </div>
    </main>

    <!-- Bottom Action Button: Fixed di bawah -->
    <div class="flex-none p-6 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div class="max-w-md mx-auto">
        <button
          @click="handleLanjutPembayaran"
          :disabled="!selectedSeat || loading"
          class="w-full py-4 rounded-2xl text-white font-bold text-[16px] shadow-lg transition-all active:scale-95
                 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                 enabled:bg-[#2E42B2] enabled:hover:bg-blue-800 cursor-pointer"
        >
          <span v-if="loading">Memproses...</span>
          <span v-else>
            {{ selectedSeat ? 'Lanjut Pembayaran' : 'Pilih Nomor Gantangan' }}
          </span>
        </button>
      </div>
    </div>

    <SeatTakenModal :show="showConflictModal" @close="handleCloseConflict" />
  </div>
</template>

<script setup lang="ts">
/* Logic script kamu sudah benar, tidak perlu ada yang diubah besar-besaran */
/* Hanya pastikan import dan fungsi tetap ada */
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import SeatButton from '@/components/reservasi/SeatButton.vue';
import SeatTakenModal from '@/components/modals/SeatTakenModal.vue';
import { getDenahGantangan, postBookSeat } from '@/services/reservasi.service';
import { getLombaById } from '@/services/lomba.service';
import header_mobile from '@/components/HeaderMobile.vue';

const router = useRouter();
const route = useRoute();
const lombaId = route.params.lombaId as string;

const isSidebarOpen = ref(false);
const lombaName = ref('');
const hargaTiket = ref(0);
const seats = ref<any[]>([]);
const selectedSeat = ref<number | null>(null);
const loading = ref(false);
const showConflictModal = ref(false);

const loadData = async () => {
  try {
    const cleanLombaId = lombaId.startsWith(':') ? lombaId.substring(1) : lombaId;
    const resLomba = await getLombaById(cleanLombaId);
    lombaName.value = resLomba.data ? resLomba.data.namaLomba : resLomba.namaLomba;
    hargaTiket.value = Number(resLomba.data?.hargaTiket ?? resLomba.hargaTiket ?? 0);
    const resDenah = await getDenahGantangan(cleanLombaId);
    if (resDenah && resDenah.data) seats.value = resDenah.data;
  } catch (err) {
    console.error(err);
    lombaName.value = "Gagal Memuat Nama Lomba";
  }
};

onMounted(loadData);

const getSeatStatus = (n: number) => {
  const seat = seats.value.find(s => Number(s.nomorGantangan) === n);
  // Sesuaikan mapping dengan Enum baru mu (AVAILABLE, BOOKED, ACTIVE, DISQUALIFIED)
  // Gantangan tidak tersedia jika statusnya bukan AVAILABLE
  return seat ? seat.status : 'AVAILABLE';
};

const handleSelect = (n: number) => {
  if (getSeatStatus(n) === 'AVAILABLE') selectedSeat.value = n;
};

const handleLanjutPembayaran = async () => {
  if (!selectedSeat.value) return;
  loading.value = true;
  try {
    const cleanLombaId = lombaId.startsWith(':') ? lombaId.substring(1) : lombaId;
    const response = await postBookSeat({ lombaId: cleanLombaId, nomorGantangan: selectedSeat.value });
    const reservasiId = response?.data?.reservationId;

    if (!reservasiId) {
      throw new Error('Reservation ID tidak ditemukan dari response book-seat');
    }

    await router.push({
      name: 'pembayaran',
      query: {
        reservasiId,
        namaLomba: lombaName.value,
        nomorGantangan: String(selectedSeat.value),
        nominal: String(hargaTiket.value),
        waktuReservasi: new Date().toISOString()
      }
    });
  } catch (err: any) {
    if (err.response?.status === 409) {
      showConflictModal.value = true;
      return;
    }

    console.error('Gagal lanjut ke pembayaran:', err);
    alert(err.response?.data?.message || 'Terjadi kesalahan saat lanjut ke pembayaran.');
  } finally {
    loading.value = false;
  }
};

const handleCloseConflict = () => {
  showConflictModal.value = false;
  selectedSeat.value = null;
  loadData();
};
</script>

<style scoped>
/* Transisi Sidebar */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Menghilangkan scrollbar tapi tetap bisa scroll (optional untuk tampilan clean) */
main::-webkit-scrollbar {
  display: none;
}
main {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
