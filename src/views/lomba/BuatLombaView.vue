<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 p-8">
      <FormLomba @success="handleSuccess" @cancel="handleCancel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import FormLomba from '@/components/lomba/FormLomba.vue'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()

const handleSuccess = () => {
  // Arahkan ke katalog kalau sukses
  router.push('/katalog-lomba')
}

const handleCancel = () => {
  router.back()
}
</script>
