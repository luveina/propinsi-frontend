<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSemiFinalStandings } from '@/services/scoring.service'
import type { SemiFinalStandings } from '@/interfaces/scoring.interface'

const route = useRoute()
const router = useRouter()

// Ambil Lomba ID dari URL Query (?lombaId=...)
const lombaId = computed(() => route.params.lombaId as string)

// State
const standings = ref<SemiFinalStandings | null>(null)
const polling = ref<any>(null)
const loading = ref(false)

// Fungsi Ambil Data dari Backend
const fetchStandings = async () => {
  if (!lombaId.value) return
  try {
    const data = await getSemiFinalStandings(lombaId.value)
    standings.value = data
  } catch (error) {
    console.error("Gagal mengambil data klasemen:", error)
  }
}

// Lifecycle: Mulai Polling tiap 3 detik agar real-time
onMounted(async () => {
  loading.value = true
  await fetchStandings()
  loading.value = false
  
  // Set interval untuk cek update dari juri lain di background
  polling.value = setInterval(fetchStandings, 3000)
})

// Bersihkan interval saat pindah halaman agar tidak memory leak
onUnmounted(() => {
  if (polling.value) clearInterval(polling.value)
})

// Logic Tombol (Warna & Label)
const buttonConfig = computed(() => {
  // Jika juri belum lengkap (kurang dari 4 orang yang submit 4 blok)
  if (!standings.value || standings.value.juriSubmitted < 4) {
    return { 
      label: 'Menunggu Hasil Penjurian...', 
      disabled: true, 
      class: 'bg-[#D9D9D9] text-[#999999] cursor-not-allowed' 
    }
  }
  
  // Jika sudah lengkap, cek apakah lanjut koncer atau finish
  if (standings.value.nextStep === 'FINISH') {
    return { 
      label: 'Lihat Pemenang', 
      disabled: false, 
      class: 'bg-[#3041b3] text-white active:scale-95 cursor-pointer' 
    }
  } else {
    return { 
      label: 'Babak Koncer', 
      disabled: false, 
      class: 'bg-[#3041b3] text-white active:scale-95 cursor-pointer' 
    }
  }
})

const handleAction = () => {
  if (buttonConfig.value.disabled) return
  
  // Pastikan lombaId terbawa ke halaman berikutnya
  const query = { lombaId: lombaId.value }
  
  if (standings.value?.nextStep === 'FINISH') {
    // Kalau menang mutlak, ke halaman Pengumuman
    router.push({ name: 'hasil-akhir', query }) 
  } else if (standings.value?.nextStep === 'KONCER') {
    // Kalau seri, ke halaman Babak Koncer
    router.push({ name: 'babak-koncer', query })
  }
}
</script>

<template>
  <div class="flex flex-col h-screen bg-[#F2F2F2] font-plus-jakarta overflow-hidden">
    <!-- Header -->
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
      <!-- Nav Kembali -->
      <div class="w-full max-w-md mb-4">
        <button @click="router.back()" class="text-[#3041b3] font-bold flex items-center gap-1 text-sm cursor-pointer">
          ‹ Kembali
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
         <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#3041b3] border-t-transparent"></div>
      </div>

      <!-- Tabel Klasemen -->
      <div v-else class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden mb-6">
        <table class="w-full text-center border-collapse">
          <thead class="bg-[#3041b3] text-white text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th class="py-3 border-r border-white/10">No</th>
              <th class="py-3 border-r border-white/10">Gantangan</th>
              <th class="py-3 border-r border-white/10">Blok</th>
              <th class="py-3">Jumlah Ajuan</th>
            </tr>
          </thead>
          <tbody class="text-blue-900">
            <tr v-for="(item, index) in standings?.rankings" :key="index" class="border-b border-blue-50 odd:bg-white even:bg-blue-50/30">
              <td class="py-3 text-xs font-semibold">{{ index + 1 }}</td>
              <td class="py-3 flex justify-center">
                <span class="bg-[#9CBFF4] text-[#3041b3] px-5 py-0.5 rounded-full border border-[#3041b3] font-black text-sm">
                  {{ item.nomorGantangan }}
                </span>
              </td>
              <td class="py-3 text-sm">{{ item.blokId }}</td>
              <td class="py-3 font-black text-lg">{{ item.jumlahAjuan }}</td>
            </tr>
            <tr v-if="!standings?.rankings.length">
              <td colspan="4" class="py-10 text-gray-400 text-sm italic">Belum ada ajuan atau semua burung didiskualifikasi.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Instruksi Refresh (Hanya muncul jika belum 4/4 juri) -->
      <div v-if="standings && standings.juriSubmitted < 4" class="w-full max-w-xs text-center">
        <p class="text-[11px] text-blue-400 italic leading-relaxed">
          Silakan refresh halaman secara berkala untuk memperbarui hasil penjurian.
        </p>
      </div>

      <!-- Tombol Aksi di Bawah -->
      <div class="mt-auto w-full max-w-xs pb-10">
        <button 
          :disabled="buttonConfig.disabled"
          @click="handleAction"
          class="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md"
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
/* Transisi halus untuk baris tabel saat data berubah */
tr {
  transition: background-color 0.3s ease;
}
</style>