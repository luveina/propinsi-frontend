<template>
  <header class="w-full flex justify-end items-center py-4 px-8 bg-[#F4F7FE]">
    <RouterLink to="/profile" class="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
        <div class="text-right font-plus-jakarta">
          <h4 class="text-[#1E3A8A] font-bold text-sm leading-tight">{{ authStore.user?.fullName }}</h4>
          <p class="text-[#718EBF] text-xs font-medium uppercase">{{ authStore.user?.role }}</p>
        </div>
    </RouterLink>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth/auth.store';
const authStore = useAuthStore();
</script>