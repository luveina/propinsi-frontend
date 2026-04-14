<template>
  <div class="min-h-screen bg-white font-plus-jakarta flex flex-col pb-32">
    
    <!-- HEADER (Tengah Sempurna) -->
    <header class="bg-[#2E42B2] py-5 px-6 flex items-center justify-between relative shadow-md shrink-0 z-20 text-white">
      <button @click="isSidebarOpen = true" class="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center cursor-pointer z-30 transition hover:bg-white/20">
        <Icon icon="mdi:menu" class="w-7 h-7" />
      </button>

      <h1 class="absolute left-1/2 -translate-x-1/2 text-[20px] font-bold whitespace-nowrap z-10">
        Detail Lomba
      </h1>

      <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm z-30">
        <Icon icon="ph:user-fill" class="w-7 h-7 text-gray-300" />
      </div>
    </header>

    <main class="p-6 overflow-y-auto">

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"></div>
      </div>

      <div v-else class="space-y-6">
        <!-- CARD 1: INFORMASI UTAMA -->
        <div class="border-2 border-[#DEE8FB] rounded-[24px] p-6 shadow-sm flex flex-col">
          <h2 class="text-[20px] font-bold text-[#2E42B2] mb-1">{{ lomba.namaLomba }}</h2>
          
          <div class="mb-3">
            <span class="inline-block px-5 py-1 rounded-full text-[10px] font-bold text-[#1C244F] uppercase" 
                  :style="{ backgroundColor: getStatusColor(lomba.status) }">
              {{ lomba.status?.replace(/_/g, ' ') }}
            </span>
          </div>

          <p v-if="lomba.deskripsi" class="text-[14px] text-[#2E42B2] font-normal leading-snug mb-5">
            {{ lomba.deskripsi }}
          </p>

          <div class="space-y-4">
            <div class="flex flex-col gap-1">
              <span class="text-[12px] font-bold text-[#2E42B2]">Alamat:</span>
              <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[12px] font-semibold text-[#1C244F]">
                <Icon icon="ph:map-pin-fill" class="w-5 h-5 text-[#2E42B2]" />
                {{ lomba.lokasi }}
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-[12px] font-bold text-[#2E42B2]">Tanggal - Waktu:</span>
              <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[12px] font-semibold text-[#1C244F]">
                <Icon icon="ph:calendar-blank-fill" class="w-5 h-5 text-[#2E42B2]" />
                {{ formatWaktu(lomba.waktuTanggal) }}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <span class="text-[12px] font-bold text-[#2E42B2]">Kelas:</span>
                <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-2 text-[12px] font-bold text-[#1C244F]">
                  <Icon icon="ph:identification-badge-fill" class="w-5 h-5 text-[#2E42B2]" />
                  {{ lomba.kelas }}
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-[12px] font-bold text-[#2E42B2]">Jenis Burung:</span>
                <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-2 text-[12px] font-bold text-[#1C244F]">
                  <Icon icon="ph:bird-fill" class="w-5 h-5 text-[#2E42B2]" />
                  {{ lomba.jenisBurung }}
                </div>
              </div>
            </div>

            <!-- KOTAK SISA GANTANGAN -->
            <div class="bg-[#DEE8FB] border border-[#2E42B2] rounded-[20px] p-5 text-center shadow-inner">
               <p class="text-[14px] text-[#2E42B2] font-bold flex flex-col items-center">
                  <span>Tersisa</span>
                  <span class="text-4xl font-extrabold my-0.5">{{ availableCount }}</span> 
                  <span>dari {{ lomba.jumlahGantangan || 24 }} nomor gantangan</span>
               </p>
            </div>

            <div class="flex flex-col gap-1">
               <span class="text-[12px] font-bold text-[#2E42B2]">Harga Tiket:</span>
               <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[14px] font-bold text-[#1C244F]">
                 <Icon icon="ph:tag-fill" class="w-5 h-5 text-[#2E42B2]" />
                 {{ formatHarga(lomba.hargaTiket) }}
               </div>
            </div>
          </div>
        </div>

        <!-- CARD 2: HADIAH & NARAHUBUNG -->
        <div class="border-2 border-[#DEE8FB] rounded-[24px] p-6 space-y-6 shadow-sm">
          <div>
            <p class="text-[12px] font-bold text-[#2E42B2] mb-3 uppercase tracking-wider">Daftar Hadiah:</p>
            <div class="text-[14px] text-blue-900 font-bold space-y-2 ml-2">
              <div v-for="(h, i) in lomba.hadiah" :key="i" class="flex justify-between border-b border-blue-50 pb-1 italic">
                <div class="flex items-center gap-2">
                   <Icon icon="ph:star-fill" class="text-[#2E42B2] w-4 h-4" />
                   <span>Juara {{i+1}}</span>
                </div>
                <span>{{ formatHarga(h) }}</span>
              </div>
            </div>
          </div>
          <div>
            <p class="text-[12px] font-bold text-[#2E42B2] mb-3 uppercase tracking-wider">Narahubung:</p>
            <div class="bg-[#DEE8FB] border border-[#2E42B2] p-4 rounded-xl flex items-center gap-4 text-[14px] font-medium text-[#1C244F]">
              <div class="w-10 h-10 bg-[#2E42B2] rounded-full flex items-center justify-center text-white shrink-0">
                <Icon icon="ph:phone-fill" class="w-5 h-5" />
              </div>
              <span class="font-bold text-[14px]">{{ lomba.contactPerson }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ============================================================ -->
    <!-- LOGIKA BUTTON DYNAMICS (FIXED BOTTOM) -->
    <!-- ============================================================ -->
    <div class="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] z-30 flex flex-col items-center gap-2">
      
      <!-- KONDISI 1: STATUS SELESAI -->
      <button v-if="lomba.status === 'SELESAI'" 
              @click="viewWinners" 
              class="w-full bg-[#2E42B2] text-white py-4 rounded-xl font-bold text-lg cursor-pointer shadow-lg active:scale-95">
        Lihat Pemenang
      </button>

      <!-- KONDISI 2: STATUS BELUM MULAI / BERLANGSUNG -->
      <template v-else>
        
        <!-- A. JIKA MASIH BISA RESERVASI (Role Peserta & Belum H-1) -->
        <template v-if="lomba.isReservable">
            <!-- Cek Kuota -->
            <div v-if="availableCount === 0" class="w-full text-center">
                <button disabled class="w-full bg-[#DEE8FB] text-[#6D9BED] py-4 rounded-xl font-bold text-lg">
                    Kuota Penuh
                </button>
                <p class="text-[10px] text-red-500 font-bold mt-2">Maaf, seluruh gantangan sudah terisi.</p>
            </div>

            <!-- Tombol Utama yang Kamu Cari -->
            <button v-else
                    @click="goToReservasi" 
                    class="w-full bg-[#2E42B2] text-white py-4 rounded-xl font-bold text-lg cursor-pointer shadow-lg active:scale-95 transition-all hover:bg-blue-800">
                Reservasi Lomba
            </button>
        </template>

        <!-- B. JIKA TIDAK BISA RESERVASI (Sudah H-1 atau Bukan Peserta) -->
        <div v-else class="w-full text-center">
          <button disabled class="w-full bg-[#DEE8FB] text-[#6D9BED] py-4 rounded-xl font-bold text-lg uppercase">
            Reservasi Ditutup
          </button>
          <p class="text-[10px] text-red-500 font-bold mt-2">Batas waktu reservasi telah berakhir atau fitur hanya untuk Peserta.</p>
        </div>

      </template>
    </div>

    <!-- DRAWER SIDEBAR MOBILE -->
    <Teleport to="body">
      <Transition name="fade"><div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"></div></Transition>
      <Transition name="slide"><div v-if="isSidebarOpen" class="fixed inset-y-0 left-0 z-[70] w-64 shadow-2xl"><Sidebar /></div></Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import Sidebar from '@/components/Sidebar.vue';
import { getLombaDetail } from '@/services/lomba.service';

const route = useRoute();
const router = useRouter();
const lombaId = (route.params.id as string).replace(':', '');

const lomba = ref<any>({});
const loading = ref(true);
const isSidebarOpen = ref(false);

// Filter dinamis dari database
const availableCount = computed(() => {
  if (!lomba.value.listGantangan) return 0;
  return lomba.value.listGantangan.filter((s: any) => s.status === 'AVAILABLE').length;
});

const loadData = async () => {
  loading.value = true;
  try {
    const response = await getLombaDetail(lombaId);
    console.log("DATA DARI BACKEND:", response); // LIHAT DI CONSOLE CHROME!
    lomba.value = response;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const getStatusColor = (s: string) => {
  switch (s) {
    case 'BERLANGSUNG': return '#C5E9CD';
    case 'SELESAI': return '#6D717F';
    case 'BELUM_DIMULAI': return '#FFD88A';
    case 'DIBATALKAN': return '#FCB3AD';
    default: return '#DEE8FB';
  }
};

const formatHarga = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
const formatWaktu = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${m[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()} - Jam ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')}`;
};

const goToReservasi = () => router.push(`/reservasi/${lombaId}`);
const viewWinners = () => router.push(`/winner/${lombaId}`);
</script>

<style scoped>
.font-plus-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
main::-webkit-scrollbar { display: none; }
</style>