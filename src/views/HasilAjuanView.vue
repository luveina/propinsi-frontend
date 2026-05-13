<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSemiFinalStandings } from '@/services/scoring.service'
import type { SemiFinalStandings } from '@/interfaces/scoring.interface'

const route = useRoute()
const router = useRouter()

const lombaId = computed(() => route.params.lombaId as string)

const standings = ref<SemiFinalStandings | null>(null)
const polling = ref<any>(null)
const loading = ref(false)

const fetchStandings = async () => {
  if (!lombaId.value) return
  try {
    const data = await getSemiFinalStandings(lombaId.value)
    standings.value = data
  } catch (error) {
    console.error('Gagal mengambil data klasemen:', error)
  }
}

const maxAjuan = computed(() => {
  if (!standings.value?.rankings || standings.value.rankings.length === 0) return 0
  return standings.value.rankings[0].jumlahAjuan
})

onMounted(async () => {
  loading.value = true
  await fetchStandings()
  loading.value = false
  polling.value = setInterval(fetchStandings, 3000)
})

onUnmounted(() => {
  if (polling.value) clearInterval(polling.value)
})

const buttonConfig = computed(() => {
  if (!standings.value || standings.value.juriSubmitted < 4) {
    return {
      label: 'Menunggu Hasil Penjurian...',
      disabled: true,
      class: 'bg-[#D9D9D9] text-[#999999] cursor-not-allowed',
    }
  }

  if (standings.value.nextStep === 'FINISH') {
    return {
      label: 'Lihat Pemenang',
      disabled: false,
      class: 'bg-[#3041b3] text-white active:scale-95 cursor-pointer',
    }
  } else {
    return {
      label: 'Babak Koncer',
      disabled: false,
      class: 'bg-[#3041b3] text-white active:scale-95 cursor-pointer',
    }
  }
})

const handleAction = () => {
  if (buttonConfig.value.disabled) return
  const query = { lombaId: lombaId.value }
  if (standings.value?.nextStep === 'FINISH') {
    router.push({ name: 'hasil-akhir', query })
  } else if (standings.value?.nextStep === 'KONCER') {
    router.push({ name: 'babak-koncer', query })
  }
}
</script>

<template>
  <div class="flex flex-col h-screen bg-[#F2F2F2] font-plus-jakarta overflow-hidden">
    <header class="bg-[#3041b3] text-white px-5 py-4 flex items-center sticky top-0 z-50 shadow-md">
      <button @click="router.back()" class="p-2 -ml-2 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <h1 class="text-xl font-bold flex-1 text-center">Hasil Ajuan</h1>
      <div class="bg-gray-100 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-gray-400">
          <path d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" />
        </svg>
      </div>
    </header>

    <main class="flex-1 p-5 overflow-y-auto flex flex-col items-center">
      <div class="w-full max-w-md mb-4">
        <button @click="router.back()" class="text-[#3041b3] font-bold flex items-center gap-2 text-sm cursor-pointer">
          <span class="chevron chevron-left"></span>
          <span>Kembali</span>
        </button>
      </div>

      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#3041b3] border-t-transparent"></div>
      </div>

      <div v-else class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden mb-6">
        <table class="w-full text-center border-collapse table-fixed">
          <thead class="bg-[#3041b3] text-white text-[11px] uppercase font-bold tracking-widest">
            <tr>
              <th class="py-4 border-r border-white/10 w-14">No</th>
              <th class="py-4 border-r border-white/10">Gantangan</th>
              <th class="py-4 border-r border-white/10 w-20">Blok</th>
              <th class="py-4">Jumlah Ajuan</th>
            </tr>
          </thead>
          <tbody class="text-blue-900">
            <tr
              v-for="(item, index) in standings?.rankings"
              :key="index"
              class="border-b border-blue-50 transition-colors duration-500"
              :class="[
                item.jumlahAjuan === maxAjuan && item.jumlahAjuan > 0 
                  ? 'bg-[#DEE8FB]' 
                  : 'bg-white'
              ]"
            >
              <td class="py-4 text-sm font-bold text-[#3041b3]">{{ index + 1 }}</td>
              <td class="py-4">
                <div class="flex justify-center">
                   <span class="bg-[#9CBFF4] text-[#3041b3] px-6 py-1 rounded-full border border-[#3041b3] font-black text-sm min-w-[60px]">
                    {{ item.nomorGantangan }}
                  </span>
                </div>
              </td>
              <td class="py-4 text-sm font-semibold">{{ item.blokId }}</td>
              <td class="py-4 font-black text-xl text-[#3041b3]">{{ item.jumlahAjuan }}</td>
            </tr>
            <tr v-if="!standings?.rankings.length">
              <td colspan="4" class="py-10 text-gray-400 text-sm italic">
                Belum ada ajuan atau semua burung didiskualifikasi.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="standings && standings.juriSubmitted < 4" class="w-full max-w-xs text-center">
        <p class="text-[11px] text-blue-400 italic leading-relaxed">
          Silakan refresh halaman secara berkala untuk memperbarui hasil penjurian.
        </p>
      </div>

      <div class="mt-auto w-full max-w-xs pb-10">
        <button
          :disabled="buttonConfig.disabled"
          @click="handleAction"
          class="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-lg active:scale-95"
          :class="buttonConfig.class"
        >
          {{ buttonConfig.label }}
          <span v-if="!buttonConfig.disabled" class="ml-2">▶</span>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
tr {
  transition: background-color 0.4s ease;
}

.chevron {
  width: 8px;
  height: 8px;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  display: inline-block;
}
.chevron-left {
  transform: rotate(-135deg);
}
</style>