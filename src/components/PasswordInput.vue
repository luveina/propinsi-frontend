<template>
  <div class="password-field">
    <input
      :type="show ? 'text' : 'password'"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      class="password-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button type="button" class="toggle-btn" @click="show = !show" tabindex="-1">
      <!-- Eye icon -->
      <svg v-if="!show" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#4B79E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="#4B79E6" stroke-width="2"/>
      </svg>
      <!-- Eye-off icon -->
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="#4B79E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  placeholder?: string
  autocomplete?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const show = ref(false)
</script>

<style scoped>
.password-field {
  width: 100%;
  border-radius: 6px;
  background-color: #dee8fb;
  border: 1px solid #2e42b2;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 10px;
  height: 50px;
}

.password-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 500;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1c244f;
  letter-spacing: 0.2px;
  line-height: 24px;
}

.password-input::placeholder {
  color: #4b79e6;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
