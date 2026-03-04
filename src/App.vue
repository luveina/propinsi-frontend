<!-- <script setup lang="ts"></script>

<template>
  <div class="bg-red-200">
    Hello, World!
  </div>
</template>

<style scoped></style> -->
<script setup lang="ts">
import ProfileView from './view/ProfileView.vue' // Sesuaikan folder tempat kamu simpan file profile tadi
</script>

<template>
  <ProfileView />
</template>

<style>
/* Pastikan tailwind sudah terimpor di main.ts atau di sini */
@import "tailwindcss"; 
</style>