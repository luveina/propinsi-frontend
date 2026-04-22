<template>
  <div class="flex min-h-screen bg-[#F4F7FE] font-plus-jakarta">
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <Header />

      <main class="px-10 py-8">
        <h1 class="text-2xl font-bold text-[#2E42B2] mb-6">Edit Lomba</h1>

        <div v-if="isLoading" class="flex justify-center items-center py-24">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"></div>
        </div>

        <div v-else-if="errorLoad" class="bg-red-100 text-red-700 border border-red-300 rounded-lg p-4 text-sm">
          {{ errorLoad }}
        </div>

        <div v-else class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <FormLomba
            :is-edit="true"
            :edit-data="lombaData"
            @success="handleSuccess"
            @cancel="router.push('/katalog-lomba')"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import FormLomba from '@/components/lomba/FormLomba.vue';
import { getLombaDetail } from '@/services/lomba.service';

const router = useRouter();
const route = useRoute();
const lombaData = ref<any>(null);
const isLoading = ref(true);
const errorLoad = ref('');

onMounted(async () => {
  try {
    const id = route.params.id as string;
    lombaData.value = await getLombaDetail(id);
  } catch (error: any) {
    errorLoad.value = error.response?.data?.message || 'Gagal memuat data lomba.';
  } finally {
    isLoading.value = false;
  }
});

const handleSuccess = () => {
  router.push('/katalog-lomba');
};
</script>
