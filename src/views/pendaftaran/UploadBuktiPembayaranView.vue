<template>
  <div class="h-screen flex flex-col bg-[#F4F7FE] font-plus-jakarta overflow-hidden">

    <header_mobile title="Upload Bukti Pembayaran" class="flex-none bg-white shadow-sm z-30" />

    <main class="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center">
      <div class="w-full max-w-md pb-10">

        <section v-if="!isSuccess" class="space-y-4">

          <div class="rounded-2xl border border-[#D9E3FF] bg-white p-5 shadow-sm text-center">
            <p class="text-xs font-semibold uppercase tracking-wide text-[#2E42B2]">Sisa Waktu Pembayaran</p>
            <p class="mt-1 text-4xl font-black text-[#D93E39] tracking-wider tabular-nums">{{ countdown }}</p>
            <p class="mt-2 text-xs text-slate-500">
              Segera transfer agar tiket gantanganmu tidak hangus.
            </p>
          </div>

          <div class="rounded-2xl border border-[#D9E3FF] bg-white p-5 shadow-sm">
            <h2 class="text-[15px] font-bold text-[#2E42B2] mb-4">Instruksi Pembayaran</h2>
            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between gap-4">
                <span class="text-slate-500">Bank Tujuan</span>
                <span class="font-bold text-slate-800 text-right">{{ BANK_NAME }}</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-slate-500">No. Rekening</span>
                <span class="font-bold text-slate-800 text-right">{{ BANK_ACCOUNT }}</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-slate-500">Atas Nama</span>
                <span class="font-bold text-slate-800 text-right">{{ ACCOUNT_HOLDER }}</span>
              </div>
              <hr class="border-dashed border-gray-200" />
              <div class="flex items-center justify-between gap-4">
                <span class="text-slate-500">No. Gantangan</span>
                <span class="font-bold text-[#2E42B2] bg-blue-50 px-2 py-0.5 rounded text-right">{{ paymentSeatLabel }}</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-slate-500">Total Bayar</span>
                <span class="font-black text-[#D93E39] text-lg text-right">{{ formattedNominal }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-[#D9E3FF] bg-white p-5 shadow-sm">
            <h3 class="text-[15px] font-bold text-[#2E42B2] mb-1">Unggah Bukti</h3>
            <p class="text-[11px] text-slate-500 mb-4">Pastikan nominal sesuai (JPG, PNG, PDF maks 2MB)</p>

            <FileUploader v-model="selectedFile" :error="uploadError" :disabled="isUploading" />

            <button
              class="mt-6 w-full rounded-xl bg-[#2E42B2] py-4 text-[15px] font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              :disabled="isUploading || !selectedFile"
              @click="submitProof"
            >
              {{ isUploading ? 'Memproses...' : 'Kirim Bukti Pembayaran' }}
            </button>
          </div>
        </section>

        <section v-else class="rounded-3xl border border-[#D9E3FF] bg-white p-8 text-center shadow-sm mt-4">
          <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 border-8 border-green-100">
            <svg class="success-check w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h2 class="text-2xl font-black text-slate-800">Berhasil!</h2>
          <p class="mt-2 text-sm text-slate-500">Bukti pembayaranmu sudah diterima dan sedang kami tinjau.</p>

          <div class="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Tiket</p>
            <p class="mt-1 text-lg font-black text-[#2E42B2]">Menunggu Konfirmasi</p>
          </div>

          <button class="mt-8 w-full rounded-xl bg-[#2E42B2] py-4 text-[15px] font-bold text-white shadow-lg hover:bg-blue-800" @click="goToMyTicket">
            Cek Tiket Saya
          </button>
        </section>

      </div>
    </main>

    <ErrorModal
      :show="showTimeoutModal"
      type="info"
      message="Waktu Habis! Silakan reservasi kembali"
      confirm-label="Cari Nomor Lain"
      :show-cancel="false"
      @confirm="onTimeoutConfirm"
      @close="onTimeoutConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import header_mobile from '@/components/HeaderMobile.vue';
import ErrorModal from '@/components/modals/ErrorModal.vue';
import FileUploader from '@/components/reservasi/FileUploader.vue';
import { getLombaById } from '@/services/lomba.service';
import {
  clearPendingPayment,
  getPendingPayment,
  postUploadBuktiPembayaran,
  saveLastTicket,
} from '@/services/reservasi.service';

const BANK_NAME = 'BCA';
const BANK_ACCOUNT = '1234567890';
const ACCOUNT_HOLDER = 'SILOBUR INDONESIA';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const router = useRouter();
const route = useRoute();

const selectedFile = ref<File | null>(null);
const uploadError = ref('');
const isUploading = ref(false);
const isSuccess = ref(false);
const showTimeoutModal = ref(false);
const countdown = ref('00:00:00');
const deadlineMs = ref(0);
const nominal = ref(0);
const paymentSeatLabel = ref('-');
const reservasiId = ref('');
const lombaId = ref('');

let timerId: ReturnType<typeof setInterval> | null = null;

const formattedNominal = computed(() =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nominal.value)
);

const updateCountdown = () => {
  const diff = Math.max(0, deadlineMs.value - Date.now());
  const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
  const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

  countdown.value = `${hours}:${minutes}:${seconds}`;

  if (diff <= 0 && !isSuccess.value) {
    showTimeoutModal.value = true;
    stopTimer();
  }
};

const startTimer = (reservedAt: string) => {
  deadlineMs.value = new Date(reservedAt).getTime() + 2 * 60 * 60 * 1000;
  updateCountdown();
  timerId = setInterval(updateCountdown, 1000);
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

const validateSelectedFile = (file: File) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Format file tidak valid. Gunakan JPG, PNG, atau PDF.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Ukuran file melebihi batas 2MB.';
  }

  return '';
};

const submitProof = async () => {
  if (!selectedFile.value || !reservasiId.value) {
    uploadError.value = 'Data reservasi tidak ditemukan. Silakan ulangi reservasi.';
    return;
  }

  if (Date.now() >= deadlineMs.value) {
    showTimeoutModal.value = true;
    return;
  }

  uploadError.value = '';
  isUploading.value = true;

  try {
    const response = await postUploadBuktiPembayaran(reservasiId.value, selectedFile.value);
    isSuccess.value = true;
    stopTimer();

    // Save tiket terbaru untuk ditampilkan di My Ticket
    saveLastTicket({
      reservasiId: response.data?.id || reservasiId.value,
      lombaId: lombaId.value,
      nomorGantangan: paymentSeatLabel.value,
      nominal: nominal.value,
      status: response.data?.status || 'MENUNGGU KONFIRMASI',
      urlBuktiPembayaran: response.data?.urlBukti,
    });

    clearPendingPayment();
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
    if (axiosError.response?.status === 410) {
      showTimeoutModal.value = true;
      return;
    }

    uploadError.value = axiosError.response?.data?.message || 'Gagal mengunggah bukti pembayaran.';
  } finally {
    isUploading.value = false;
  }
};

const onTimeoutConfirm = () => {
  clearPendingPayment();
  router.push({ name: 'reservasi-gantangan', params: { lombaId: lombaId.value } });
};

const goToMyTicket = () => {
  router.push({ name: 'my-ticket' });
};

const initPage = async () => {
  const pendingPayment = getPendingPayment();
  const queryReservasiId = route.query.reservasiId;

  if (pendingPayment) {
    reservasiId.value = pendingPayment.reservasiId;
    lombaId.value = pendingPayment.lombaId;
    paymentSeatLabel.value = String(pendingPayment.nomorGantangan);
    startTimer(pendingPayment.reservedAt);
  } else if (typeof queryReservasiId === 'string' && queryReservasiId) {
    reservasiId.value = queryReservasiId;
    lombaId.value = String(route.query.lombaId || route.params.lombaId || '');
    paymentSeatLabel.value = String(route.query.nomorGantangan || '-');
    nominal.value = Number(route.query.nominal || 0);
    const fallbackReservedAt = String(route.query.waktuReservasi || new Date().toISOString());
    startTimer(fallbackReservedAt);
  } else {
    router.push({ name: 'katalog-lomba' });
    return;
  }

  // Fallback API call kalau nominal belum ada
  if (!nominal.value && lombaId.value) {
    try {
      const lombaRes = await getLombaById(lombaId.value);
      const lombaData = lombaRes.data ?? lombaRes;
      nominal.value = lombaData.hargaTiket ?? 0;
    } catch (error) {
      console.error(error);
    }
  }
};

onMounted(() => {
  initPage();
});

onBeforeUnmount(() => {
  stopTimer();
});

watch(selectedFile, (file) => {
  if (!file) {
    uploadError.value = '';
    return;
  }
  uploadError.value = validateSelectedFile(file);
});
</script>

<style scoped>
/* Transisi Sidebar (kalau ada) */
.success-check {
  animation: pop-check 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes pop-check {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Menghilangkan scrollbar tapi tetap bisa scroll (optional untuk tampilan clean) */
main::-webkit-scrollbar {
  display: none;
}
main {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
