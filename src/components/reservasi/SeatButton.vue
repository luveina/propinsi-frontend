<template>
  <button 
    :disabled="status !== 'AVAILABLE'"
    class="w-14 h-14 rounded-xl flex items-center justify-center text-[16px] font-semibold transition-all border-4 cursor-pointer text-white font-plus-jakarta"
    :class="[
      // Jika status AVAILABLE (dari BE), pakai warna cerah
      status === 'AVAILABLE' 
        ? 'bg-[#6D9BED] border-transparent' 
        : 'bg-[#C4D8F9] text-white/70 border-transparent cursor-not-allowed',
      
      // Jika sedang di-klik user, beri border biru tua
      isSelected ? 'border-[#2E42B2] scale-110 shadow-lg' : ''
    ]"
  >
    {{ nomor }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  nomor: number;
  status: string; // Akan menerima 'AVAILABLE', 'BOOKED', atau 'PAID'
  isSelected: boolean;
}>();
</script>