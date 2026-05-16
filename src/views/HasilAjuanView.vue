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
  return standings.value.rankings[0]?.jumlahAjuan ?? 0
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
  if (!standings.value || standings.value.juriSubmitted < standings.value.totalJuri) {
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
  <div class="flex flex-col h-[100dvh] bg-[#F2F2F2] font-plus-jakarta overflow-hidden">
    
    <!-- HEADER -->
    <header class="bg-[#3041b3] text-white px-5 py-4 flex items-center shrink-0 z-50 shadow-md">
      <button @click="router.back()" class="p-2 -ml-2 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
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

    <!-- AREA MAIN: Scrollable -->
    <main class="flex-1 overflow-y-auto">
      <div class="p-5 flex flex-col items-center">
        <!-- Nav Kembali -->
        <div class="w-full max-w-md mb-4 shrink-0">
          <button @click="router.back()" class="text-[#3041b3] font-bold flex items-center gap-2 text-sm cursor-pointer">
            <span class="chevron chevron-left"></span>
            <span>Kembali</span>
          </button>
        </div>

        <!-- Nama Lomba -->
        <div v-if="standings?.namaLomba" class="w-full max-w-md mb-3 shrink-0">
          <p class="text-center font-bold text-[#3041b3] uppercase text-sm tracking-wider">{{ standings.namaLomba }}</p>
        </div>

        <div v-if="loading" class="mt-20 flex items-center justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#3041b3] border-t-transparent"></div>
        </div>

        <!-- TABEL KLASEMEN -->
        <div v-else class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#3041b3]/40 overflow-hidden mb-6">
          <table class="w-full text-center border-collapse table-fixed">
            <thead class="bg-[#3041b3] text-white text-[11px] uppercase font-bold tracking-widest sticky top-0 z-10">
              <tr>
                <th class="py-4 w-16">No</th>
                <th class="py-4">Gantangan</th>
                <th class="py-4 w-20">Blok</th>
                <th class="py-4">Jumlah Ajuan</th>
              </tr>
            </thead>
            <tbody class="text-blue-900">
              <tr
                v-for="(item, index) in standings?.rankings"
                :key="index"
                class="border-b border-[#3041b3]/10 transition-all duration-500"
                :class="[
                  item.jumlahAjuan === maxAjuan && item.jumlahAjuan > 0 
                    ? 'bg-[#DEE8FB] shadow-[inset_5px_0_0_#3041B3] text-[#1E2A78]' 
                    : 'bg-white'
                ]"
              >
                <td class="py-4 px-1">
                  <div class="flex justify-center items-center">
                    <span
                      class="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black"
                      :class="item.jumlahAjuan === maxAjuan && item.jumlahAjuan > 0
                        ? 'bg-[#3041B3] text-white border-[#1E2A78]'
                        : 'bg-[#DEE8FB] text-[#3041b3] border-[#3041b3]/40'"
                    >
                      {{ index + 1 }}
                    </span>
                  </div>
                </td>

                <td class="py-4">
                  <div class="flex justify-center">
                    <span 
                      class="px-6 py-0.5 rounded-full border font-black text-sm min-w-[60px]"
                      :class="item.jumlahAjuan === maxAjuan && item.jumlahAjuan > 0
                        ? 'bg-[#3041B3] text-white border-[#1E2A78] shadow-sm'
                        : 'bg-[#9CBFF4] text-[#3041b3] border-[#3041b3]'"
                    >
                      {{ item.nomorGantangan }}
                    </span>
                  </div>
                </td>

                <td class="py-4 text-sm font-semibold">{{ item.blokId }}</td>
                <td class="py-4 font-black text-xl" :class="item.jumlahAjuan === maxAjuan && item.jumlahAjuan > 0 ? 'text-[#1E2A78]' : 'text-[#3041b3]'">
                  {{ item.jumlahAjuan }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PROGRESS JURI -->
        <div v-if="standings && standings.juriSubmitted < standings.totalJuri" class="w-full max-w-xs text-center mb-10 shrink-0">
          <p class="text-[12px] font-bold text-[#3041b3] mb-1">
            Progres: {{ standings.juriSubmitted }}/{{ standings.totalJuri }} Juri Selesai
          </p>
          <p class="text-[11px] text-blue-400 italic leading-relaxed">
            Silakan refresh halaman secara berkala untuk memperbarui hasil penjurian.
          </p>
        </div>

        <div class="h-10"></div>
      </div>
    </main>

    <footer class="bg-white p-5 border-t border-gray-200 shrink-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div class="max-w-md mx-auto">
        <button
          :disabled="buttonConfig.disabled"
          @click="handleAction"
          class="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
          :class="buttonConfig.class"
        >
          {{ buttonConfig.label }}

          <svg 
            v-if="!buttonConfig.disabled && standings?.nextStep === 'KONCER'" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            class="w-6 h-6"
          >
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 20.012c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </footer>

  </div>
</template>

<style scoped>
tr {
  transition: all 0.4s ease;
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