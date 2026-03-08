<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/80 backdrop-sm p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-8 text-center">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 border-4 border-blue-700 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        <p class="text-blue-900 text-lg leading-snug mb-8">
          Password akun berhasil direset ke default
        </p>

        <button 
          @click="$emit('close')" 
          class="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-md cursor-pointer"
        >
          Kembali
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>();
defineEmits(['close']);
</script>