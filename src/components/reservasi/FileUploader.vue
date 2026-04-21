<template>
  <div class="space-y-2">
    <label
      class="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition"
      :class="[
        disabled ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-[#AFC4F9] bg-[#F7FAFF] hover:border-[#2E42B2] hover:bg-white',
        error ? 'border-[#D93E39]' : ''
      ]"
      for="payment-proof-input"
    >
      <div class="text-center px-4">
        <p class="text-sm font-bold text-[#2E42B2]">
          {{ fileName || 'Klik untuk memilih file bukti pembayaran' }}
        </p>
        <p class="mt-1 text-xs text-slate-500">Format: JPG, PNG, PDF. Maksimum 2MB.</p>
      </div>
    </label>

    <input
      id="payment-proof-input"
      type="file"
      class="hidden"
      :accept="accept"
      :disabled="disabled"
      @change="handleFileChange"
    />

    <p v-if="error" class="text-sm font-medium text-[#D93E39]">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: File | null
  error?: string
  disabled?: boolean
  accept?: string
}>(), {
  disabled: false,
  accept: '.jpg,.jpeg,.png,.pdf',
});

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
}>();

const fileName = computed(() => props.modelValue?.name ?? '');

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.files?.[0] ?? null);
}
</script>
