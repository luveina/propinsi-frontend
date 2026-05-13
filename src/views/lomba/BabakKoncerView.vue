<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSemiFinalStandings, postKoncerVote, getKoncerStatus } from '@/services/scoring.service'
import type { GantanganRanking, KoncerVoteItemRequest } from '@/interfaces/scoring.interface'

const route = useRoute()
const router = useRouter()

const lombaId = computed(() => route.params.lombaId as string)

// Data from backend
const rankings = ref<GantanganRanking[]>([])
const loading = ref(true)
const submitting = ref(false)

// State Votes: Map dari gantanganId ke pilihan 'A' | 'B'
const votes = ref<Record<string, 'A' | 'B'>>({})

const namaLomba = ref('')

// Read-only state (setelah berhasil disubmit)
const isSubmittedLocally = ref(false)

// Polling and backend status
const polling = ref<any>(null)
const koncerFinished = ref(false)
const waitingOtherJudges = ref(false)

const fetchStandings = async () => {
  if (!lombaId.value) return
  try {
    const data = await getSemiFinalStandings(lombaId.value)
    if (data.namaLomba) namaLomba.value = data.namaLomba
    if (data.koncerQualifiers && data.koncerQualifiers.length > 0) {
      rankings.value = data.koncerQualifiers
    }
  } catch (error) {
    console.error('Gagal mengambil data peserta koncer:', error)
  }
}

const checkStatus = async () => {
  if (!lombaId.value) return
  try {
    const status = await getKoncerStatus(lombaId.value)
    isSubmittedLocally.value = status.hasSubmitted
    koncerFinished.value = status.koncerFinished
    waitingOtherJudges.value = status.hasSubmitted && !status.koncerFinished

    if (status.userVotes) {
      votes.value = status.userVotes
    }

    if (koncerFinished.value && polling.value) {
      clearInterval(polling.value)
    }
  } catch (error) {
    console.error('Gagal mengambil status koncer:', error)
  }
}

const toggleVote = (gantanganId: string, poin: 'A' | 'B') => {
  if (isSubmittedLocally.value) return // Read-only

  if (votes.value[gantanganId] === poin) {
    delete votes.value[gantanganId]
  } else {
    votes.value[gantanganId] = poin
  }
}

const isAllVoted = computed(() => {
  if (rankings.value.length === 0) return false
  return rankings.value.every((r) => votes.value[r.gantanganId] !== undefined)
})

const showConfirmModal = ref(false)
const notification = ref('')
const notificationType = ref<'success' | 'error'>('success')

const submitVotes = async () => {
  if (!isAllVoted.value) return

  submitting.value = true
  try {
    const payloadVotes: KoncerVoteItemRequest[] = rankings.value.map((r) => ({
      gantanganId: r.gantanganId,
      poin: votes.value[r.gantanganId] as 'A' | 'B',
    }))

    await postKoncerVote(lombaId.value, { votes: payloadVotes })

    showConfirmModal.value = false
    isSubmittedLocally.value = true
    waitingOtherJudges.value = true

    notification.value = 'Berhasil Menambahkan Penilaian'
    notificationType.value = 'success'
    setTimeout(() => {
      notification.value = ''
    }, 3000)

    await checkStatus()

    if (!koncerFinished.value) {
      startPolling()
    }
  } catch (e) {
    console.error(e)
    notification.value = 'Gagal mensubmit koncer'
    notificationType.value = 'error'
    setTimeout(() => {
      notification.value = ''
    }, 3000)
  } finally {
    submitting.value = false
  }
}

const startPolling = () => {
  if (!polling.value) {
    polling.value = setInterval(checkStatus, 3000)
  }
}

onMounted(async () => {
  loading.value = true
  await fetchStandings()
  await checkStatus()
  loading.value = false

  if (isSubmittedLocally.value && !koncerFinished.value) {
    startPolling()
  }
})

onUnmounted(() => {
  if (polling.value) clearInterval(polling.value)
})

const handleGoPemenang = () => {
  const query = { lombaId: lombaId.value }
  router.push({ name: 'hasil-akhir', query })
}
</script>

<template>
  <div class="flex flex-col h-screen bg-[#F2F2F2] font-plus-jakarta overflow-hidden">
    <!-- Header -->
    <header class="bg-[#3041b3] text-white px-5 py-4 flex items-center sticky top-0 z-50 shadow-md">
      <button @click="router.push('/katalog-lomba')" class="p-2 -ml-2 cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
      <h1 class="text-xl font-bold flex-1 text-center">Babak Koncer</h1>
      <div class="bg-gray-100 rounded-full p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5 text-gray-400"
        >
          <path
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
          />
        </svg>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4 flex flex-col items-center">
      <div class="w-full max-w-md mb-4">
        <transition name="fade">
          <div
            v-if="notification"
            :class="
              notificationType === 'success'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-red-100 text-red-800 border-red-300'
            "
            class="p-4 rounded-lg text-sm font-medium flex items-center justify-between shadow-sm border"
          >
            <span>{{ notification }}</span>
            <button @click="notification = ''" class="text-current opacity-70 hover:opacity-100 text-xl font-bold ml-4">
              &times;
            </button>
          </div>
        </transition>
      </div>

      <!-- Nav Kembali -->
      <div class="w-full max-w-md pb-2">
        <button
          @click="router.back()"
          class="text-[#3041b3] font-bold flex items-center gap-2 text-sm cursor-pointer"
        >
          <span class="chevron chevron-left"></span>
          <span>Hasil Ajuan</span>
        </button>
      </div>

      <div v-if="namaLomba" class="w-full max-w-md mb-1">
        <p class="text-center font-bold text-[#3041b3] uppercase text-sm tracking-wider">{{ namaLomba }}</p>
      </div>

      <div v-if="loading" class="mt-10 animate-pulse text-gray-500">Loading...</div>

      <div v-else-if="rankings.length === 0" class="mt-10 text-gray-500 text-center">
        Tidak ada gantangan yang masuk babak koncer.
      </div>

      <div
        v-else
        class="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 mt-4 overflow-hidden"
      >
        <!-- Table Header -->
        <div class="flex justify-between bg-[#3041b3] p-3 text-white font-bold text-sm">
          <div class="w-1/3 text-center">No. Gantangan</div>
          <div class="w-2/3 text-center">Koncer</div>
        </div>

        <!-- Table Row -->
        <div
          v-for="item in rankings"
          :key="item.gantanganId"
          class="flex justify-between items-center p-3 border-b border-gray-200"
        >
          <!-- Nomor Gantangan -->
          <div class="w-1/3 text-center text-xl text-[#3041b3] font-bold">
            {{ item.nomorGantangan }}
          </div>
          <!-- Koncer Buttons -->
          <div class="w-2/3 flex justify-center gap-2">
            <!-- Button A -->
            <button
              @click="toggleVote(item.gantanganId, 'A')"
              :class="[
                'px-4 py-2 rounded font-semibold text-sm transition-all border border-[#3041b3]',
                votes[item.gantanganId] === 'A'
                  ? 'bg-[#3041b3] text-white'
                  : 'bg-[#9CBFF4] text-[#3041b3]',
                isSubmittedLocally ? 'cursor-not-allowed' : 'hover:opacity-90 active:scale-95',
              ]"
            >
              A
              <span
                class="text-xs font-normal"
                :class="votes[item.gantanganId] === 'A' ? 'text-white' : 'text-[#3041b3]'"
                >(100 pts)</span
              >
            </button>
            <!-- Button B -->
            <button
              @click="toggleVote(item.gantanganId, 'B')"
              :class="[
                'px-4 py-2 rounded font-semibold text-sm transition-all border border-[#3041b3]',
                votes[item.gantanganId] === 'B'
                  ? 'bg-[#3041b3] text-white'
                  : 'bg-[#9CBFF4] text-[#3041b3]',
                isSubmittedLocally ? 'cursor-not-allowed' : 'hover:opacity-90 active:scale-95',
              ]"
            >
              B
              <span
                class="text-xs font-normal"
                :class="votes[item.gantanganId] === 'B' ? 'text-white' : 'text-[#3041b3]'"
                >(40 pts)</span
              >
            </button>
          </div>
        </div>
      </div>

      <!-- Menunggu teks -->
      <div
        v-if="waitingOtherJudges && !koncerFinished"
        class="w-full max-w-md mt-6 text-center text-[11px] text-blue-400 italic leading-relaxed"
      >
        Menunggu penilaian juri lain.<br />
        Silakan refresh halaman secara berkala untuk dapat mengakses hasil koncer.
      </div>

      <!-- Bottom Actions -->
      <div class="mt-auto w-full max-w-xs pt-8 pb-10">
        <button
          v-if="koncerFinished"
          @click="handleGoPemenang"
          class="w-full py-3.5 rounded-xl bg-[#3041b3] text-white font-bold text-sm shadow-md transition-all hover:bg-blue-800 active:scale-95 flex items-center justify-center gap-2"
        >
          Lihat Pemenang <span>▶</span>
        </button>

        <button
          v-else-if="waitingOtherJudges"
          disabled
          class="w-full py-3.5 rounded-xl bg-[#D9D9D9] text-[#999999] font-bold text-sm shadow-md cursor-not-allowed transition-all"
        >
          Menunggu Hasil Koncer...
        </button>

        <button
          v-else
          @click="showConfirmModal = true"
          :disabled="!isAllVoted || submitting"
          :class="[
            'w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all',
            isAllVoted
              ? 'bg-[#3041b3] text-white hover:bg-blue-800 active:scale-95'
              : 'bg-[#D9D9D9] text-[#999999] cursor-not-allowed',
          ]"
        >
          {{ submitting ? 'Memproses...' : 'Submit Penilaian' }}
        </button>
      </div>
    </div>

    <!-- Confirm Modal -->
    <Teleport to="body">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
        @click.self="showConfirmModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-sm overflow-hidden">
          <div class="p-6 text-center">
            <h2 class="text-xl font-bold text-[#3041b3] mb-3">Kirim Penilaian</h2>
            <p class="text-gray-600 text-sm mb-6">
              Apakah Anda yakin ingin mengirimkan penilaian final?
            </p>

            <div class="flex gap-3 justify-center">
              <button
                @click="showConfirmModal = false"
                class="flex-1 py-2 px-4 rounded-md bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                @click="submitVotes"
                :disabled="submitting"
                class="flex-1 py-2 px-4 rounded-md bg-[#3041b3] text-white font-bold hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                <svg
                  v-if="submitting"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Kirim
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.chevron {
  width: 10px;
  height: 10px;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  display: inline-block;
}
.chevron-left {
  transform: rotate(-135deg);
}
</style>
