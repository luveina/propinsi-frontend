<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-sm">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-blue-900">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer">&times;</button>
      </div>

      <form @submit.prevent="submitForm">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Username</label>
            <input v-model="form.username" :readonly="isEdit" :class="[{ 'bg-gray-100 cursor-not-allowed': isEdit }]
            + ' w-full border rounded-lg px-3 py-2 focus:outline-blue-500'"
            type="text" placeholder="Masukkan username" required />
            <p v-if="isEdit" class="text-xs text-gray-400 mt-1">Username tidak dapat diubah</p>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Nama Lengkap</label>
            <input v-model="form.fullName" type="text" class="w-full border rounded-lg px-3 py-2 focus:outline-blue-500" placeholder="Masukkan nama lengkap" required />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Nomor WhatsApp</label>
            <input v-model="form.phoneNumber" type="text" class="w-full border rounded-lg px-3 py-2 focus:outline-blue-500" placeholder="Masukkan nomor WhatsApp" required />
          </div>

          <div v-if="!isEdit">
            <label class="block text-sm font-semibold mb-1 text-gray-500">Password</label>
            <input type="text" value="Silobur123!" class="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
            <p class="text-xs text-gray-400 mt-1">Default password. Harap ubah saat login.</p>
          </div>

          <div v-if="isEdit">
            <label class="block text-sm font-semibold mb-1">Password</label>
            <button 
              type="button" 
              @click="showResetConfirm = true" 
              class="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Reset Password?
            </button>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Role</label>
            <div class="relative">
                <select v-model="form.role" class="w-full border rounded-lg px-3 py-2 focus:outline-blue-500 appearance-none" required>
                    <option value="" disabled>Pilih Role untuk Pengguna</option>
                    <option value="Juri">Juri</option>
                    <option value="Koordinator Lomba">Koordinator Lomba</option>
                    <option value="Koordinator Pendaftaran">Koordinator Pendaftaran</option>
                    <option value="Peserta">Peserta</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
          </div>
        </div>

        <button type="submit" class="w-full bg-blue-700 text-white font-bold py-3 rounded-lg mt-8 hover:bg-blue-800 transition shadow-md cursor-pointer">
          Simpan
        </button>
      </form>
    </div>
  </div>

  <ResetConfirmModal 
    :show="showResetConfirm" 
    @close="showResetConfirm = false" 
    @confirm="handleExecuteReset" 
  />

  <ResetSuccessModal 
    :show="showResetSuccess" 
    @close="showResetSuccess = false" 
  />
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue';
import { postCreateAccount, updateAccount, resetPasswordAccount } from '@/services/account.service';
import ResetConfirmModal from '@/components/modals/ResetConfirmModal.vue';
import ResetSuccessModal from '@/components/modals/ResetSuccessModal.vue';

const props = defineProps<{
  isEdit?: boolean;
  editData?: any;
}>();

const isEdit = computed(() => !!props.isEdit);
const emit = defineEmits(['close', 'success']);

// States untuk Reset Password
const showResetConfirm = ref(false);
const showResetSuccess = ref(false);

const title = computed(() => (props.isEdit ? 'Edit Akun' : 'Tambah Akun'));

const form = reactive({
  username: '',
  fullName: '',
  phoneNumber: '',
  role: ''
});

// Watcher untuk mengisi form saat edit
watch(
  () => [props.isEdit, props.editData],
  ([isEdit, editData]) => {
    if (isEdit && editData) {
      form.username = editData.username || '';
      form.fullName = editData.fullName || '';
      form.phoneNumber = editData.phoneNumber || '';
      form.role = editData.role || '';
    } else {
      form.username = '';
      form.fullName = '';
      form.phoneNumber = '';
      form.role = '';
    }
  },
  { immediate: true }
);

const handleExecuteReset = async () => {
  try {
    if (props.editData?.id) {
      await resetPasswordAccount(props.editData.id);
      showResetConfirm.value = false;
      showResetSuccess.value = true;
    }
  } catch (error) {
    alert("Gagal mereset password: " + error);
  }
};

const submitForm = async () => {
  try {
    if (isEdit.value && props.editData?.id) {
      const payload = { ...form };
      await updateAccount(props.editData.id, payload);
    } else {
      await postCreateAccount(form);
    }
    emit('success');
    emit('close');
  } catch (error) {
    alert("Gagal menyimpan: " + error);
  }
};
</script>

<style scoped>
select {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  background-image: none !important;
}
</style>