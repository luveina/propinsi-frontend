<template>
  <!-- Desktop -->
  <div v-if="isDesktop" class="page-desktop">
    <div class="left-panel">
      <div class="left-text">
        <b>Lomba burung menjadi lebih efisien<br />dengan SILOBUR-<i class="ng">NG!</i></b>
        <br /><br />
        <i class="ng">Penilaian jujur, transparan,<br />terbuka dan cepat</i>
      </div>
    </div>
    <div class="right-panel">
      <div class="form">
        <div class="brand">
          <img src="@/assets/silobur-biru.png" alt="SILOBUR-NG Logo" class="brand-logo" />
          <!-- <span class="brand-text"><b>SILOBUR-</b><i class="ng">NG</i></span> -->
        </div>
        <div class="subtitle">
          Harap login untuk menggunakan SILOBUR-<i class="ng">NG</i>
        </div>

        <div class="field-group">
          <label class="field-label">Username</label>
          <input v-model="form.username" class="text-input" placeholder="Username" type="text" autocomplete="username" />
        </div>

        <div class="field-group">
          <label class="field-label">Password</label>
          <PasswordInput v-model="form.password" placeholder="Password" autocomplete="current-password" />
          <button type="button" class="forgot-link" style="align-self: flex-end;" @click="showForgotModal = true">Lupa password?</button>
        </div>

        <button class="btn-submit" @click="handleLogin" :disabled="authStore.loading">
          <b>{{ authStore.loading ? 'Loading...' : 'Login' }}</b>
        </button>

        <div class="register-link">
          Belum punya akun?
          <RouterLink to="/register"><b class="underline">Daftar Sebagai Peserta</b></RouterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile -->
  <div v-else class="page-mobile">
    <div class="form">
      <div class="brand">
        <img src="@/assets/silobur-biru.png" alt="SILOBUR-NG Logo" class="brand-logo" />
        <span class="brand-text"><b>SILOBUR-</b><i class="ng">NG</i></span>
      </div>
      <div class="subtitle-mobile">
        Harap login untuk menggunakan <b>SILOBUR-</b><i class="ng">NG</i>
      </div>

      <div class="field-group">
        <label class="field-label">Username</label>
        <input v-model="form.username" class="text-input" placeholder="Username" type="text" autocomplete="username" />
      </div>

      <div class="field-group">
        <label class="field-label">Password</label>
        <PasswordInput v-model="form.password" placeholder="Password" autocomplete="current-password" />
        <button type="button" class="forgot-link" @click="showForgotModal = true">Lupa password?</button>
      </div>

      <button class="btn-submit" @click="handleLogin" :disabled="authStore.loading">
        <b>{{ authStore.loading ? 'Loading...' : 'Login' }}</b>
      </button>

      <div class="register-link-mobile">
        Belum punya akun?
        <RouterLink to="/register"><b class="underline">Daftar Sebagai Peserta</b></RouterLink>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <ErrorModal
    :show="showErrorModal"
    type="error"
    :message="errorMessage"
    confirm-label="Kembali ke Login"
    @confirm="showErrorModal = false"
    @close="showErrorModal = false"
  />
  <ForgotPasswordModal
    :show="showForgotModal"
    @close="showForgotModal = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useBreakpoint } from '@/composables/useBreakpoint'
import PasswordInput from '@/components/PasswordInput.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal.vue'

const authStore = useAuthStore()
const { isDesktop } = useBreakpoint()

const form = ref({ username: '', password: '' })
const showErrorModal = ref(false)
const showForgotModal = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  authStore.clearError()
  await authStore.login(form.value)
  if (authStore.error) {
    errorMessage.value = authStore.error
    showErrorModal.value = true
  }
}
</script>

<style scoped>
.page-desktop {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: #c4d8f9;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.left-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 80px;
}

.left-text {
  font-size: 32px;
  line-height: 38px;
  color: #2e42b2;
  text-align: center;
}

.right-panel {
  width: 720px;
  flex-shrink: 0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
  box-sizing: border-box;
}

.page-mobile {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 40px 34px;
  box-sizing: border-box;
}

.form {
  width: 100%;
  max-width: 566px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.brand-logo {
  height: 100px;  /* ganti angka ini */
  width: auto;
  object-fit: contain;
}

.left-logo {
  height: 80px;
  width: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto 16px;
}

.brand-text {
  font-family: 'Afacad', sans-serif;
  font-size: 48px;
  letter-spacing: -0.25px;
  line-height: 64px;
  color: #2e42b2;
}

.ng { font-weight: 700; }

.subtitle {
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  color: #1c244f;
  text-align: center;
}

.subtitle-mobile {
  font-size: 14px;
  line-height: 20px;
  color: #1c244f;
  text-align: center;
}

.field-group {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #2e42b2;
}

.text-input {
  width: 100%;
  border-radius: 6px;
  background-color: #dee8fb;
  border: 1px solid #2e42b2;
  padding: 13px 24px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 500;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1c244f;
  outline: none;
  letter-spacing: 0.2px;
}

.text-input::placeholder { color: #4b79e6; }
.text-input:focus { border-color: #1c244f; }

.forgot-link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  color: #6b7280;
  text-align: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 0;
  align-self: center;
}

.btn-submit {
  align-self: stretch;
  border-radius: 6px;
  background-color: #2d48c8;
  color: #f9fafb;
  border: none;
  padding: 13px 24px;
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  letter-spacing: 0.2px;
  line-height: 24px;
}

.btn-submit:hover:not(:disabled) { background-color: #2339a8; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.register-link {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #1c244f;
  text-align: center;
}

.register-link-mobile {
  font-size: 12px;
  line-height: 16px;
  color: #1c244f;
  text-align: center;
}

.underline { text-decoration: underline; color: #2e42b2; }
</style>
