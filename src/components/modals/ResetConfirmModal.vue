<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/80 backdrop-sm p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center relative">
        <button
          @click="$emit('close')"
          class="absolute right-4 top-4 text-blue-900 text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <h2 class="text-2xl font-bold text-blue-800 mb-4 mt-2">Reset Password</h2>
        <p class="text-gray-700 font-medium mb-8">Apakah Anda yakin untuk mereset password ini?</p>

        <button
          @click="$emit('confirm')"
          class="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-md cursor-pointer"
        >
          Ya, Reset Password
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>()
defineEmits(['close', 'confirm'])
</script>
