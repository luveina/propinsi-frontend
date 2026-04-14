<template>
  <div class="min-h-screen font-plus-jakarta flex flex-col">
    
    <!-- ============================================================ -->
    <!-- 1. LAYOUT DESKTOP (Dashboard Admin & Koordinator) -->
    <!-- ============================================================ -->
    <div v-if="isDesktop && isDesktopRole" class="flex flex-1 h-screen overflow-hidden bg-[#F4F7FE]">
      <!-- Sidebar Kiri -->
      <Sidebar class="shrink-0" />

      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header Dashboard Desktop -->
        <header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0">
          <button @click="router.back()" class="flex items-center gap-2 text-gray-700 font-bold hover:text-[#2E42B2] transition cursor-pointer">
            <Icon icon="ph:caret-left-bold" class="w-5 h-5" />
            <span>Kembali</span>
          </button>
          
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-sm font-extrabold text-gray-900">{{ profileName }}</p>
              <p class="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{{ userRoleLabel }}</p>
            </div>
            <div @click="router.push('/profile')" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer overflow-hidden">
              <Icon icon="ph:user-fill" class="w-6 h-6 text-gray-300" />
            </div>
          </div>
        </header>

        <!-- Main Content Dashboard -->
        <main class="flex-1 overflow-y-auto p-10">
          <h1 class="text-[36px] font-extrabold text-[#2E42B2] mb-8">Detail Lomba</h1>

          <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#2E42B2] border-t-transparent"></div>
          </div>

          <!-- CARD HI-FI DESKTOP KOORDINATOR -->
          <div v-else class="border border-[#2E42B2] rounded-[24px] bg-white p-10 shadow-sm relative">
            <div class="flex justify-between items-start mb-6">
              <div class="flex-1 pr-10">
                <div class="flex items-center gap-4 mb-3">
                  <h2 class="text-[32px] font-extrabold text-[#2E42B2] uppercase">{{ lomba.namaLomba }}</h2>
                  <span class="px-5 py-1 rounded-full text-[12px] font-bold text-white uppercase" :style="{ backgroundColor: getStatusColor(lomba.status) }">
                    {{ lomba.status?.replace(/_/g, ' ') }}
                  </span>
                </div>
                <p class="text-[#2E42B2] text-[15px] leading-relaxed max-w-3xl font-medium opacity-90">
                  {{ lomba.deskripsi }}
                </p>
              </div>

              <!-- Tombol Aksi Kanan -->
              <div class="flex flex-col gap-3">
                <button @click="goToEdit" :disabled="!lomba.isEditable"
                  class="w-48 py-3 rounded-xl font-bold text-sm transition shadow-md"
                  :class="lomba.isEditable ? 'bg-[#2E42B2] text-white hover:bg-blue-800 active:scale-95 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
                  Edit Lomba
                </button>
                <button @click="confirmDelete" :disabled="!lomba.isEditable"
                  class="w-48 py-3 rounded-xl font-bold text-sm transition shadow-md"
                  :class="lomba.isEditable ? 'bg-[#2E42B2] text-white hover:bg-blue-800 active:scale-95 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
                  Hapus Lomba
                </button>
              </div>
            </div>

            <!-- Baris Waktu, Alamat & Toggle -->
            <div class="flex flex-wrap items-end gap-6 mb-10">
              <div class="flex flex-col gap-1.5">
                <span class="text-[13px] font-bold text-[#2E42B2] ml-1">Tanggal - Waktu:</span>
                <div class="border border-[#2E42B2] rounded-xl px-4 py-3 flex items-center gap-3 bg-[#DEE8FB] min-w-[260px]">
                  <Icon icon="ph:calendar-blank-fill" class="w-5 h-5 text-[#2E42B2]" />
                  <span class="text-[13px] font-bold text-[#1C244F]">{{ formatWaktu(lomba.waktuTanggal) }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <span class="text-[13px] font-bold text-[#2E42B2] ml-1">Alamat:</span>
                <div class="border border-[#2E42B2] rounded-xl px-4 py-3 flex items-center gap-3 bg-[#DEE8FB] min-w-[260px]">
                  <Icon icon="ph:map-pin-fill" class="w-5 h-5 text-[#2E42B2]" />
                  <span class="text-[13px] font-bold text-[#1C244F]">{{ lomba.lokasi }}</span>
                </div>
              </div>
              <!-- Toggle Berlangsung -->
              <div v-if="lomba.canToggleOngoing" class="flex items-center gap-3 pb-2.5 ml-4">
                <button @click="handleToggleStatus" class="w-12 h-6 bg-gray-300 rounded-full relative transition-colors cursor-pointer"
                  :class="{ 'bg-[#2E42B2]': lomba.status === 'BERLANGSUNG' }">
                  <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform" :class="{ 'translate-x-6': lomba.status === 'BERLANGSUNG' }"></div>
                </button>
                <span class="text-sm font-bold text-[#2E42B2]">Berlangsung</span>
              </div>
            </div>

            <!-- GRID INFO 4 KOLOM (Light Blue Box) -->
            <div class="bg-[#DEE8FB] border border-[#2E42B2]/20 rounded-[16px] p-8 grid grid-cols-4 gap-10">
              <div>
                <p class="text-sm font-bold text-[#2E42B2] mb-3 uppercase tracking-wider">Hadiah</p>
                <div class="text-[13px] font-bold text-[#1C244F] space-y-2 italic">
                  <p v-for="(h, i) in lomba.hadiah" :key="i">Juara {{i+1}}: {{ formatHarga(h) }}</p>
                </div>
              </div>
              <div class="space-y-6">
                <div>
                  <p class="text-sm font-bold text-[#2E42B2] mb-1">Jumlah Juri:</p>
                  <p class="text-[15px] font-extrabold text-[#1C244F]">{{ lomba.jumlahJuri }} orang</p>
                </div>
                <div>
                  <p class="text-sm font-bold text-[#2E42B2] mb-1">Contact Person:</p>
                  <p class="text-[15px] font-extrabold text-[#1C244F]">{{ lomba.contactPerson }}</p>
                </div>
              </div>
              <div class="space-y-6">
                <div>
                  <p class="text-sm font-bold text-[#2E42B2] mb-1">Harga:</p>
                  <p class="text-[15px] font-extrabold text-[#1C244F]">{{ formatHarga(lomba.hargaTiket) }}</p>
                </div>
                <div>
                  <p class="text-sm font-bold text-[#2E42B2] mb-1">Kelas:</p>
                  <p class="text-[15px] font-extrabold text-[#1C244F] uppercase">{{ lomba.kelas }}</p>
                </div>
              </div>
              <div class="space-y-6">
                <div>
                  <p class="text-sm font-bold text-[#2E42B2] mb-1">Jumlah Gantangan:</p>
                  <p class="text-[15px] font-extrabold text-[#1C244F]">24</p>
                </div>
                <div>
                  <p class="text-sm font-bold text-[#2E42B2] mb-1">Jenis Burung:</p>
                  <p class="text-[15px] font-extrabold text-[#1C244F] uppercase">{{ lomba.jenisBurung }}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- 2. LAYOUT MOBILE (Peserta / Juri / Juri-Mobile) -->
    <!-- ============================================================ -->
    <div v-else class="flex flex-col min-h-screen bg-white pb-32">
      <header_mobile title="Detail Lomba" @menu-click="isSidebarOpen = true" />

      <main class="p-6 overflow-y-auto">
        <div v-if="loading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"></div>
        </div>

        <div v-else class="space-y-6">
          
          <!-- SEKSI JURI MOBILE -->
          <div v-if="userRole === 'JURI'" class="border-2 border-[#DEE8FB] rounded-[32px] p-6 shadow-sm space-y-6">
            <div class="text-center space-y-2">
              <h2 class="text-[24px] font-extrabold text-[#2E42B2] uppercase leading-tight">{{ lomba.namaLomba }}</h2>
              <div class="flex justify-center">
                <span class="inline-block px-5 py-1 rounded-full text-[10px] font-bold text-[#1C244F] uppercase" :style="{ backgroundColor: getStatusColor(lomba.status) }">
                  {{ lomba.status?.replace(/_/g, ' ') }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1"><span class="text-[12px] font-bold text-[#2E42B2] ml-1">Kelas:</span>
                <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-2 text-[13px] font-bold text-[#1C244F] min-h-[48px]">
                  <Icon icon="ph:identification-badge-fill" class="w-5 h-5 text-[#2E42B2]" /><span class="truncate">{{ lomba.kelas }}</span>
                </div>
              </div>
              <div class="space-y-1"><span class="text-[12px] font-bold text-[#2E42B2] ml-1">Alamat:</span>
                <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-2 text-[11px] font-bold text-[#1C244F] min-h-[48px]">
                  <Icon icon="ph:map-pin-fill" class="w-5 h-5 text-[#2E42B2]" /><span class="leading-tight">{{ lomba.lokasi }}</span>
                </div>
              </div>
            </div>

            <div class="bg-[#DEE8FB] border border-[#2E42B2] rounded-[24px] p-6 text-center shadow-inner">
               <p class="text-[14px] text-[#2E42B2] font-bold flex flex-col items-center">
                  <span class="tracking-wide">Tersisa</span>
                  <span class="text-5xl font-extrabold my-1">{{ availableCount }}</span> 
                  <span class="text-[13px] opacity-80">dari {{ lomba.jumlahGantangan || 24 }} nomor gantangan</span>
               </p>
            </div>

            <div class="space-y-4">
              <div class="space-y-1"><span class="text-[12px] font-bold text-[#2E42B2] ml-1">Jenis Burung:</span>
                <div class="bg-[#DEE8FB] border border-[#2E42B2] p-4 rounded-xl flex items-center gap-3 text-[14px] font-bold text-[#1C244F]">
                  <Icon icon="ph:bird-fill" class="w-6 h-6 text-[#2E42B2]" /><span class="uppercase">{{ lomba.jenisBurung }}</span>
                </div>
              </div>
              <div class="space-y-1"><span class="text-[12px] font-bold text-[#2E42B2] ml-1">Koordinator:</span>
                <div class="bg-[#DEE8FB] border border-[#2E42B2] p-4 rounded-xl flex items-center gap-3 text-[14px] font-bold text-[#1C244F]">
                  <Icon icon="ph:user-focus-fill" class="w-6 h-6 text-[#2E42B2] shrink-0" /><span class="leading-tight break-words">{{ lomba.contactPerson }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SEKSI PESERTA MOBILE -->
          <div v-else class="space-y-6">
            <div class="border-2 border-[#DEE8FB] rounded-[24px] p-6 shadow-sm flex flex-col">
              <h2 class="text-[20px] font-bold text-[#2E42B2] mb-1">{{ lomba.namaLomba }}</h2>
              <div class="mb-3">
                <span class="inline-block px-5 py-1 rounded-full text-[10px] font-bold text-[#1C244F] uppercase" :style="{ backgroundColor: getStatusColor(lomba.status) }">
                  {{ lomba.status?.replace(/_/g, ' ') }}
                </span>
              </div>
              <p v-if="lomba.deskripsi" class="text-[14px] text-[#2E42B2] font-normal leading-snug mb-5">{{ lomba.deskripsi }}</p>

              <div class="space-y-4">
                <div class="flex flex-col gap-1"><span class="text-[12px] font-bold text-[#2E42B2]">Alamat:</span>
                  <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[12px] font-semibold text-[#1C244F]">
                    <Icon icon="ph:map-pin-fill" class="w-5 h-5 text-[#2E42B2]" /> {{ lomba.lokasi }}
                  </div>
                </div>
                <div class="flex flex-col gap-1"><span class="text-[12px] font-bold text-[#2E42B2]">Tanggal - Waktu:</span>
                  <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[12px] font-semibold text-[#1C244F]">
                    <Icon icon="ph:calendar-blank-fill" class="w-5 h-5 text-[#2E42B2]" /> {{ formatWaktu(lomba.waktuTanggal) }}
                  </div>
                </div>
                <!-- Box Tersisa Versi Peserta (Kecil) -->
                <div class="bg-[#DEE8FB] border border-[#2E42B2] rounded-[20px] p-5 text-center shadow-inner">
                   <p class="text-[14px] text-[#2E42B2] font-bold flex flex-col items-center">
                      <span>Tersisa</span><span class="text-4xl font-extrabold my-0.5">{{ availableCount }}</span><span>dari {{ lomba.jumlahGantangan || 24 }} nomor gantangan</span>
                   </p>
                </div>
                <div class="flex flex-col gap-1"><span class="text-[12px] font-bold text-[#2E42B2]">Harga Tiket:</span>
                   <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[14px] font-bold text-[#1C244F]">
                     <Icon icon="ph:tag-fill" class="w-5 h-5 text-[#2E42B2]" /> {{ formatHarga(lomba.hargaTiket) }}
                   </div>
                </div>
              </div>
            </div>

            <!-- Hadiah & Narahubung -->
            <div class="border-2 border-[#DEE8FB] rounded-[24px] p-6 space-y-6 shadow-sm">
              <div><p class="text-[12px] font-bold text-[#2E42B2] mb-3 uppercase tracking-wider">Daftar Hadiah:</p>
                <div class="text-[14px] text-blue-900 font-bold space-y-2 ml-2 italic">
                  <div v-for="(h, i) in lomba.hadiah" :key="i" class="flex justify-between border-b border-blue-50 pb-1">
                    <span>Juara {{i+1}}</span> <span>{{ formatHarga(h) }}</span>
                  </div>
                </div>
              </div>
              <div><p class="text-[12px] font-bold text-[#2E42B2] mb-3 uppercase tracking-wider">Narahubung:</p>
                <div class="bg-[#DEE8FB] border border-[#2E42B2] p-4 rounded-xl flex items-center gap-4 text-[14px] font-bold text-[#1C244F]">
                  <Icon icon="ph:phone-fill" class="w-6 h-6 text-[#2E42B2]" /> {{ lomba.contactPerson }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- FIXED BOTTOM BAR MOBILE -->
      <div class="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] z-30">
        <template v-if="userRole === 'JURI'">
          <button v-if="lomba.canStartJudging" @click="startJudging" class="w-full bg-[#2E42B2] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition hover:bg-blue-800 cursor-pointer">Mulai Penilaian</button>
          <div v-else class="w-full text-center py-2">
              <button disabled class="w-full bg-[#DEE8FB] text-[#6D9BED] py-4 rounded-xl font-bold text-lg uppercase">Penilaian Belum Dibuka</button>
          </div>
        </template>
        <template v-else>
          <button v-if="lomba.status === 'SELESAI'" @click="viewWinners" class="w-full bg-[#2E42B2] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition cursor-pointer">Lihat Pemenang</button>
          <template v-else>
            <div v-if="!lomba.isReservable" class="w-full text-center">
              <button disabled class="w-full bg-[#DEE8FB] text-[#6D9BED] py-4 rounded-xl font-bold text-lg uppercase">Reservasi Ditutup</button>
              <p class="text-[14px] text-[#6D9BED] font-normal mt-3">Batas waktu reservasi telah berakhir.</p>
            </div>
            <div v-else-if="availableCount === 0" class="w-full text-center">
              <button disabled class="w-full bg-[#DEE8FB] text-[#6D9BED] py-4 rounded-xl font-bold text-lg uppercase">Kuota Penuh</button>
              <p class="text-[14px] text-[#6D9BED] font-normal mt-3">Maaf, seluruh gantangan sudah terisi.</p>
            </div>
            <button v-else @click="goToReservasi" class="w-full bg-[#2E42B2] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all hover:bg-blue-800 cursor-pointer">Reservasi Lomba</button>
          </template>
        </template>
      </div>
    </div>

    <!-- DRAWER SIDEBAR MOBILE -->
    <Teleport to="body">
      <Transition name="fade"><div v-if="!isDesktop && isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"></div></Transition>
      <Transition name="slide"><div v-if="!isDesktop && isSidebarOpen" class="fixed inset-y-0 left-0 z-[70] w-64 shadow-2xl"><Sidebar /></div></Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import Sidebar from '@/components/Sidebar.vue';
import header_mobile from '@/components/HeaderMobile.vue'; 
import { useBreakpoint } from '@/composables/useBreakpoint';
import { getLombaDetail, updateLombaStatus, deleteLomba } from '@/services/lomba.service';

const { isDesktop } = useBreakpoint();
const route = useRoute();
const router = useRouter();
const lombaId = (route.params.id as string).replace(':', '');

const lomba = ref<any>({});
const loading = ref(true);
const isSidebarOpen = ref(false);

// SOURCE OF TRUTH ROLE
const userRole = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (user.role || 'CUSTOMER').toUpperCase();
});

const isDesktopRole = computed(() => {
  return ['ADMIN', 'KOORDINATOR_LOMBA', 'KOORDINATOR_PENDAFTARAN'].includes(userRole.value);
});

const userStore = JSON.parse(localStorage.getItem('user') || '{}');
const profileName = computed(() => userStore.fullName || 'User');
const userRoleLabel = computed(() => userStore.role?.replace(/_/g, ' ') || 'Role');

const availableCount = computed(() => {
  if (!lomba.value.listGantangan) return 0;
  return lomba.value.listGantangan.filter((s: any) => s.status === 'AVAILABLE').length;
});

const loadData = async () => {
  loading.value = true;
  try {
    lomba.value = await getLombaDetail(lombaId);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

// HANDLERS
const startJudging = () => router.push(`/judging/select-gantangan/${lombaId}`);
const goToReservasi = () => router.push(`/reservasi/${lombaId}`);
const viewWinners = () => router.push(`/winner/${lombaId}`);
const goToEdit = () => router.push(`/lomba/edit/${lombaId}`);

const confirmDelete = async () => {
  if (confirm('Yakin ingin menghapus lomba ini?')) {
    try {
      await deleteLomba(lombaId);
      router.push('/katalog-lomba');
    } catch (e) { alert('Gagal menghapus'); }
  }
};

const handleToggleStatus = async () => {
  if (lomba.value.status !== 'BELUM_DIMULAI') return;
  if (confirm('Apakah anda yakin ingin mengubah status lomba menjadi BERLANGSUNG?')) {
    try {
      await updateLombaStatus(lombaId, 'BERLANGSUNG');
      await loadData();
    } catch (e) { alert('Gagal memperbarui status'); }
  }
};

// HELPERS
const getStatusColor = (s: string) => {
  switch (s) {
    case 'BERLANGSUNG': return '#34A853';
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
</script>

<style scoped>
.font-plus-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
main::-webkit-scrollbar { display: none; }
</style>