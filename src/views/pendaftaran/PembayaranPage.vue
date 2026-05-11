<template>
  <div class="h-screen flex flex-col bg-white font-plus-jakarta overflow-hidden">

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

    <header_mobile
      title="Upload Pembayaran"
      @menu-click="isSidebarOpen = true"
      class="flex-none"
    />

    <main class="flex-1 overflow-y-auto px-4 md:px-8 py-5 flex flex-col bg-[#F8FAFC]">
      <div class="w-full max-w-md md:max-w-4xl mx-auto">

        <div class="w-full mb-4">
          <button @click="goBack" class="text-[#2E42B2] font-semibold text-sm flex items-center gap-2 hover:opacity-70 cursor-pointer transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
            Kembali
          </button>
        </div>

        <div v-if="showSuccessView" class="flex flex-col items-center justify-center p-6 md:p-10 text-center mt-6 bg-white rounded-2xl border border-[#D9E3FF] shadow-sm max-w-xl mx-auto">
          <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-5 border-8 border-green-100 shadow-sm">
            <svg class="w-10 h-10 text-white success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 class="text-xl md:text-2xl font-black text-[#2E42B2] mb-2">Pembayaran berhasil<br/>ter-upload!</h2>
          <p class="text-gray-500 text-xs md:text-sm mb-6">Tim kami sedang memverifikasi pembayaran Anda. Mohon tunggu maksimal 1x24 jam.</p>

          <button @click="goToMyTicket" class="btn-desktop w-full max-w-xs mx-auto rounded-xl bg-[#2E42B2] py-3 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition cursor-pointer">
            Lihat Tiket Saya
          </button>
        </div>

        <div v-else class="flex flex-col md:flex-row gap-5 pb-24 md:pb-6">

          <div class="w-full md:w-1/2 flex flex-col space-y-4">
            <div class="bg-[#2E42B2] text-white text-center py-5 px-4 rounded-xl shadow-sm">
                <p class="text-xs text-blue-100 mb-1">Waktu tersisa sebelum <span class="font-bold">{{ deadlineText }}</span></p>
              <p class="text-3xl font-bold tracking-wider tabular-nums">{{ formattedTimeLeft }}</p>
            </div>

            <div class="bg-white p-3 rounded-xl flex items-center border border-gray-100 shadow-sm">
              <div class="w-10 h-10 bg-[#eef2ff] text-[#2E42B2] rounded-lg flex items-center justify-center mr-3 shrink-0">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-[#2E42B2] text-sm leading-tight">{{ namaLomba }}</h3>
                <p class="text-[11px] text-gray-500 mt-0.5">Gantangan Tersedia</p>
              </div>
              <div class="bg-[#2E42B2] text-white text-center px-3 py-1.5 rounded-lg shadow-sm shrink-0">
                <p class="text-[9px] uppercase font-semibold opacity-80">Nomor</p>
                <p class="font-black text-lg leading-none">{{ nomorGantangan }}</p>
              </div>
            </div>

            <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div class="flex items-center text-[#2E42B2] font-bold mb-3 text-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                TRANSFER KE REKENING
              </div>

              <div class="space-y-2.5 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">Bank</span>
                  <span class="font-bold text-gray-800">BCA</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">No. Rekening</span>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-800">5405213556</span>
                    <button @click="copyText('5405213556')" class="bg-gray-100 text-[#2E42B2] px-2 py-0.5 rounded text-[10px] font-bold hover:bg-gray-200 transition cursor-pointer">Salin</button>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">Nama Rekening</span>
                  <span class="font-bold text-gray-800">PT Silobur Indonesia</span>
                </div>

                <div class="mt-3 p-3 border border-orange-200 bg-orange-50 rounded-lg">
                  <p class="text-[10px] text-gray-500 mb-1 font-bold uppercase">Total Bayar</p>
                  <div class="flex justify-between items-center">
                    <span class="text-xl font-black text-orange-600">{{ formatCurrency(nominal) }}</span>
                    <button @click="copyText(nominal.toString())" class="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-gray-50 shadow-sm transition cursor-pointer">Salin</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-100 text-[#2E42B2] text-[11px] p-2.5 rounded-lg flex items-start">
              <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
              <p class="font-medium leading-relaxed">Transfer tepat sesuai nominal. Nominal berbeda dapat memperlambat proses verifikasi.</p>
            </div>
          </div>

          <div class="w-full md:w-1/2 flex flex-col space-y-4">
            <div class="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full">
              <h3 class="text-sm font-bold text-[#2E42B2] mb-1">Unggah Bukti</h3>
              <p class="text-[11px] text-gray-500 mb-4">Pastikan gambar jelas. (JPG, PNG, PDF Maks 2MB)</p>

              <label class="flex-1 flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-[#2E42B2] bg-[#f8faff] rounded-lg hover:bg-[#eef2ff] transition cursor-pointer relative p-4 text-center">
                <svg class="w-8 h-8 mb-2 text-[#2E42B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <span class="font-bold text-[#2E42B2] text-sm">Pilih File Bukti</span>

                <span v-if="selectedFile" class="mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold truncate max-w-[200px] block">
                  ✓ {{ selectedFile.name }}
                </span>

                <input type="file" accept=".jpg,.jpeg,.png,.pdf" @change="handleFileUpload" class="hidden" />
              </label>

              <p v-if="errorMessage" class="text-[11px] font-bold text-red-500 bg-red-50 p-2 rounded-lg mt-3 text-center">{{ errorMessage }}</p>
            </div>

            <button @click="submitBukti" :disabled="!selectedFile || isSubmitting" class="btn-desktop w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed enabled:bg-[#2E42B2] enabled:hover:bg-blue-800 cursor-pointer">
              {{ isSubmitting ? 'Memproses...' : 'Kirim Bukti Pembayaran' }}
            </button>
          </div>

        </div>
      </div>
    </main>

    <div class="btn-mobile-wrapper flex-none p-4 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-20">
      <div class="w-full max-w-md mx-auto">
        <button v-if="showSuccessView" @click="goToMyTicket" class="w-full py-3.5 rounded-xl bg-[#2E42B2] hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer">
          Lihat Tiket Saya
        </button>
        <button v-else @click="submitBukti" :disabled="!selectedFile || isSubmitting" class="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed enabled:bg-[#2E42B2] enabled:hover:bg-blue-800 cursor-pointer">
          {{ isSubmitting ? 'Memproses...' : 'Kirim Bukti Pembayaran' }}
        </button>
      </div>
    </div>

    <ErrorModal
      :show="showTimeoutModal"
      type="info"
      message="Tiket expired dan tidak dapat diupload lagi. Silakan mulai ulang dari awal."
      confirm-label="Mulai Ulang"
      :show-cancel="false"
      @confirm="onTimeoutConfirm"
      @close="onTimeoutConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// Import komponen
import Sidebar from '@/components/Sidebar.vue';
import header_mobile from '@/components/HeaderMobile.vue';
import ErrorModal from '@/components/modals/ErrorModal.vue';
import { postUploadBukti } from '@/services/reservasi.service';

const router = useRouter();
const route = useRoute();

const isSidebarOpen = ref(false);

const readQueryString = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : '';
};

const readQueryNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(readQueryString(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const reservasiId = ref(
  readQueryString(route.query.reservasiId) || String(route.params.id ?? '')
);
const namaLomba = ref(readQueryString(route.query.namaLomba) || 'SILOBUR CUP');
const nomorGantangan = ref(readQueryNumber(route.query.nomorGantangan, 0));
const nominal = ref(readQueryNumber(route.query.nominal, 0));
const waktuReservasi = ref(readQueryString(route.query.waktuReservasi) || new Date().toISOString());

const showSuccessView = ref(false);
const showTimeoutModal = ref(false);
const selectedFile = ref<File | null>(null);
const errorMessage = ref('');
const isSubmitting = ref(false);

const timeLeft = ref(0);
let timerInterval: ReturnType<typeof setInterval>;

const uploadSuccessKey = computed(() => {
  return reservasiId.value ? `payment_uploaded_${reservasiId.value}` : '';
});

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Berhasil disalin!');
  } catch (err) {
    console.error('Gagal menyalin text: ', err);
  }
};

const statusFromQuery = ref(readQueryString(route.query.status) || 'Unpaid');

const parseMillisForCountdown = (rawDate: string): number => {
  if (!rawDate) return Date.now();

  const hasTimezone = /([zZ]|[+\-]\d{2}:\d{2})$/.test(rawDate);
  const normalizedDate = hasTimezone ? rawDate : `${rawDate}Z`;
  const parsed = new Date(normalizedDate).getTime();

  return Number.isFinite(parsed) ? parsed : Date.now();
};

const deadlineText = computed(() => {
  const createdTime = parseMillisForCountdown(waktuReservasi.value);
  const duration = statusFromQuery.value === 'Invalid' ? (24 * 60 * 60 * 1000) : (2 * 60 * 60 * 1000);
  const deadline = new Date(createdTime + duration);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return deadline.toLocaleDateString('id-ID', options).replace('.', ':');
});

const formattedTimeLeft = computed(() => {
  if (timeLeft.value <= 0) return '00:00:00';
  const h = Math.floor(timeLeft.value / 3600);
  const m = Math.floor((timeLeft.value % 3600) / 60);
  const s = Math.floor(timeLeft.value % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const startTimer = () => {
  const createdTime = parseMillisForCountdown(waktuReservasi.value);
  const duration = statusFromQuery.value === 'Invalid' ? (24 * 60 * 60 * 1000) : (2 * 60 * 60 * 1000);
  const deadline = createdTime + duration;

  timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const diff = Math.floor((deadline - now) / 1000);

    if (diff <= 0) {
      clearInterval(timerInterval);
      timeLeft.value = 0;
      // Hanya tampilkan modal jika status awalnya bukan sudah expired dari DB
      showTimeoutModal.value = true; 
    } else {
      timeLeft.value = diff;
    }
  }, 1000);
};

const onTimeoutConfirm = () => {
  showTimeoutModal.value = false;
  router.push({ name: 'katalog-lomba' });
};

const handleFileUpload = (event: Event) => {
  errorMessage.value = '';
  const target = event.target as HTMLInputElement;
  const file = target.files?.item(0);
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'Hanya format JPG, PNG, atau PDF.';
    selectedFile.value = null;
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'Ukuran file maksimal 2MB.';
    selectedFile.value = null;
    return;
  }

  selectedFile.value = file;
};

const submitBukti = async () => {
  if (!selectedFile.value) return;
  if (!reservasiId.value) {
    errorMessage.value = 'Reservasi tidak valid. Silakan ulangi dari Tiket Saya.';
    return;
  }

  try {
    isSubmitting.value = true;
    await postUploadBukti(reservasiId.value, selectedFile.value);
    showSuccessView.value = true;
    if (uploadSuccessKey.value) {
      sessionStorage.setItem(uploadSuccessKey.value, '1');
    }
  } catch (error: unknown) {
    const apiError = error as ApiError;

    if (apiError.response?.status === 410) {
      showTimeoutModal.value = true;
    } else {
      errorMessage.value = apiError.response?.data?.message || 'Terjadi kesalahan saat mengunggah.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  if (showSuccessView.value) {
    goToMyTicket();
    return;
  }
  router.back();
};

const goToMyTicket = () => router.replace({ name: 'MyTickets' });

onMounted(() => {
  if (!reservasiId.value) {
    errorMessage.value = 'ID reservasi tidak ditemukan. Silakan buka dari Tiket Saya atau Reservasi Gantangan.';
  }
  if (uploadSuccessKey.value && sessionStorage.getItem(uploadSuccessKey.value) === '1') {
    showSuccessView.value = true;
  }
  startTimer();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
/* CSS Sakti untuk garansi tombol anti-gaib */
@media (max-width: 767px) {
  .btn-desktop {
    display: none !important;
  }
}
@media (min-width: 768px) {
  .btn-mobile-wrapper {
    display: none !important;
  }
}

/* Transisi Sidebar */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Menghilangkan scrollbar */
main::-webkit-scrollbar {
  display: none;
}
main {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
