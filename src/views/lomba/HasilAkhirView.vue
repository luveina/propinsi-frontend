<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLombaDetail, getLombaResult } from '@/services/lomba.service'
import type { LombaDetailResponse, FinalResultGantanganResponse } from '@/interfaces/lomba.interface'

const route = useRoute()
const router = useRouter()

const lombaId = computed(() => (route.query.lombaId as string) || (route.params.lombaId as string) || (route.params.id as string))

const loading = ref(true)
const results = ref<FinalResultGantanganResponse[]>([])
const jumlahJuara = ref(0)
const maxRowsPerPage = 12
const currentPage = ref(1)

const fetchResult = async () => {
  if (!lombaId.value) return
  loading.value = true
  try {
    const detailData = await getLombaDetail(lombaId.value)
    if (detailData && detailData.hadiah) {
        jumlahJuara.value = detailData.hadiah.length
    }
    const resultData = await getLombaResult(lombaId.value)
    // Jika resultData.results exists
    if (resultData && resultData.results) {
        results.value = resultData.results
    }
  } catch (error) {
    console.error('Gagal mengambil data hasil akhir lomba:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchResult()
})

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * maxRowsPerPage
  return results.value.slice(start, start + maxRowsPerPage)
})

const setPage = (page: number) => {
  currentPage.value = page
}

const isWinner = (absoluteIndex: number) => {
  return absoluteIndex < jumlahJuara.value
}
</script>

<template>
  <div class="flex flex-col h-screen bg-[#F4F7FE] font-plus-jakarta overflow-hidden">
    <!-- Header -->
    <header class="bg-[#3041b3] text-white px-5 py-4 flex items-center sticky top-0 z-50 shadow-md">
      <!-- Menggunakan icon burger menu sama dengan BabakKoncer atau HasilAjuan -->
      <button @click="router.push('/katalog-lomba')" class="p-2 -ml-2 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <h1 class="text-xl font-bold flex-1 text-center">Hasil Lomba</h1>
      <div class="bg-gray-100 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-400">
          <path d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" />
        </svg>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4 flex flex-col items-center">
      <div class="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <!-- Breadcrumb / Tab Back -->
        <button @click="router.back()" class="flex items-center text-[#2E42B2] font-semibold mb-4 text-sm hover:underline cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Detail Lomba
        </button>

        <div v-if="loading" class="text-center py-10 text-gray-500 font-semibold">
          Memuat Hasil...
        </div>

        <div v-else>
          <div class="overflow-x-auto rounded-lg border border-[#3041B3]">
            <table class="w-full text-center text-[10px] md:text-sm">
              <thead class="bg-[#3041B3] text-white">
                <tr>
                  <th class="py-3 px-2 font-semibold">No</th>
                  <th class="py-3 px-2 font-semibold">Gantangan</th>
                  <th class="py-3 px-2 font-semibold">Ajuan</th>
                  <th class="py-3 px-2 font-semibold">Koncer</th>
                  <th class="py-3 px-2 font-semibold leading-tight">Total<br/>Poin</th>
                </tr>
              </thead>
              <tbody>
                <!-- Tabel Body -->
                <tr 
                  v-for="(item, index) in paginatedResults" 
                  :key="item.nomorGantangan"
                  class="border-b border-gray-100"
                  :class="{'bg-[#F0F2FF] font-medium text-[#2E42B2]': isWinner((currentPage - 1) * maxRowsPerPage + index)}"
                >
                  <td class="py-3 px-2 text-gray-700" :class="{'text-[#2E42B2]': isWinner((currentPage - 1) * maxRowsPerPage + index)}">
                    {{ (currentPage - 1) * maxRowsPerPage + index + 1 }}
                  </td>
                  <td class="py-3 px-2">
                    <span class="inline-block bg-[#A8B7FF] text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                      {{ item.nomorGantangan }}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-gray-600">
                    {{ item.totalAjuan !== null ? item.totalAjuan : '-' }}
                  </td>
                  <td class="py-3 px-2 text-gray-600">
                    {{ item.hasilKoncer ? item.hasilKoncer : '-' }}
                  </td>
                  <td class="py-3 px-2 text-gray-600">
                    {{ item.totalPoin !== null ? item.totalPoin : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="flex justify-center items-center mt-6 gap-2">
            <button 
              @click="setPage(1)"
              class="w-8 h-8 rounded border font-semibold transition-colors duration-200 cursor-pointer flex items-center justify-center"
              :class="currentPage === 1 ? 'bg-[#3041B3] text-white border-[#3041B3] scale-110 shadow-sm' : 'bg-white text-[#3041B3] border-gray-300 hover:bg-gray-50'"
            >
              1
            </button>
            <button 
              @click="setPage(2)"
              class="w-8 h-8 rounded border font-semibold transition-colors duration-200 cursor-pointer flex items-center justify-center"
              :class="currentPage === 2 ? 'bg-[#3041B3] text-white border-[#3041B3] scale-110 shadow-sm' : 'bg-white text-[#3041B3] border-gray-300 hover:bg-gray-50'"
            >
              2
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles jika ada tambahan khusus */
</style>
