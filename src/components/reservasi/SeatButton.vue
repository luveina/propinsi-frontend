<template>
  <button 
    :disabled="status !== 'AVAILABLE'"
    @click="$emit('click')"
    class="w-14 h-14 rounded-xl flex items-center justify-center text-[16px] font-semibold transition-all border-4 cursor-pointer text-white font-plus-jakarta"
    :class="[
      status !== 'AVAILABLE' 
        ? 'bg-[#C4D8F9] text-white/70 border-transparent cursor-not-allowed' 
        : '',
      status === 'AVAILABLE' && !isSelected 
        ? 'bg-[#6D9BED] border-transparent' 
        : '',
      isSelected 
        ? 'bg-[#2E42B2] border-[#2E42B2] scale-110 shadow-lg z-10' 
        : ''
    ]"
  >
    {{ nomor }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  nomor: number;
  status: string; 
  isSelected: boolean;
}>();

defineEmits(['click']);
</script>