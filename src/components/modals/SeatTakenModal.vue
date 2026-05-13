<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center font-plus-jakarta border border-gray-100"
      >
        <div class="mb-6 flex justify-center">
          <!-- Icon Peringatan -->
          <div class="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <span class="text-4xl text-red-500 font-bold">!</span>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-[#2E42B2] mb-3">Nomor Sudah Dipesan</h2>
        <p class="text-gray-600 mb-8 leading-relaxed">
          Silakan pilih nomor gantangan lain yang masih tersedia.
        </p>

        <button
          @click="$emit('close')"
          class="w-full bg-[#2E42B2] text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          Pilih Nomor Lain
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>()
defineEmits(['close'])
</script>
