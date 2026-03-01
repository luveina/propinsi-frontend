<script setup lang="ts">
import ManajemenAkunView from './views/ManajemenAkunView.vue';
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-[#F4F7FE]">
    <Sidebar />
    <main class="flex-1">
      <ManajemenAkunView />
    </main>
  </div>
</template>

<style>
body { margin: 0; background-color: #F4F7FE; }
</style>