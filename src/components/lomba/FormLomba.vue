<template>
  <div class="bg-white rounded-lg border border-gray-600 w-full p-8 shadow-sm font-plus-jakarta">
    <div class="flex flex-col items-center gap-2 mb-6 text-blue-800">
      <h2 class="text-2xl font-bold">{{ isEdit ? 'Edit Lomba' : 'Buat Lomba Baru' }}</h2>
      <p class="text-sm text-gray-600 text-center">
        Pastikan semua detail lomba sudah benar <br/>sebelum {{ isEdit ? 'diperbarui' : 'dibuat' }}.
      </p>
    </div>

    <form @submit.prevent="submitForm" class="space-y-5">
      <!-- Row 1: Nama & Lokasi -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Nama Lomba <span class="text-red-500">*</span></label>
          <input
            v-model="form.namaLomba"
            type="text"
            class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nama Lomba"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Lokasi <span class="text-red-500">*</span></label>
          <input
            v-model="form.lokasi"
            type="text"
            class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Lokasi"
            required
          />
        </div>
      </div>

      <!-- Row 2: Tanggal & Jenis Burung -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Tanggal - Waktu <span class="text-red-500">*</span></label>
          <input
            v-model="form.waktuTanggal"
            type="datetime-local"
            class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Jenis Burung <span class="text-red-500">*</span></label>
          <select
            v-model="form.jenisBurung"
            class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
        </div>
      </div>

      <!-- Row 3: Kelas & Harga -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Kelas</label>
          <input
            v-model="form.kelas"
            type="text"
            class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kelas"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">Harga Tiket <span class="text-red-500">*</span></label>
          <input
            v-model.number="form.hargaTiket"
            type="number"
            min="0"
            class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rp -"
            required
          />
        </div>
      </div>

      <!-- Juri Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="juriIndex in 4" :key="juriIndex">
          <label class="block text-sm font-semibold mb-2">Juri {{ juriIndex }} <span class="text-red-500">*</span></label>
          <select
            v-model="selectedJuriIds[juriIndex - 1]"
            class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
        </div>
      </div>

      <!-- Contact Person -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Contact Person <span class="text-red-500">*</span></label>
          <input
            v-model="form.contactPerson"
            type="text"
            class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contact Person"
            required
          />
        </div>

        <!-- Jumlah Juara + Hadiah Side by Side -->
        <div class="flex gap-4">
          <div class="w-32">
            <label class="block text-sm font-semibold mb-2">Jumlah Juara <span class="text-red-500">*</span></label>
            <input
              v-model.number="jumlahJuara"
              type="number"
              min="1"
              max="10"
              @input="updateHadiahArray"
              class="w-full border border-blue-800 rounded-lg px-4 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              required
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold mb-2">Hadiah</label>
            <div class="space-y-2">
              <div v-for="(prize, index) in form.hadiah" :key="index" class="flex items-center gap-2">
                <span class="text-xs font-medium w-16">Juara {{ index + 1 }} <span class="text-red-500">*</span></span>
                <input
                  v-model.number="form.hadiah[index]"
                  type="number"
                  min="0"
                  class="flex-1 border border-blue-800 rounded-lg px-3 py-2 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Rp -"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Action -->
      <div class="flex justify-center gap-3 pt-6">
        <button
          type="button"
          @click="$emit('cancel')"
          class="bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
        >
          Kembali
        </button>
        <button
          type="submit"
          class="bg-blue-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 transition min-w-[150px]"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Loading...' : (isEdit ? 'Simpan Perubahan' : 'Buat Lomba') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { postCreateLomba, putUpdateLomba, getAvailableJuri, postAssignJuri } from '@/services/lomba.service';
import type { UserSummary } from '@/interfaces/lomba.interface';

const props = defineProps<{
  isEdit?: boolean;
  editData?: any;
}>();

const emit = defineEmits(['cancel', 'success']);
const router = useRouter();

const isLoading = ref(false);
const availableJuriList = ref<UserSummary[]>([]);
const selectedJuriIds = ref<(number | null)[]>([null, null, null, null]);
const jumlahJuara = ref(1);

const form = reactive({
  namaLomba: '',
  lokasi: '',
  waktuTanggal: '',
  jenisBurung: '',
  kelas: '',
  hargaTiket: 0,
  hadiah: [0] as number[],
  jumlahJuri: 4, // Fixed 4 juri sesuai Figma
  contactPerson: ''
});

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
  } catch (error) {
    console.error("Gagal mengambil data juri", error);
    alert("Gagal mengambil data juri. Pastikan Anda sudah login sebagai Koordinator Lomba.");
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
    }
  }
}, { immediate: true });

const submitForm = async () => {
  // Validasi 4 juri harus dipilih semua
  const validJuriIds = selectedJuriIds.value.filter(id => id !== null) as number[];
  if (validJuriIds.length !== 4) {
    alert("Harus memilih 4 juri!");
    return;
  }

  // Validasi hadiah tidak boleh kosong atau 0
  if (form.hadiah.length === 0 || form.hadiah.some(h => h <= 0)) {
    alert("Semua hadiah harus diisi dengan nominal yang valid!");
    return;
  }

  try {
    isLoading.value = true;

    const payloadLomba = {
      ...form,
      waktuTanggal: form.waktuTanggal.length === 16 ? `${form.waktuTanggal}:00` : form.waktuTanggal
    };

    let lombaIdToAssign = '';

    if (props.isEdit) {
      await putUpdateLomba(props.editData.id, payloadLomba);
      lombaIdToAssign = props.editData.id;
    } else {
      const newLomba = await postCreateLomba(payloadLomba);
      lombaIdToAssign = newLomba.id;
    }

    // Assign juri
    await postAssignJuri(lombaIdToAssign, { juriIds: validJuriIds });

    alert(props.isEdit ? "Data lomba berhasil diperbarui" : "Lomba berhasil dibuat");
    emit('success');
    router.push('/katalog-lomba');

  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Terjadi kesalahan";
    alert("Gagal menyimpan lomba: " + errorMsg);
  } finally {
    isLoading.value = false;
  }
};
</script>
