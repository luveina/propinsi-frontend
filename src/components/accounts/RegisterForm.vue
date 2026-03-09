<template>
  <div class="register-form">
    <div class="brand">
      <img src="@/assets/silobur-biru.png" alt="SILOBUR-NG Logo" class="brand-logo" />
    </div>

    <div class="subtitle">
      Daftar sebagai peserta <b class="silobur">SILOBUR-</b><i class="silobur ng">NG</i>
    </div>

    <!-- Username -->
    <div class="field-group">
      <label class="field-label">Username</label>
      <input
        v-model="form.username"
        class="text-input"
        placeholder="Username"
        type="text"
        autocomplete="username"
        @blur="validateField('username')"
      />
      <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
    </div>

    <!-- Nama Lengkap -->
    <div class="field-group">
      <label class="field-label">Nama Lengkap</label>
      <input
        v-model="form.fullName"
        class="text-input"
        placeholder="Nama Lengkap"
        type="text"
        autocomplete="name"
        @blur="validateField('fullName')"
      />
      <span v-if="errors.fullName" class="error-msg">{{ errors.fullName }}</span>
    </div>

    <!-- Nomor WhatsApp -->
    <div class="field-group">
      <label class="field-label">Nomor WhatsApp</label>
      <input
        v-model="form.phoneNumber"
        class="text-input"
        placeholder="Nomor WA (contoh: 08123456789)"
        type="tel"
        autocomplete="tel"
        @blur="validateField('phoneNumber')"
      />
      <span v-if="errors.phoneNumber" class="error-msg">{{ errors.phoneNumber }}</span>
    </div>

    <!-- Password -->
    <div class="field-group">
      <label class="field-label">Password</label>
      <PasswordInput
        v-model="form.password"
        placeholder="Password"
        autocomplete="new-password"
        @blur="validateField('password')"
      />
      <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
    </div>

    <!-- Konfirmasi Password -->
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

    <button class="btn-submit" @click="handleSubmit" :disabled="loading || !isFormValid">
      <b>{{ loading ? 'Loading...' : 'Daftar' }}</b>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PasswordInput from '@/components/PasswordInput.vue'

defineProps<{ loading?: boolean }>()

const emit = defineEmits<{
  submit: [form: {
    fullName: string
    username: string
    phoneNumber: string
    password: string
    confirmPassword: string
  }]
}>()

const form = ref({
  username: '',
  fullName: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  username: '',
  fullName: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
})

function validateField(field: keyof typeof form.value) {
  switch (field) {
    case 'username':
      if (!form.value.username)
        errors.value.username = 'Username wajib diisi'
      else if (form.value.username.length < 4)
        errors.value.username = 'Username minimal 4 karakter'
      else
        errors.value.username = ''
      break
    case 'fullName':
      errors.value.fullName = form.value.fullName ? '' : 'Nama Lengkap wajib diisi'
      break
    case 'phoneNumber':
      if (!form.value.phoneNumber)
        errors.value.phoneNumber = 'Nomor WhatsApp wajib diisi'
      else if (!/^08\d{8,11}$/.test(form.value.phoneNumber))
        errors.value.phoneNumber = 'Format nomor tidak valid (contoh: 08123456789)'
      else
        errors.value.phoneNumber = ''
      break
    case 'password':
      if (!form.value.password)
        errors.value.password = 'Password wajib diisi'
      else if (form.value.password.length < 6)
        errors.value.password = 'Password minimal 6 karakter'
      else
        errors.value.password = ''
      if (form.value.confirmPassword) validateField('confirmPassword')
      break
    case 'confirmPassword':
      if (!form.value.confirmPassword)
        errors.value.confirmPassword = 'Konfirmasi Password wajib diisi'
      else if (form.value.confirmPassword !== form.value.password)
        errors.value.confirmPassword = 'Password dan Konfirmasi Password tidak cocok'
      else
        errors.value.confirmPassword = ''
      break
  }
}

function validateAll() {
  validateField('username')
  validateField('fullName')
  validateField('phoneNumber')
  validateField('password')
  validateField('confirmPassword')
}

const isFormValid = computed(() => {
  return (
    form.value.username.length >= 4 &&
    form.value.fullName !== '' &&
    /^08\d{8,11}$/.test(form.value.phoneNumber) &&
    form.value.password.length >= 6 &&
    form.value.confirmPassword === form.value.password
  )
})

function handleSubmit() {
  validateAll()
  if (!isFormValid.value) return
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.brand { text-align: center; }

.brand-logo {
  height: 100px;
  width: auto;
  object-fit: contain;
}

.ng { font-weight: 700; }
.silobur { color: #2e42b2; }

.subtitle {
  font-size: 16px;
  line-height: 24px;
  color: #1c244f;
  text-align: center;
}

.field-group {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.error-msg {
  font-size: 12px;
  color: #d93e39;
  font-weight: 500;
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
  margin-top: 4px;
}

.btn-submit:hover:not(:disabled) { background-color: #2339a8; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
