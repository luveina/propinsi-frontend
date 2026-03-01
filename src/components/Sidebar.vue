<script setup lang="ts">
// Komponen Sidebar tidak butuh banyak script untuk saat ini
</script>

<template>
  <aside class="w-64 h-screen bg-[#314EAE] flex flex-col font-plus-jakarta text-white shadow-xl z-40">
    
    <div class="pt-8 pb-2 px-4 flex items-center justify-center gap-3">
      <img src="@/assets/siloburputih.png" alt="Logo" class="h-17 w-auto object-contain" />
    </div>

    <nav class="flex-1 px-4 pt-2 pb-6 space-y-2">
      <a href="#" class="flex items-center gap-3 bg-[#1E3A8A] px-4 py-3.5 rounded-lg text-sm font-semibold transition-colors shadow-inner">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        Manajemen Akun
      </a>
      
      </nav>

    <div class="p-5 mb-2">
      <button class="w-full bg-white text-[#314EAE] font-bold py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors flex justify-center items-center shadow-md">
        Log Out
      </button>
    </div>
  </aside>
</template>