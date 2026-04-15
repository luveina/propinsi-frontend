<template>
  <div class="min-h-screen bg-gray-100 flex justify-center font-sans">
    <main class="w-full max-w-md bg-white min-h-screen shadow-lg relative flex flex-col">

      <header class="bg-[#2E42B2] text-white p-4 flex items-center justify-between">
        <button @click="goBack" class="p-2 hover:bg-white/20 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h1 class="text-xl font-bold">Reservasi</h1>
        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
        </div>
      </header>

      <div v-if="showSuccessView" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 border-8 border-green-100">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 class="text-2xl font-bold text-[#2E42B2] mb-2">Pembayaran berhasil<br/>ter-upload!</h2>
        <p class="text-gray-500 text-sm mb-10">Tim kami sedang memverifikasi pembayaran Anda.<br/>Mohon tunggu maksimal 1x24 jam.</p>
        <button @click="goToMyTicket" class="w-full bg-[#2E42B2] text-white font-bold py-4 rounded-lg hover:bg-blue-800 transition">
          Lihat Tiket Saya
        </button>
      </div>

      <div v-else class="flex-1 flex flex-col pb-6">

        <div class="bg-[#2E42B2] text-white text-center py-6 px-4">
          <p class="text-sm text-blue-100 mb-1">Waktu tersisa sebelum <span class="font-bold">{{ deadlineText }}</span></p>
          <p class="text-4xl font-bold tracking-wider">{{ formattedTimeLeft }}</p>
        </div>

        <div class="px-5 pt-6 space-y-4">
          <div class="bg-blue-50 p-4 rounded-xl flex items-center border border-blue-100">
            <div class="w-10 h-10 bg-[#2E42B2] rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/></svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-[#2E42B2]">{{ namaLomba }}</h3>
              <p class="text-xs text-gray-500">Jl. Jatijajar, Depok</p>
            </div>
            <div class="bg-[#2E42B2] text-white text-center px-3 py-1 rounded-lg">
              <p class="text-[10px] uppercase">Nomor</p>
              <p class="font-bold text-lg leading-tight">{{ nomorGantangan }}</p>
            </div>
          </div>

          <div class="border border-gray-200 rounded-xl p-4 shadow-sm">
            <div class="flex items-center text-[#2E42B2] font-bold mb-4">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              TRANSFER KE
            </div>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Bank</span>
                <span class="font-bold">BCA</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500">No. Rekening</span>
                <div class="flex items-center gap-2">
                  <span class="font-bold">5405213556</span>
                  <button @click="copyText('5405213556')" class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold hover:bg-gray-200">📋 Salin</button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Nama Rekening</span>
                <span class="font-bold">PT Silobur Indonesia</span>
              </div>

              <div class="mt-4 p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <p class="text-xs text-gray-500 mb-1 font-semibold">TOTAL BAYAR</p>
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-orange-500">{{ formatCurrency(nominal) }}</span>
                  <button @click="copyText(nominal.toString())" class="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 shadow-sm">📋 Salin</button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3 rounded-lg flex items-start">
            <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            <p>Transfer tepat sesuai nominal. Nominal berbeda dapat memperlambat proses verifikasi.</p>
          </div>

          <button @click="showUploadModal = true" class="w-full border-2 border-dashed border-[#2E42B2] bg-blue-50 text-[#2E42B2] rounded-xl py-6 flex flex-col items-center justify-center hover:bg-blue-100 transition mt-4">
            <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <span class="font-bold">Unggah Bukti Transfer</span>
            <span class="text-xs mt-1">(JPG, PNG, PDF)</span>
          </button>
        </div>
      </div>

      <div v-if="showUploadModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div class="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden relative">
          <button @click="showUploadModal = false" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="p-6 text-center">
            <h3 class="text-lg font-bold text-[#2E42B2] mb-6">Upload Bukti Pembayaran</h3>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              @change="handleFileUpload"
              class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 mb-6 mx-auto cursor-pointer"
            />

            <p v-if="errorMessage" class="text-xs text-red-500 mb-4">{{ errorMessage }}</p>

            <button
              @click="submitBukti"
              :disabled="!selectedFile || isSubmitting"
              class="bg-[#2E42B2] text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// Import API kamu (sesuaikan importnya)
import { postUploadBukti } from '@/services/reservasi.service';

const router = useRouter();
const route = useRoute();

// Mengambil data dari Query Parameter saat di-push dari halaman denah
const reservasiId = ref(route.query.reservasiId as string || '');
const namaLomba = ref(route.query.namaLomba as string || 'SILOBUR CUP');
const nomorGantangan = ref(Number(route.query.nomorGantangan) || 0);
const nominal = ref(Number(route.query.nominal) || 0);
const waktuReservasi = ref(route.query.waktuReservasi as string || new Date().toISOString());

// State Halaman
const showUploadModal = ref(false);
const showSuccessView = ref(false);
const selectedFile = ref<File | null>(null);
const errorMessage = ref('');
const isSubmitting = ref(false);

// Timer State
const timeLeft = ref(0);
let timerInterval: ReturnType<typeof setInterval>;

// --- FUNGSI FORMATTING ---
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

// --- FUNGSI TIMER ---
const deadlineText = computed(() => {
  const createdTime = new Date(waktuReservasi.value).getTime();
  const deadline = new Date(createdTime + (2 * 60 * 60 * 1000));
  // Format contoh: "8 Januari 2025 21:30"
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
  const createdTime = new Date(waktuReservasi.value).getTime();
  const deadline = createdTime + (2 * 60 * 60 * 1000); // 2 Jam

  timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const diff = Math.floor((deadline - now) / 1000);

    if (diff <= 0) {
      clearInterval(timerInterval);
      timeLeft.value = 0;
      alert("Waktu pembayaran habis. Silakan reservasi kembali.");
      router.push({ name: 'katalog-lomba' });
    } else {
      timeLeft.value = diff;
    }
  }, 1000);
};

// --- FUNGSI UPLOAD ---
const handleFileUpload = (event: Event) => {
  errorMessage.value = '';
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'Hanya format JPG, PNG, atau PDF.';
    selectedFile.value = null;
    return;
  }

  if (file.size > 2 * 1024 * 1024) { // 2MB
    errorMessage.value = 'Ukuran maksimal 2MB.';
    selectedFile.value = null;
    return;
  }

  selectedFile.value = file;
};

const submitBukti = async () => {
  if (!selectedFile.value) return;

  try {
    isSubmitting.value = true;
    // Panggil Service API ke Spring Boot
    await postUploadBukti(reservasiId.value, selectedFile.value);

    // Jika sukses, tutup modal dan ganti tampilan halaman ke mode Sukses
    showUploadModal.value = false;
    showSuccessView.value = true;
  } catch (error: any) {
    if (error.response?.status === 410) {
      alert("Waktu pembayaran telah habis.");
      router.push({ name: 'katalog-lomba' });
    } else {
      errorMessage.value = error.response?.data?.message || 'Terjadi kesalahan saat mengunggah.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

// --- NAVIGASI ---
const goBack = () => router.back();
const goToMyTicket = () => router.push({ name: 'my-ticket' });

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
