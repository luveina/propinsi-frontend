<template>
  <div class="min-h-screen bg-white flex flex-col font-plus-jakarta pb-10">
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isSidebarOpen" 
             @click="isSidebarOpen = false"
             class="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm">
        </div>
      </Transition>

      <Transition name="slide">
        <div v-if="isSidebarOpen" class="fixed inset-y-0 left-0 z-[70] w-64 shadow-2xl">
          <!-- Tombol Close (Opsional di dalam sidebar) -->
          <Sidebar />
        </div>
      </Transition>
    </Teleport>

    <!-- Header (Burger & Profil) -->
    <header class="bg-[#2E42B2] py-5 px-6 flex items-center relative shadow-md shrink-0 z-20">
      <button 
        @click="isSidebarOpen = true"
        class="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition cursor-pointer"
      >
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <h1 class="flex-1 text-center text-white text-[20px] font-bold">
        Reservasi Gantangan
      </h1>

      <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
        <svg class="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto">
      <div class="max-w-md mx-auto px-6 py-6 flex flex-col items-center">
        <div class="w-full mb-6">
          <button @click="router.back()" class="text-[#2E42B2] font-semibold text-[18px] flex items-center gap-2 hover:opacity-70 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
            Kembali
          </button>
        </div>

        <h2 class="text-[#2E42B2] text-[18px] font-semibold text-center mb-8 uppercase leading-tight">
          {{ lombaName || 'Memuat Nama Lomba...' }}
        </h2>

        <div class="flex gap-6 mb-12 text-[10px] font-medium">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-[#6D9BED]"></div>
            <span class="text-gray-700">Gantangan Tersedia</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-[#C4D8F9]"></div>
            <span class="text-gray-700">Gantangan Tidak Tersedia</span>
          </div>
        </div>

        <!-- Denah Gantangan -->
        <div class="relative p-2">
          <div class="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#2E42B2] -translate-x-1/2 z-0"></div>
          <div class="absolute left-0 right-0 top-1/2 h-[2px] bg-[#2E42B2] -translate-y-1/2 z-0"></div>

          <div class="grid grid-cols-2 gap-x-10 gap-y-10 relative z-10">
            <div class="grid grid-cols-2 gap-3">
              <p class="col-span-2 text-center text-[12px] font-normal text-black uppercase mb-1">Blok II</p>
              <SeatButton v-for="n in [24, 23, 17, 18, 16, 15]" :key="n" :nomor="n" :status="getSeatStatus(n)" :isSelected="selectedSeat === n" @click="handleSelect(n)" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <p class="col-span-2 text-center text-[12px] font-normal text-black uppercase mb-1">Blok III</p>
              <SeatButton v-for="n in [22, 21, 19, 20, 14, 13]" :key="n" :nomor="n" :status="getSeatStatus(n)" :isSelected="selectedSeat === n" @click="handleSelect(n)" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <SeatButton v-for="n in [9, 10, 8, 7, 1, 2]" :key="n" :nomor="n" :status="getSeatStatus(n)" :isSelected="selectedSeat === n" @click="handleSelect(n)" />
              <p class="col-span-2 text-center text-[12px] font-normal text-black uppercase mt-1">Blok I</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <SeatButton v-for="n in [11, 12, 6, 5, 3, 4]" :key="n" :nomor="n" :status="getSeatStatus(n)" :isSelected="selectedSeat === n" @click="handleSelect(n)" />
              <p class="col-span-2 text-center text-[12px] font-normal text-black uppercase mt-1">Blok IV</p>
            </div>
          </div>
        </div>

        <div class="w-full mt-16 px-4">
          <button 
            @click="handleBooking"
            :disabled="!selectedSeat || loading"
            class="w-full py-4 rounded-xl text-white font-bold text-[16px] shadow-lg transition-all active:scale-95 
                   disabled:bg-[#C4D8F9] disabled:cursor-not-allowed 
                   enabled:bg-[#2E42B2] enabled:hover:bg-blue-800 cursor-pointer"
          >
            {{ loading ? 'Memproses...' : 'Lanjut Pembayaran' }}
          </button>
        </div>
      </div>
    </main>

    <SeatTakenModal :show="showConflictModal" @close="handleCloseConflict" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import SeatButton from '@/components/reservasi/SeatButton.vue';
import SeatTakenModal from '@/components/modals/SeatTakenModal.vue';
import { getDenahGantangan, postBookSeat } from '@/services/reservasi.service';
import { getLombaById } from '@/services/lomba.service';

const router = useRouter();
const route = useRoute();
const lombaId = route.params.lombaId as string;

const isSidebarOpen = ref(false);

const lombaName = ref('');
const seats = ref<any[]>([]);
const selectedSeat = ref<number | null>(null);
const loading = ref(false);
const showConflictModal = ref(false);

const loadData = async () => {
  try {
    const cleanLombaId = lombaId.startsWith(':') ? lombaId.substring(1) : lombaId;
    const resLomba = await getLombaById(cleanLombaId);
    lombaName.value = resLomba.data ? resLomba.data.namaLomba : resLomba.namaLomba;
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
  return seat ? seat.status : 'AVAILABLE';
};

const handleSelect = (n: number) => {
  if (getSeatStatus(n) === 'AVAILABLE') selectedSeat.value = n;
};

const handleBooking = async () => {
  if (!selectedSeat.value) return;
  loading.value = true;
  try {
    const cleanLombaId = lombaId.startsWith(':') ? lombaId.substring(1) : lombaId;
    await postBookSeat({ lombaId: cleanLombaId, nomorGantangan: selectedSeat.value });
    await loadData();
  } catch (err: any) {
    if (err.response?.status === 409) showConflictModal.value = true;
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
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>