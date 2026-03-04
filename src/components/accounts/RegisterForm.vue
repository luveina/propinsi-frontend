<template>
  <div class="register-form">
    <div class="brand">
      <img src="@/assets/silobur-biru.png" alt="SILOBUR-NG Logo" class="brand-logo" />
     
    </div>

    <div class="subtitle">
      Daftar sebagai peserta <b class="silobur">SILOBUR-</b><i class="silobur">NG</i>
    </div>

    <div class="field-group">
      <label class="field-label">Username</label>
      <input v-model="form.username" class="text-input" placeholder="Username" type="text" autocomplete="username" />
    </div>

    <div class="field-group">
      <label class="field-label">Nama Lengkap</label>
      <input v-model="form.fullName" class="text-input" placeholder="Nama Lengkap" type="text" autocomplete="name" />
    </div>

    <div class="field-group">
      <label class="field-label">Nomor WhatsApp</label>
      <input v-model="form.phoneNumber" class="text-input" placeholder="Nomor WA" type="tel" autocomplete="tel" />
    </div>

    <div class="field-group">
      <label class="field-label">Password</label>
      <PasswordInput v-model="form.password" placeholder="Password" autocomplete="new-password" />
    </div>

    <div class="field-group">
      <label class="field-label">Konfirmasi Password</label>
      <PasswordInput v-model="form.confirmPassword" placeholder="Konfirmasi Password" autocomplete="new-password" />
    </div>

    <button class="btn-submit" @click="$emit('submit', form)" :disabled="loading">
      <b>{{ loading ? 'Loading...' : 'Daftar' }}</b>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PasswordInput from '@/components/PasswordInput.vue'

defineProps<{ loading?: boolean }>()
defineEmits<{
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
</script>

<style scoped>
.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.brand-logo {
  height: 100px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-family: 'Afacad', sans-serif;
  font-size: 48px;
  letter-spacing: -0.25px;
  line-height: 64px;
  color: #2e42b2;
}

.ng { font-weight: 700; }
.silobur { font-weight: 700; }

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
</style>
