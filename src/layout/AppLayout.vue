<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import HeaderMobile from '@/components/HeaderMobile.vue'

const drawerOpen = ref(false)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#F4F7FE] font-plus-jakarta">
    <!-- DESKTOP: Sidebar permanen (hidden di mobile) -->
    <div class="hidden md:flex md:flex-shrink-0">
      <Sidebar />
    </div>

    <!-- MOBILE: Backdrop gelap saat drawer terbuka -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 bg-black/40 z-40 md:hidden"
        @click="drawerOpen = false"
      />
    </Transition>

    <!-- MOBILE: Drawer slide dari kiri -->
    <Transition name="slide">
      <div
        v-if="drawerOpen"
        class="fixed top-0 left-0 h-full z-50 md:hidden"
        @click="drawerOpen = false"
      >
        <!-- @click stop di dalam supaya klik menu item tidak langsung close sebelum navigate -->
        <div @click.stop>
          <Sidebar />
        </div>
      </div>
    </Transition>

    <!-- MAIN CONTENT -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- HeaderMobile hanya muncul di bawah md -->
      <div class="md:hidden">
        <HeaderMobile
          :title="($route.meta.title as string) || 'SILOBUR'"
          @menuClick="drawerOpen = true"
        />
      </div>

      <!-- Konten halaman -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Backdrop fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Drawer slide dari kiri */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
