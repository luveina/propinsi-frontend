<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <div class="modal-icon">
          <!-- X Circle icon (SVG inline, no img needed) -->
          <svg v-if="type === 'error'" width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="27.5" cy="27.5" r="26" stroke="#D93E39" stroke-width="3"/>
            <path d="M18 18L37 37M37 18L18 37" stroke="#D93E39" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="type === 'success'" width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32.5" cy="32.5" r="30" stroke="#2E42B2" stroke-width="3"/>
            <path d="M18 33L28 43L47 24" stroke="#2E42B2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="type === 'info'" width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="27.5" cy="27.5" r="26" stroke="#2E42B2" stroke-width="3"/>
            <path d="M27.5 25V38" stroke="#2E42B2" stroke-width="3" stroke-linecap="round"/>
            <circle cx="27.5" cy="18" r="2" fill="#2E42B2"/>
          </svg>
        </div>

        <div class="modal-message" :class="type">{{ message }}</div>

        <div class="modal-actions">
          <button
            v-if="showCancel"
            class="btn btn-cancel"
            @click="$emit('close')"
          >
            <b>{{ cancelLabel }}</b>
          </button>
          <button
            class="btn"
            :class="type === 'success' ? 'btn-primary' : type === 'logout' ? 'btn-primary' : 'btn-danger'"
            @click="handleConfirm"
          >
            <b>{{ confirmLabel }}</b>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// provide default labels so modal buttons are never empty
const props = withDefaults(defineProps<{
  show: boolean
  type: 'error' | 'success' | 'info' | 'logout'
  message: string
  confirmLabel?: string
  cancelLabel?: string
  showCancel?: boolean
}>(), {
  confirmLabel: 'OK',
  cancelLabel: 'Batal',
  showCancel: false
})

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
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #4b5563;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  text-align: center;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-message {
  font-size: 20px;
  font-weight: 500;
  line-height: 24px;
  align-self: stretch;
}
.modal-message.error { color: #d93e39; }
.modal-message.success { color: #2e42b2; }
.modal-message.info { color: #4b5563; font-size: 18px; font-weight: 600; line-height: 28px; }
.modal-message.logout { color: #4b5563; font-size: 18px; font-weight: 600; line-height: 28px; }

.modal-actions {
  align-self: stretch;
  display: flex;
  gap: 10px;
  justify-content: center;
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

.btn-danger { background-color: #d93e39; color: #fff; }
.btn-primary { background-color: #2e42b2; color: #fff; }
.btn-cancel { background-color: #d2d5db; color: #394050; }

.btn:hover { opacity: 0.9; }
</style>
