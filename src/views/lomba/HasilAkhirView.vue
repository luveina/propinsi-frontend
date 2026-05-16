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

const namaLomba = ref('')

const fetchResult = async () => {
  if (!lombaId.value) return
  loading.value = true
  try {
    const detailData = await getLombaDetail(lombaId.value)
    if (detailData && detailData.hadiah) {
        jumlahJuara.value = detailData.hadiah.length
    }
    if (detailData && detailData.namaLomba) {
        namaLomba.value = detailData.namaLomba
    }
    const resultData = await getLombaResult(lombaId.value)
    if (resultData) {
        if (Array.isArray(resultData)) {
            results.value = resultData
        } else if ((resultData as any).results) {
            results.value = (resultData as any).results
        }
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

const getAbsoluteIndex = (index: number) => {
  return (currentPage.value - 1) * maxRowsPerPage + index
}

const isWinner = (absoluteIndex: number) => {
  return absoluteIndex < jumlahJuara.value
}

const getWinnerRank = (absoluteIndex: number) => {
  return isWinner(absoluteIndex) ? absoluteIndex + 1 : null
}

const getWinnerRowClass = (absoluteIndex: number) => {
  if (isWinner(absoluteIndex)) {
    return 'bg-[#DEE8FB] text-[#1E2A78] shadow-[inset_5px_0_0_#3041B3]'
  }

  return 'bg-white'
}

const getWinnerBadgeClass = (absoluteIndex: number) => {
  if (isWinner(absoluteIndex)) {
    return 'bg-[#3041B3] text-white border-[#1E2A78]'
  }

  return 'bg-[#DEE8FB] text-[#3041b3] border-[#3041b3]/40'
}

const getGantanganBadgeClass = (absoluteIndex: number) => {
  if (isWinner(absoluteIndex)) {
    return 'bg-[#3041B3] text-white border-[#1E2A78] shadow-sm'
  }

  return 'bg-[#9CBFF4] text-[#3041b3] border-[#3041b3]'
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
      <!-- Nav Kembali -->
      <div class="w-full max-w-md mb-3 shrink-0">
        <button @click="router.push('/katalog-lomba/' + lombaId)" class="text-[#3041b3] font-bold flex items-center gap-2 text-sm cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>Detail Lomba</span>
        </button>
      </div>

      <div v-if="namaLomba" class="w-full max-w-md mb-3 shrink-0">
        <p class="text-center font-bold text-[#3041b3] uppercase text-sm tracking-wider">{{ namaLomba }}</p>
      </div>

      <div v-if="loading" class="mt-10 text-center text-gray-500 font-semibold">
        Memuat Hasil...
      </div>

      <div v-else class="w-full max-w-md">
        <div class="overflow-x-auto rounded-2xl border border-[#3041b3]/40 shadow-sm overflow-hidden mb-6">
          <table class="w-full text-center text-[10px] md:text-sm border-collapse table-fixed">
            <thead class="bg-[#3041b3] text-white text-[11px] uppercase font-bold tracking-widest">
              <tr>
                <th class="py-4 w-16">No</th>
                <th class="py-4">Gantangan</th>
                <th class="py-4">Ajuan</th>
                <th class="py-4">Koncer</th>
                <th class="py-4">Total Poin</th>
              </tr>
            </thead>
            <tbody class="text-blue-900">
              <tr
                v-for="(item, index) in paginatedResults"
                :key="item.nomorGantangan"
                class="border-b border-[#3041b3]/10 transition-all duration-500"
                :class="getWinnerRowClass(getAbsoluteIndex(index))"
              >
                <td class="py-4 px-1">
                  <div class="flex flex-col items-center gap-1">
                    <span
                      class="flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-xs font-black"
                      :class="getWinnerBadgeClass(getAbsoluteIndex(index))"
                    >
                      {{ getAbsoluteIndex(index) + 1 }}
                    </span>
                    <span
                      v-if="getWinnerRank(getAbsoluteIndex(index))"
                      class="rounded border border-[#3041B3]/30 bg-white/80 px-1.5 py-0.5 text-[9px] font-black uppercase leading-none text-[#3041B3]"
                    >
                      Juara {{ getWinnerRank(getAbsoluteIndex(index)) }}
                    </span>
                  </div>
                </td>
                <td class="py-4">
                  <div class="flex justify-center">
                    <span
                      class="px-4 py-0.5 rounded-full border font-black text-sm min-w-[44px]"
                      :class="getGantanganBadgeClass(getAbsoluteIndex(index))"
                    >
                      {{ item.nomorGantangan }}
                    </span>
                  </div>
                </td>
                <td class="py-4 font-semibold">{{ item.totalAjuan !== null ? item.totalAjuan : '-' }}</td>
                <td class="py-4 font-semibold">{{ item.hasilKoncer ? item.hasilKoncer : '-' }}</td>
                <td
                  class="py-4 font-black"
                  :class="isWinner(getAbsoluteIndex(index)) ? 'text-[#1E2A78]' : 'text-[#3041b3]'"
                >
                  {{ item.totalPoin !== null ? item.totalPoin : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex justify-center items-center mb-6 gap-2">
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
</template>

<style scoped>
/* Scoped styles jika ada tambahan khusus */
</style>
