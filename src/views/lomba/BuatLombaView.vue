<template>
  <div class="flex min-h-screen bg-[#F4F7FE] font-plus-jakarta">
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <Header />

      <main class="px-10 py-8">
        <h1 class="text-2xl font-bold text-[#2E42B2] mb-6">Buat Lomba Baru</h1>

        <div class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <FormLomba @success="handleSuccess" @cancel="handleCancel" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import FormLomba from '@/components/lomba/FormLomba.vue'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

const router = useRouter()

const handleSuccess = () => {
  router.push('/katalog-lomba')
}

const handleCancel = () => {
  router.push('/katalog-lomba')
}
</script>
