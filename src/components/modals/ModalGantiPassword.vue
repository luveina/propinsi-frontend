<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-sm p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
      <button
        @click="$emit('close')"
        class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
      >
        &times;
      </button>

      <h2 class="text-xl font-bold text-[#2E42B2] mb-6 text-center">Ganti Password</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#2E42B2]">Password Lama</label>
          <PasswordInput v-model="form.oldPassword" placeholder="Masukkan password lama" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#2E42B2]">Password Baru</label>
          <PasswordInput v-model="form.newPassword" placeholder="Masukkan password baru" />
          <p class="text-[10px] text-gray-500 font-medium">* Minimal 6 karakter</p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#2E42B2]">Konfirmasi Password Baru</label>
          <PasswordInput v-model="form.confirmPassword" placeholder="Ulangi password baru" />
        </div>

        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="w-full text-white font-bold py-2.5 rounded-lg mt-4 transition shadow-md text-sm enabled:bg-[#2E42B2] enabled:hover:bg-blue-800 enabled:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Memproses...' : 'Simpan' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import PasswordInput from '@/components/PasswordInput.vue'
import { updatePassword } from '@/services/profile.service'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'success', 'error'])

const loading = ref(false)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isFormValid = computed(() => {
  return (
    form.oldPassword.trim() !== '' &&
    form.newPassword.length >= 6 &&
    form.confirmPassword.trim() !== ''
  )
})

const handleSubmit = async () => {
  if (form.newPassword !== form.confirmPassword) {
    emit('error', 'Konfirmasi password baru tidak cocok!')
    return
  }

  // Tambahan cek agar tidak sama dengan password lama (Opsional di frontend, karena backend sudah handle)
  if (form.newPassword === form.oldPassword) {
    emit('error', 'Password baru tidak boleh sama dengan password lama!')
    return
  }

  loading.value = true
  try {
    await updatePassword(form)
    emit('success')
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Gagal mengganti password'
    emit('error', msg)
  } finally {
    loading.value = false
  }
}
</script>
