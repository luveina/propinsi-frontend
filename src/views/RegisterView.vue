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
        <RegisterForm :loading="authStore.loading" @submit="handleRegister" />
        <div class="login-link">
          Sudah punya akun?
          <RouterLink to="/login"><b class="underline">Login</b></RouterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile -->
  <div v-else class="page-mobile">
    <div class="form">
      <RegisterForm :loading="authStore.loading" @submit="handleRegister" />
      <div class="login-link-mobile">
        Sudah punya akun?
        <RouterLink to="/login"><b class="underline">Login</b></RouterLink>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <ErrorModal
    :show="showErrorModal"
    type="error"
    :message="errorMessage"
    confirm-label="Kembali ke Register"
    @confirm="showErrorModal = false"
    @close="showErrorModal = false"
  />
  <ErrorModal
    :show="showSuccessModal"
    type="success"
    message="Akun berhasil dibuat. Harap login!"
    confirm-label="Kembali ke Login"
    @confirm="goToLogin"
    @close="goToLogin"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useBreakpoint } from '@/composables/useBreakpoint'
import RegisterForm from '@/components/accounts/RegisterForm.vue'
import ErrorModal from '@/components/modals/ErrorModal.vue'

const authStore = useAuthStore()
const router = useRouter()
const { isDesktop } = useBreakpoint()

const showErrorModal = ref(false)
const showSuccessModal = ref(false)
const errorMessage = ref('')

async function handleRegister(formData: {
  fullName: string
  username: string
  phoneNumber: string
  password: string
  confirmPassword: string
}) {
  // Validasi format nomor telepon
  const phoneRegex = /^08\d{8,11}$/
  if (!phoneRegex.test(formData.phoneNumber)) {
    errorMessage.value = 'Nomor telepon harus dimulai dengan 08 dan terdiri dari 10-13 digit'
    showErrorModal.value = true
    return
  }

  authStore.clearError()
  const success = await authStore.register(formData)
  if (authStore.error) {
    errorMessage.value = authStore.error
    showErrorModal.value = true
  } else if (success) {
    showSuccessModal.value = true
  }
}

function goToLogin() {
  showSuccessModal.value = false
  router.push('/login')
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

.ng {
  font-weight: 700;
}

.login-link {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #1c244f;
  text-align: center;
}

.login-link-mobile {
  font-size: 12px;
  line-height: 16px;
  color: #1c244f;
  text-align: center;
}

.underline {
  text-decoration: underline;
  color: #2e42b2;
}
</style>
