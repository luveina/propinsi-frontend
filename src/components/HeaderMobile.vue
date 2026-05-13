<template>
  <header
    class="bg-[#2E42B2] py-5 px-6 flex items-center justify-between relative shadow-md shrink-0 z-20 text-white"
  >
    <button
      @click="$emit('menuClick')"
      class="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center cursor-pointer z-30 transition hover:bg-white/20"
    >
      <Icon icon="mdi:menu" class="w-7 h-7" />
    </button>

    <h1 class="absolute left-1/2 -translate-x-1/2 text-[20px] font-bold whitespace-nowrap z-10">
      {{ title }}
    </h1>

    <div
      @click="router.push('/profile')"
      class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm z-30 cursor-pointer active:scale-90 transition-transform"
    >
      <Icon icon="ph:user-fill" class="w-7 h-7 text-gray-300" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

defineProps({
  title: {
    type: String,
    default: 'Detail',
  },
})

defineEmits(['menuClick'])

const router = useRouter()
</script>
