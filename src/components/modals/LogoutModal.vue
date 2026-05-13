<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <div class="modal-header">
          <div class="header-spacer" />
          <b class="modal-title">Logout</b>
          <button class="close-btn" @click="$emit('close')">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#4B5563"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <p class="modal-body">Apakah Anda yakin untuk<br />Logout dari SILOBUR-NG?</p>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="$emit('close')">
            <b>Kembali</b>
          </button>
          <button class="btn btn-confirm" @click="handleConfirm" :disabled="loading">
            <b>{{ loading ? 'Loading...' : 'Ya, Logout' }}</b>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

function handleConfirm() {
  emit('confirm')
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border: 1px solid #4b5563;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  text-align: center;
}

.modal-header {
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.header-spacer {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.modal-title {
  flex: 1;
  font-size: 28px;
  line-height: 34px;
  color: #2e42b2;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.modal-body {
  font-size: 18px;
  line-height: 28px;
  font-weight: 600;
  color: #4b5563;
  max-width: 360px;
  margin: 0;
}

.modal-actions {
  align-self: stretch;
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.btn {
  flex: 1;
  border: none;
  border-radius: 6px;
  padding: 13px 24px;
  font-size: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  letter-spacing: 0.2px;
  line-height: 24px;
}

.btn-cancel {
  background-color: #d2d5db;
  color: #394050;
}
.btn-confirm {
  background-color: #2e42b2;
  color: #fff;
}
.btn:hover:not(:disabled) {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
