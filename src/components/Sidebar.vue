<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import LogoutModal from '@/components/modals/LogoutModal.vue'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
const showLogoutModal = ref(false)

// emit 'close' dipakai AppLayout untuk nutup drawer di mobile setelah navigasi
const emit = defineEmits<{ (e: 'close'): void }>()

function handleLogout() {
  showLogoutModal.value = false
  authStore.logout()
}
</script>

<template>
  <aside class="w-64 h-screen bg-[#314EAE] flex flex-col font-plus-jakarta text-white shadow-xl sticky top-0">

    <div class="pt-8 pb-2 px-4 flex items-center justify-center gap-3">
      <img src="@/assets/siloburputih.png" alt="Logo" class="h-17 w-auto object-contain" />
    </div>

    <nav class="flex-1 px-4 pt-2 pb-6 space-y-2 mt-4">

      <!-- ADMIN: Manajemen Akun -->
      <RouterLink
        v-if="authStore.user?.role === 'ADMIN'"
        to="/manajemen-akun"
        class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A]"
        active-class="bg-[#1E3A8A] shadow-inner"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Manajemen Akun
      </RouterLink>

      <!-- KOORDINATOR_LOMBA: Manajemen Lomba -->
      <RouterLink
        v-if="authStore.user?.role === 'KOORDINATOR_LOMBA'"
        to="/katalog-lomba"
        class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A]"
        active-class="bg-[#1E3A8A] shadow-inner"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Manajemen Lomba
      </RouterLink>

      <!-- Semua role lain: Katalog Lomba -->
      <RouterLink
        v-else
        to="/katalog-lomba"
        class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A]"
        active-class="bg-[#1E3A8A] shadow-inner"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Katalog Lomba
      </RouterLink>

      <!-- PESERTA: Tiket Saya (PBI-20) -->
      <RouterLink
        v-if="authStore.user?.role === 'PESERTA'"
        to="/tiket-saya"
        class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A]"
        active-class="bg-[#1E3A8A] shadow-inner"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        Tiket Saya
      </RouterLink>

      <!-- Semua role: Profil Saya -->
      <RouterLink
        to="/profile"
        class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors hover:bg-[#1E3A8A]"
        active-class="bg-[#1E3A8A] shadow-inner"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Profil Saya
      </RouterLink>

    </nav>

    <div class="p-5 mb-2">
      <button
        @click="showLogoutModal = true"
        class="w-full bg-white text-[#314EAE] font-bold py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors flex justify-center items-center shadow-md cursor-pointer"
      >
        Log Out
      </button>
    </div>
  </aside>

  <LogoutModal
    :show="showLogoutModal"
    :loading="authStore.loading"
    @close="showLogoutModal = false"
    @confirm="handleLogout"
  />
</template>

<style scoped>
a {
  text-decoration: none;
}
</style>
