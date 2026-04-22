<template>
  <form @submit.prevent="submitForm" class="space-y-5 font-plus-jakarta">
      <!-- Row 1: Nama & Lokasi -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Nama Lomba <span class="text-red-500">*</span></label>
          <input
            v-model="form.namaLomba"
            type="text"
            :disabled="isFieldsDisabled"
            class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Nama Lomba"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Lokasi <span class="text-red-500">*</span></label>
          <input
            v-model="form.lokasi"
            type="text"
            :disabled="isFieldsDisabled"
            class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Lokasi"
            required
          />
        </div>
      </div>

      <!-- Row 2: Tanggal & Jenis Burung -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Tanggal - Waktu <span class="text-red-500">*</span></label>
          <input
            v-model="form.waktuTanggal"
            type="datetime-local"
            :disabled="isFieldsDisabled"
            class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Jenis Burung <span class="text-red-500">*</span></label>
          <div class="relative">
            <select
              v-model="form.jenisBurung"
              :disabled="isFieldsDisabled"
              class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="" disabled>Jenis Burung</option>
              <option value="MURAI_BATU">Murai Batu</option>
              <option value="CUCAK_IJO">Cucak Ijo</option>
              <option value="KACER">Kacer</option>
              <option value="KENARI">Kenari</option>
              <option value="ANIS_KEMBANG">Anis Kembang</option>
              <option value="LOVE_BIRD">Love Bird</option>
            </select>
            <svg class="w-4 h-4 absolute right-3 top-3.5 text-[#2D48C8] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <!-- Row 3: Kelas (dropdown) & Harga -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Kelas <span class="text-red-500">*</span></label>
          <div class="relative">
            <select
              v-model="form.kelas"
              :disabled="isFieldsDisabled"
              class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="" disabled>Pilih Kelas</option>
              <option value="Standard">Standard</option>
              <option value="Ekonomis">Ekonomis</option>
              <option value="Premium">Premium</option>
              <option value="Ultimate">Ultimate</option>
              <option value="Super Priority">Super Priority</option>
            </select>
            <svg class="w-4 h-4 absolute right-3 top-3.5 text-[#2D48C8] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Harga Tiket <span class="text-red-500">*</span></label>
          <input
            v-model="hargaTiketDisplay"
            type="text"
            inputmode="numeric"
            :disabled="isFieldsDisabled"
            class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Rp 0"
            required
          />
        </div>
      </div>

      <!-- Row 4: Deskripsi Lomba -->
      <div>
        <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Deskripsi Lomba <span class="text-red-500">*</span></label>
        <textarea
          v-model="form.deskripsi"
          :disabled="isFieldsDisabled"
          rows="4"
          class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Tulis deskripsi lomba"
          required
        ></textarea>
      </div>

      <!-- Juri Section: 4 dropdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="juriIndex in 4" :key="juriIndex">
          <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Juri {{ juriIndex }} <span class="text-red-500">*</span></label>
          <div class="relative">
            <select
              v-model="selectedJuriIds[juriIndex - 1]"
              :disabled="isJuriDisabled"
              class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
              required
            >
              <option :value="null" disabled>Juri {{ juriIndex }}</option>
              <option
                v-for="juri in availableJuriList"
                :key="juri.id"
                :value="juri.id"
                :disabled="selectedJuriIds.includes(juri.id) && selectedJuriIds[juriIndex - 1] !== juri.id"
              >
                {{ juri.fullName }}
              </option>
            </select>
            <svg class="w-4 h-4 absolute right-3 top-3.5 text-[#2D48C8] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <!-- Contact Person + Jumlah Juara & Hadiah -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Contact Person <span class="text-red-500">*</span></label>
          <input
            v-model="form.contactPerson"
            type="text"
            :disabled="isFieldsDisabled"
            class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Nama - Nomor WA"
            required
          />
        </div>

        <!-- Jumlah Juara + Hadiah -->
        <div class="flex gap-4">
          <div class="w-32">
            <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Jumlah Juara <span class="text-red-500">*</span></label>
            <input
              v-model.number="jumlahJuara"
              type="number"
              min="1"
              max="10"
              :disabled="isFieldsDisabled"
              @input="updateHadiahArray"
              class="w-full border border-[#2D48C8] rounded-lg px-4 py-2.5 bg-[#DEE8FB] text-[#1C244F] font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold mb-2 text-[#1E3A8A]">Hadiah per Juara</label>
            <div class="space-y-2">
              <div v-for="(prize, index) in form.hadiah" :key="index" class="flex items-center gap-2">
              <span class="text-xs font-semibold text-[#1E3A8A] w-14 shrink-0">Juara {{ index + 1 }} <span class="text-red-500">*</span></span>
              <input
                :value="formatRupiah(prize ?? 0)"
                :disabled="isFieldsDisabled"
                @input="(e) => updateHadiahValue(index, (e.target as HTMLInputElement).value)"
                type="text"
                inputmode="numeric"
                class="flex-1 border border-[#2D48C8] rounded-lg px-3 py-2 bg-[#DEE8FB] text-[#1C244F] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Rp 0"
                required
              />
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Action -->
      <div class="flex justify-center gap-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg font-bold hover:bg-gray-300 transition text-sm"
        >
          Kembali
        </button>
        <button
          type="submit"
          class="bg-[#2E42B2] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition min-w-[160px] text-sm"
          :disabled="isSubmitDisabled"
        >
          {{ isLoading ? 'Loading...' : (isEdit ? 'Simpan Perubahan' : 'Buat Lomba') }}
        </button>
      </div>
  </form>

  <ConfirmLombaModal
    :show="showConfirmModal"
    :is-edit="isEdit"
    :loading="isLoading"
    @close="showConfirmModal = false"
    @confirm="executeSubmit"
  />

  <ErrorModal
    :show="isErrorModalOpen"
    :type="errorType"
    :message="errorMessage"
    confirm-label="OK"
    @close="isErrorModalOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { postCreateLomba, putUpdateLomba, getAvailableJuri, postAssignJuri } from '@/services/lomba.service';
import type { UserSummary } from '@/interfaces/lomba.interface';
import ConfirmLombaModal from '@/components/modals/ConfirmLombaModal.vue';
import ErrorModal from '@/components/modals/ErrorModal.vue';

const props = defineProps<{
  isEdit?: boolean;
  editData?: any;
}>();

const emit = defineEmits(['cancel', 'success']);

const isBelumDimulai = computed(() => {
  return !props.isEdit || props.editData?.status === 'BELUM_DIMULAI';
});

// Non-juri fields are locked if there are active reservations, or if lomba is no longer BELUM_DIMULAI.
const isFieldsDisabled = computed(() => {
  return props.isEdit && (props.editData?.hasReservations === true || !isBelumDimulai.value);
});

// Juri can be edited only until lomba is declared BERLANGSUNG.
const isJuriDisabled = computed(() => {
  return props.isEdit && !isBelumDimulai.value;
});

const isSubmitDisabled = computed(() => {
  return isLoading.value || (props.isEdit && !isBelumDimulai.value);
});
const router = useRouter();

const isLoading = ref(false);
const availableJuriList = ref<UserSummary[]>([]);
const selectedJuriIds = ref<(number | null)[]>([null, null, null, null]);
const jumlahJuara = ref(1);
const showConfirmModal = ref(false);

// Error modal state
const isErrorModalOpen = ref(false);
const errorMessage = ref('');
const errorType = ref<'error' | 'success' | 'info'>('error');

const form = reactive({
  namaLomba: '',
  lokasi: '',
  waktuTanggal: '',
  jenisBurung: '',
  kelas: '',
  hargaTiket: 0,
  deskripsi: '',
  hadiah: [0] as number[],
  jumlahJuri: 4, // Fixed 4 juri sesuai Figma
  contactPerson: '',
});

const formatRupiah = (value?: number) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const safeValue = Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : 0;
  return `Rp ${new Intl.NumberFormat('id-ID').format(safeValue)}`;
};

const parseRupiah = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return 0;

  const parsed = Number.parseInt(digitsOnly, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const updateHadiahValue = (index: number, value: string) => {
  form.hadiah[index] = parseRupiah(value);
};

const hargaTiketDisplay = computed({
  get: () => formatRupiah(form.hargaTiket),
  set: (input: string) => {
    form.hargaTiket = parseRupiah(input);
  }
});

const hasFetchedJuri = ref(false);

const sanitizeSelectedJuri = () => {
  if (!hasFetchedJuri.value) return; // tunggu sampai list juri di-fetch
  const availableIds = new Set(availableJuriList.value.map((juri) => juri.id));
  selectedJuriIds.value = selectedJuriIds.value.map((id) => {
    if (id === null) {
      return null;
    }
    return availableIds.has(id) ? id : null;
  });
};

// Update hadiah array based on jumlahJuara
const updateHadiahArray = () => {
  const currentLength = form.hadiah.length;
  const targetLength = jumlahJuara.value;

  if (targetLength > currentLength) {
    // Add more hadiah slots
    for (let i = currentLength; i < targetLength; i++) {
      form.hadiah.push(0);
    }
  } else if (targetLength < currentLength) {
    // Remove extra hadiah slots
    form.hadiah.splice(targetLength);
  }
};

// Load Dropdown Juri saat komponen dimount
onMounted(async () => {
  try {
    availableJuriList.value = await getAvailableJuri();
    hasFetchedJuri.value = true;
    sanitizeSelectedJuri();
  } catch (error) {
    console.error("Gagal mengambil data juri", error);
    showError("Gagal mengambil data juri. Pastikan Anda sudah login sebagai Koordinator Lomba.");
  }
});

// Watcher untuk mengisi form jika mode Edit
watch(() => props.editData, (newData) => {
  if (props.isEdit && newData) {
    form.namaLomba = newData.namaLomba;
    form.lokasi = newData.lokasi;
    form.waktuTanggal = newData.waktuTanggal ? newData.waktuTanggal.substring(0, 16) : '';
    form.jenisBurung = newData.jenisBurung;
    form.kelas = newData.kelas;
    form.hargaTiket = newData.hargaTiket;
    form.deskripsi = newData.deskripsi ?? '';
    form.hadiah = newData.hadiah && Array.isArray(newData.hadiah) ? [...newData.hadiah] : [0];
    jumlahJuara.value = form.hadiah.length;
    form.jumlahJuri = 4; // Always 4 juri
    form.contactPerson = newData.contactPerson;

    // Set juri yang sudah terpilih ke dropdown yang sesuai
    if (newData.listJuri && Array.isArray(newData.listJuri)) {
      selectedJuriIds.value = [null, null, null, null];
      newData.listJuri.forEach((juri: UserSummary, index: number) => {
        if (index < 4) {
          selectedJuriIds.value[index] = juri.id;
        }
      });
      sanitizeSelectedJuri();
    }
  }
}, { immediate: true });

const submitForm = async () => {
  if (props.isEdit && !isBelumDimulai.value) {
    showError("Edit juri hanya dapat dilakukan sebelum lomba dinyatakan berlangsung.");
    return;
  }

  // Validasi 4 juri harus dipilih semua
  const validJuriIds = selectedJuriIds.value.filter(id => id !== null) as number[];
  if (validJuriIds.length !== 4) {
    showError("Harus memilih 4 juri!");
    return;
  }

  // Validasi hadiah tidak boleh kosong atau 0
  if (form.hadiah.length === 0 || form.hadiah.some(h => h <= 0)) {
    showError("Semua hadiah harus diisi dengan nominal yang valid!");
    return;
  }

  // Buka modal konfirmasi
  showConfirmModal.value = true;
};

const showError = (message: string) => {
  errorMessage.value = message;
  errorType.value = 'error';
  isErrorModalOpen.value = true;
};

const executeSubmit = async () => {
  const validJuriIds = selectedJuriIds.value.filter(id => id !== null) as number[];

  try {
    isLoading.value = true;

    const payloadLomba = {
      ...form,
      waktuTanggal: form.waktuTanggal.length === 16 ? `${form.waktuTanggal}:00` : form.waktuTanggal
    };

    let lombaIdToAssign = '';

    if (props.isEdit) {
      // Jika ada reservasi, skip update lomba fields - hanya update juri
      if (!props.editData?.hasReservations) {
        await putUpdateLomba(props.editData.id, payloadLomba);
      }
      lombaIdToAssign = props.editData.id;
    } else {
      const newLomba = await postCreateLomba(payloadLomba);
      lombaIdToAssign = newLomba.id;
    }

    // Assign juri
    await postAssignJuri(lombaIdToAssign, { juriIds: validJuriIds });

    showConfirmModal.value = false;
    emit('success');
    router.push('/katalog-lomba');

  } catch (error: any) {
    showConfirmModal.value = false;
    const errorMsg = error.response?.data?.message || error.message || "Terjadi kesalahan";
    showError("Gagal menyimpan lomba: " + errorMsg);
  } finally {
    isLoading.value = false;
  }
};
</script>
