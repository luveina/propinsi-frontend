<template>
  <div v-if="isDesktop" class="page-desktop">
    <div class="left-panel">
      <div class="left-text">
        <img src="@/assets/siloburputih.png" alt="SILOBUR-NG Logo" class="left-logo" />
        <b>Lomba burung menjadi lebih efisien<br />dengan SILOBUR-<i class="ng">NG!</i></b>
        <br /><br />
        <i class="ng">Penilaian jujur, transparan,<br />terbuka dan cepat</i>
      </div>
    </div>
    <div class="right-panel">
      <div class="form">
        <div class="brand">
          <img src="@/assets/silobur-biru.png" alt="SILOBUR-NG Logo" class="brand-logo" />
          <span class="brand-text"><b>SILOBUR-</b><i class="ng">NG</i></span>
        </div>
        <div class="subtitle">Buatlah password yang berbeda dari default!</div>

        <div class="field-group">
          <label class="field-label">Password Baru</label>
          <PasswordInput
            v-model="form.newPassword"
            placeholder="Password (minimal 6 karakter)"
            autocomplete="new-password"
            @blur="validateField('newPassword')"
          />
          <span v-if="errors.newPassword" class="error-msg">{{ errors.newPassword }}</span>
        </div>

        <div class="field-group">
          <label class="field-label">Konfirmasi Password</label>
          <PasswordInput
            v-model="form.confirmPassword"
            placeholder="Konfirmasi Password"
            autocomplete="new-password"
            @blur="validateField('confirmPassword')"
          />
          <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
        </div>

        <button class="btn-submit" @click="handleChangePassword" :disabled="authStore.loading || !isFormValid">
          <b>{{ authStore.loading ? 'Loading...' : 'Ganti Password' }}</b>
        </button>

        <button class="btn-back" @click="handleBackToLogin" :disabled="authStore.loading">
          Kembali ke Login
        </button>
      </div>
    </div>
  </div>

  <div v-else class="page-mobile">
    <div class="form">
      <div class="brand">
        <img src="@/assets/silobur-biru.png" alt="SILOBUR-NG Logo" class="brand-logo" />
        <span class="brand-text"><b>SILOBUR-</b><i class="ng">NG</i></span>
      </div>
      <div class="subtitle">Buatlah password yang berbeda dari default!</div>

      <div class="field-group">
        <label class="field-label">Password Baru</label>
        <PasswordInput
          v-model="form.newPassword"
          placeholder="Password"
          autocomplete="new-password"
          @blur="validateField('newPassword')"
        />
        <span v-if="errors.newPassword" class="error-msg">{{ errors.newPassword }}</span>
      </div>

      <div class="field-group">
        <label class="field-label">Konfirmasi Password</label>
        <PasswordInput
          v-model="form.confirmPassword"
          placeholder="Konfirmasi Password"
          autocomplete="new-password"
          @blur="validateField('confirmPassword')"
        />
        <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
      </div>

      <button class="btn-submit" @click="handleChangePassword" :disabled="authStore.loading || !isFormValid">
        <b>{{ authStore.loading ? 'Loading...' : 'Ganti Password' }}</b>
      </button>

      <button class="btn-back" @click="handleBackToLogin" :disabled="authStore.loading">
        Kembali ke Login
      </button>
    </div>
  </div>

  <ErrorModal
    :show="showErrorModal"
    type="error"
    :message="errorMessage"
    confirm-label="Coba Lagi"
    @confirm="showErrorModal = false"
    @close="showErrorModal = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useBreakpoint } from '@/composables/useBreakpoint'
import PasswordInput from '@/components/PasswordInput.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

const authStore = useAuthStore()
const { isDesktop } = useBreakpoint()

const form = ref({ newPassword: '', confirmPassword: '' })
const errors = ref({ newPassword: '', confirmPassword: '' })
const showErrorModal = ref(false)
const errorMessage = ref('')

// Validasi dinamis untuk mencegah "Silobur123!"
function validateField(field: 'newPassword' | 'confirmPassword') {
  if (field === 'newPassword') {
    if (!form.value.newPassword) {
      errors.value.newPassword = 'Password baru wajib diisi'
    } else if (form.value.newPassword === 'Silobur123!') {
      errors.value.newPassword = 'Password tidak boleh menggunakan default (Silobur123!)'
    } else if (form.value.newPassword.length < 6) {
      errors.value.newPassword = 'Password minimal 6 karakter'
    } else {
      errors.value.newPassword = ''
    }
    // Trigger ulang validasi konfirmasi jika password baru diganti
    if (form.value.confirmPassword) validateField('confirmPassword')
  }

  if (field === 'confirmPassword') {
    if (!form.value.confirmPassword) {
      errors.value.confirmPassword = 'Konfirmasi password wajib diisi'
    } else if (form.value.confirmPassword !== form.value.newPassword) {
      errors.value.confirmPassword = 'Password dan konfirmasi tidak cocok'
    } else {
      errors.value.confirmPassword = ''
    }
  }
}

function validateAll() {
  validateField('newPassword')
  validateField('confirmPassword')
}


const isFormValid = computed(() => {
  return (
    form.value.newPassword !== '' &&
    form.value.newPassword !== 'Silobur123!' &&
    form.value.newPassword.length >= 6 &&
    form.value.confirmPassword === form.value.newPassword
  )
})

async function handleChangePassword() {
  validateAll()
  if (!isFormValid.value) return

  authStore.clearError()
  await authStore.changeInitialPassword(form.value)
  if (authStore.error) {
    errorMessage.value = authStore.error
    showErrorModal.value = true
  }
}

// Fungsi kembali ke login, memanfaatkan authStore.logout untuk menghapus sesi token sementara
async function handleBackToLogin() {
  await authStore.logout()
}
</script>

<style scoped>

.error-msg {
  font-size: 12px;
  color: #d93e39;
  font-weight: 500;
  margin-top: 4px;
}

.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #6b7280;
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 8px;
  text-decoration: underline;
}

.btn-back:hover:not(:disabled) {
  color: #1c244f;
}

.btn-back:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  text-decoration: none;
}

/* Biarkan style lainnya di bawah ini... */
.page-desktop { display: flex; width: 100%; min-height: 100vh; background-color: #c4d8f9; font-family: 'Plus Jakarta Sans', sans-serif; }
.left-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 80px; }
.left-text { font-size: 32px; line-height: 38px; color: #2e42b2; text-align: center; }
.right-panel { width: 720px; flex-shrink: 0; background-color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 40px; box-sizing: border-box; }
.page-mobile { width: 100%; min-height: 100vh; background-color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px 34px; box-sizing: border-box; }
.form { width: 100%; max-width: 566px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
.brand { display: flex; align-items: center; justify-content: center; gap: 12px; }
.brand-logo { height: 64px; width: auto; object-fit: contain; }
.left-logo { height: 80px; width: auto; object-fit: contain; display: block; margin: 0 auto 16px; }
.brand-text { font-family: 'Afacad', sans-serif; font-size: 48px; letter-spacing: -0.25px; line-height: 64px; color: #2e42b2; }
.ng { font-weight: 700; }
.subtitle { font-size: 18px; font-weight: 600; line-height: 28px; color: #1c244f; text-align: center; align-self: stretch; }
.field-group { align-self: stretch; display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 16px; font-weight: 500; line-height: 24px; color: #2e42b2; }
.btn-submit { align-self: stretch; border-radius: 6px; background-color: #2d48c8; color: #f9fafb; border: none; padding: 13px 24px; font-size: 16px; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; letter-spacing: 0.2px; line-height: 24px; }
.btn-submit:hover:not(:disabled) { background-color: #2339a8; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
