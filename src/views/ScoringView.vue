<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import type {
  ScoringBlokDetail,
  ScoringBlokSummary,
  ScoringGantangan,
} from '@/interfaces/scoring.interface'
import {
  getScoringBlockDetail,
  getScoringBlocks,
  postScoringDisqualify,
  postScoringVote,
  postScoringWarning,
} from '@/services/scoring.service'
import { getLombaDetail } from '@/services/lomba.service'

type Mode = 'AJUAN' | 'PERINGATAN' | 'DISKUALIFIKASI'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const lombaId = computed(() => {
  const value = route.query.lombaId
  return typeof value === 'string' ? value : ''
})

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const info = ref('')

const blocks = ref<ScoringBlokSummary[]>([])
const selectedBlock = ref<ScoringBlokDetail | null>(null)
const mode = ref<Mode>('AJUAN')
const selectedAjuan = ref<Set<string>>(new Set())
const namaLomba = ref('')

const showEmptySubmitConfirm = ref(false)
const showSubmitConfirm = ref(false)

const selectedGantanganNumbers = computed(() =>
  orderedGantangans.value
    .filter((g) => selectedAjuan.value.has(g.id))
    .map((g) => g.nomorGantangan)
    .sort((a, b) => a - b),
)

const isJuri = computed(() => (authStore.user?.role || '').toUpperCase().includes('JURI'))

const sortedBlocks = computed(() => {
  const desiredOrder = ['BLOK II', 'BLOK III', 'BLOK I', 'BLOK IV']
  return [...blocks.value].sort((a, b) => {
    const aLabel = a.blokLabel.toUpperCase().trim()
    const bLabel = b.blokLabel.toUpperCase().trim()
    const aIdx = desiredOrder.indexOf(aLabel)
    const bIdx = desiredOrder.indexOf(bLabel)
    const aVal = aIdx !== -1 ? aIdx : 99
    const bVal = bIdx !== -1 ? bIdx : 99
    return aVal - bVal
  })
})

const logicalBlocks = computed(() => {
  const desiredOrder = ['BLOK I', 'BLOK II', 'BLOK III', 'BLOK IV']
  return [...blocks.value].sort((a, b) => {
    const aLabel = a.blokLabel.toUpperCase().trim()
    const bLabel = b.blokLabel.toUpperCase().trim()
    const aIdx = desiredOrder.indexOf(aLabel)
    const bIdx = desiredOrder.indexOf(bLabel)
    const aVal = aIdx !== -1 ? aIdx : 99
    const bVal = bIdx !== -1 ? bIdx : 99
    return aVal - bVal
  })
})

const selectedBlockIndex = computed(() => {
  if (!selectedBlock.value) return -1
  return sortedBlocks.value.findIndex((item) => item.blokId === selectedBlock.value?.blokId)
})
const canGoPrev = computed(() => logicalBlocks.value.length > 1)
const canGoNext = computed(() => logicalBlocks.value.length > 1)

const orderedGantangans = computed(() => selectedBlock.value?.gantangan || [])

const fetchBlocks = async () => {
  if (!lombaId.value) {
    error.value = 'Lomba belum dipilih. Silakan kembali ke katalog lomba.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const lombaDetail: any = await getLombaDetail(lombaId.value)
    if (lombaDetail.namaLomba) namaLomba.value = lombaDetail.namaLomba

    if (lombaDetail.status !== 'BERLANGSUNG' && lombaDetail.status !== 'SELESAI') {
      error.value = 'Penilaian belum bisa dimulai, status lomba bukan BERLANGSUNG.'
      return
    }

    const { id: currentUserId } = JSON.parse(localStorage.getItem('user') || '{}')
    const isAssigned = lombaDetail.listJuri?.some((j: any) => j.id === currentUserId) || false

    if (!isAssigned) {
      error.value =
        'Anda tidak memiliki akses penilaian pada lomba ini karena tidak ditugaskan sebagai Juri untuk lomba ini.'
      return
    }

    blocks.value = await getScoringBlocks(lombaId.value)
  } catch (err: any) {
    error.value =
      err?.response?.data?.message || 'Gagal mengambil data atau Anda tidak memiliki akses.'
  } finally {
    loading.value = false
  }
}

const openBlock = async (blokId: number) => {
  loading.value = true
  error.value = ''
  info.value = ''
  selectedAjuan.value = new Set()
  mode.value = 'AJUAN'

  try {
    selectedBlock.value = await getScoringBlockDetail(lombaId.value, blokId)
    if (selectedBlock.value.selectedGantanganIds?.length) {
      selectedAjuan.value = new Set(selectedBlock.value.selectedGantanganIds)
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Gagal mengambil data gantangan.'
  } finally {
    loading.value = false
  }
}

const backToBlocks = async () => {
  selectedBlock.value = null
  selectedAjuan.value = new Set()
  mode.value = 'AJUAN'
  await fetchBlocks()
}

const navigateBlock = async (direction: -1 | 1) => {
  if (logicalBlocks.value.length === 0) return
  const currentIndex = logicalBlocks.value.findIndex(
    (item) => item.blokId === selectedBlock.value?.blokId,
  )
  if (currentIndex < 0) return

  // Infinite looping (neverending) based on logical order (1,2,3,4)
  let nextIndex = currentIndex + direction
  if (nextIndex < 0) {
    nextIndex = logicalBlocks.value.length - 1
  } else if (nextIndex >= logicalBlocks.value.length) {
    nextIndex = 0
  }

  const nextBlock = logicalBlocks.value[nextIndex]
  if (!nextBlock) return
  await openBlock(nextBlock.blokId)
}

const isGantanganBooked = (item: ScoringGantangan) => {
  return item.isBooked || item.status === 'ACTIVE'
}

const isClickable = (item: ScoringGantangan) =>
  isGantanganBooked(item) && item.status !== 'DISQUALIFIED'

const isSelected = (id: string) => selectedAjuan.value.has(id)

const toggleAjuan = (id: string) => {
  const draft = new Set(selectedAjuan.value)
  if (draft.has(id)) {
    draft.delete(id)
  } else {
    draft.add(id)
  }
  selectedAjuan.value = draft
}

const refreshCurrentBlock = async () => {
  if (!selectedBlock.value) return
  selectedBlock.value = await getScoringBlockDetail(lombaId.value, selectedBlock.value.blokId)
}

const confirmWarningTarget = ref<ScoringGantangan | null>(null)
const confirmDisqualifyTarget = ref<ScoringGantangan | null>(null)

const onCardClick = async (item: ScoringGantangan) => {
  if (!isClickable(item) || !selectedBlock.value || selectedBlock.value.locked) return

  if (mode.value === 'AJUAN') {
    toggleAjuan(item.id)
    return
  }

  if (mode.value === 'PERINGATAN') {
    confirmWarningTarget.value = item
    return
  }

  if (mode.value === 'DISKUALIFIKASI') {
    confirmDisqualifyTarget.value = item
    return
  }
}

const proceedDisqualify = async () => {
  const item = confirmDisqualifyTarget.value
  if (!item || !selectedBlock.value) return

  confirmDisqualifyTarget.value = null
  saving.value = true
  error.value = ''
  info.value = ''

  try {
    await postScoringDisqualify(lombaId.value, item.id, selectedBlock.value.blokId)
    info.value = `Gantangan ${item.nomorGantangan} berhasil didiskualifikasi.`

    await refreshCurrentBlock()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Aksi gagal diproses.'
  } finally {
    saving.value = false
  }
}

const proceedWarning = async () => {
  const item = confirmWarningTarget.value
  if (!item || !selectedBlock.value) return

  confirmWarningTarget.value = null
  saving.value = true
  error.value = ''
  info.value = ''

  try {
    await postScoringWarning(lombaId.value, item.id, selectedBlock.value.blokId)
    info.value = `Peringatan untuk gantangan ${item.nomorGantangan} berhasil dikirim.`
    await refreshCurrentBlock()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Aksi gagal diproses.'
  } finally {
    saving.value = false
  }
}

const submitAjuan = async () => {
  if (!selectedBlock.value || selectedBlock.value.locked) return

  if (selectedAjuan.value.size === 0) {
    showEmptySubmitConfirm.value = true
    return
  }

  showSubmitConfirm.value = true
}

const submitAjuanFinal = async () => {
  if (!selectedBlock.value || selectedBlock.value.locked) return

  showEmptySubmitConfirm.value = false
  saving.value = true
  error.value = ''
  info.value = ''

  try {
    await postScoringVote(lombaId.value, {
      blokId: selectedBlock.value.blokId,
      gantanganIds: Array.from(selectedAjuan.value),
    })

    await backToBlocks()
    info.value = 'Ajuan gantangan berhasil disimpan. Blok dikunci.'
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Gagal submit ajuan gantangan.'
  } finally {
    saving.value = false
  }
}

const cardClass = (item: ScoringGantangan) => {
  const base = 'gantangan-card'

  if (!isGantanganBooked(item)) return `${base} unbooked`
  if (item.status === 'DISQUALIFIED') return `${base} disqualified`
  if (mode.value === 'AJUAN' && isSelected(item.id)) return `${base} selected`
  if (item.warningCount > 0) return `${base} warning`
  return `${base} default`
}

const formatBlockLabel = (label: string) => label.toUpperCase().replace('BLOK ', 'BLOK\n')

const isAllLocked = computed(() => {
  return blocks.value.length === 4 && blocks.value.every((block) => block.locked === true)
})

onMounted(fetchBlocks)
</script>

<template>
  <div class="flex h-screen bg-white font-plus-jakarta overflow-hidden">
    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto">
      <header class="topbar sticky top-0 z-30 flex-shrink-0">
        <button
          class="p-2 -ml-2 text-white flex items-center justify-center cursor-pointer"
          aria-label="Kembali"
          @click="router.push('/katalog-lomba')"
        >
          <span class="chevron chevron-left"></span>
        </button>
        <h1>Penilaian</h1>
        <div class="w-[36px]"></div>
      </header>

      <div class="content mx-auto w-full max-w-3xl px-3 py-3 flex-1 flex flex-col">
        <div v-if="!lombaId" class="alert error">
          Lomba belum dipilih. Buka halaman ini dari tombol Penilaian di katalog lomba.
          <div class="mt-2">
            <button class="btn-primary" @click="router.push('/katalog-lomba')">
              Kembali ke Katalog
            </button>
          </div>
        </div>
        <div v-if="error" class="alert error">{{ error }}</div>
        <div v-if="info" class="alert info">{{ info }}</div>

        <div v-if="lombaId && !isJuri" class="alert error">Halaman ini hanya untuk role Juri.</div>

        <template v-else-if="lombaId && !selectedBlock">
          <p v-if="namaLomba" class="text-center font-bold text-[#3041b3] uppercase text-sm tracking-wider pt-2 mb-1">{{ namaLomba }}</p>
          <div class="flex flex-col flex-1 justify-center items-center h-full -mt-6">
            <h2 class="title">Pilih Blok untuk Dinilai</h2>

            <div v-if="loading" class="loading">Memuat blok...</div>

            <div v-else class="block-grid w-full px-2">
              <button
                v-for="block in sortedBlocks"
                :key="block.blokId"
                class="block-card"
                :class="{ locked: block.locked }"
                @click="openBlock(block.blokId)"
              >
                <div class="flex flex-col items-center justify-center gap-1">
                  <!-- Check/Tanda Udah Di-vote -->
                  <svg
                    v-if="block.locked"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-8 h-8 mb-2 opacity-90"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53-1.648-1.528a.75.75 0 1 0-1.032 1.086l2.25 2.083a.75.75 0 0 0 1.13-.092l3.75-5.207Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span
                    class="block-card-label"
                    :class="{ 'whitespace-pre-line': true, 'text-center': true }"
                    >{{ formatBlockLabel(block.blokLabel) }}</span
                  >
                </div>
              </button>
            </div>
            <div v-if="isAllLocked" class="mt-10 px-4 w-full max-w-xs mx-auto text-center">
              <button
                @click="router.push({ name: 'hasil-ajuan', params: { lombaId: lombaId } })"
                class="w-full bg-[#3041b3] text-white py-4 rounded-xl font-bold shadow-lg cursor-pointer"
              >
                Lihat Hasil Ajuan ▶
              </button>
              <p class="text-[10px] text-gray-400 mt-2 italic">
                Klik untuk melihat klasemen sementara.
              </p>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="block-head">
            <button class="back-btn" @click="backToBlocks">
              <span class="chevron chevron-left"></span>
              Pilih Gantangan - {{ selectedBlock?.blokLabel }}
            </button>
          </div>

          <p v-if="namaLomba" class="text-center font-bold text-[#3041b3] uppercase text-sm tracking-wider mb-3">{{ namaLomba }}</p>

          <div class="mode-card">
            <p class="mode-label">Aksi:</p>
            <div class="mode-switcher">
              <button
                class="mode-btn"
                :class="{ active: mode === 'AJUAN' }"
                @click="mode = 'AJUAN'"
              >
                <span class="mode-icon icon-check">✓</span>
                Ajuan
              </button>
              <button
                class="mode-btn warning-mode"
                :class="{ active: mode === 'PERINGATAN' }"
                @click="mode = 'PERINGATAN'"
              >
                <span class="mode-icon icon-warning">!</span>
                Peringatan
              </button>
              <button
                class="mode-btn disqualified-mode"
                :class="{ active: mode === 'DISKUALIFIKASI' }"
                @click="mode = 'DISKUALIFIKASI'"
              >
                <span class="mode-icon icon-ban">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-3.5 h-3.5 mt-[1px]"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
                Diskualifikasi
              </button>
            </div>
          </div>

          <div class="block-navigator">
            <button class="nav-btn" :disabled="!canGoPrev" @click="navigateBlock(-1)">
              <span class="nav-triangle triangle-left"></span>
            </button>
            <h2>{{ selectedBlock?.blokLabel }}</h2>
            <button class="nav-btn" :disabled="!canGoNext" @click="navigateBlock(1)">
              <span class="nav-triangle triangle-right"></span>
            </button>
          </div>

          <div class="grid-wrap w-full flex-1 mb-2">
            <button
              v-for="item in orderedGantangans"
              :key="item.id"
              :class="cardClass(item)"
              :disabled="!isClickable(item) || saving || !!selectedBlock?.locked"
              @click="onCardClick(item)"
            >
              <span class="number">{{ item.nomorGantangan }}</span>

              <div
                v-if="item.warningCount > 0 && item.status !== 'DISQUALIFIED'"
                class="warning-indicator mt-1 text-xs font-bold text-yellow-700 flex items-center justify-center gap-1 z-10 w-full absolute bottom-3"
              >
                <span
                  class="w-4 h-4 rounded-full bg-yellow-500 text-white flex items-center justify-center text-[10px]"
                  >!</span
                >
                {{ item.warningCount }}/3
              </div>

              <span v-if="mode === 'AJUAN' && isSelected(item.id)" class="badge check z-10">✓</span>
              <span v-if="item.status === 'DISQUALIFIED'" class="overlay-text z-10"
                >Didiskualifikasi</span
              >
            </button>
          </div>

          <button
            class="submit-btn"
            :disabled="saving || !!selectedBlock?.locked || mode !== 'AJUAN'"
            @click="submitAjuan"
          >
            {{ saving ? 'Menyimpan...' : 'Ajukan Gantangan' }}
          </button>
        </template>
      </div>
    </main>

    <div v-if="showEmptySubmitConfirm" class="modal-backdrop">
      <div class="modal-card">
        <h3>Tidak Ada Gantangan Terpilih</h3>
        <p>Anda belum memilih gantangan manapun. Apakah Anda yakin akan mengajukan ajuan kosong?</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showEmptySubmitConfirm = false">Batal</button>
          <button class="btn-primary" @click="submitAjuanFinal">Tetap Ajukan</button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Ajuan -->
    <div v-if="showSubmitConfirm" class="modal-backdrop">
      <div class="modal-card text-center">
        <h3 class="text-[#3041b3] font-bold mb-4">Konfirmasi Ajuan</h3>
        <p class="text-sm text-gray-600 mb-6">
          Apakah Anda yakin ingin mengajukan
          <b>Gantangan {{ selectedGantanganNumbers.join(', ') }}</b>?
        </p>
        <div class="flex gap-3 justify-center w-full">
          <button
            class="btn-secondary flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold"
            @click="showSubmitConfirm = false"
          >
            Batal
          </button>
          <button
            class="btn-primary flex-1 py-2 rounded-lg bg-[#3041b3] text-white font-bold"
            @click="showSubmitConfirm = false; submitAjuanFinal()"
          >
            Ajukan
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Peringatan -->
    <div v-if="confirmWarningTarget" class="modal-backdrop">
      <div class="modal-card text-center">
        <h3 class="text-blue-700 font-bold mb-4">Berikan Peringatan</h3>
        <p class="text-sm text-gray-600 mb-6">
          Apakah Anda yakin ingin memberikan peringatan pada
          <b>Gantangan {{ confirmWarningTarget.nomorGantangan }}</b
          >?<br />
          Tersisa <b>{{ 3 - (confirmWarningTarget.warningCount || 0) }} peringatan lagi</b> sebelum
          diskualifikasi otomatis.
        </p>
        <div class="flex gap-3 justify-center w-full">
          <button
            class="btn-secondary flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold"
            @click="confirmWarningTarget = null"
          >
            Batal
          </button>
          <button
            class="btn-primary flex-1 py-2 rounded-lg bg-blue-700 text-white font-bold"
            @click="proceedWarning"
          >
            Beri Peringatan
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Diskualifikasi -->
    <div v-if="confirmDisqualifyTarget" class="modal-backdrop">
      <div class="modal-card text-center">
        <h3 class="text-black font-bold mb-4">Konfirmasi Diskualifikasi</h3>
        <p class="text-sm text-gray-600 mb-6">
          Apakah Anda yakin diskualifikasi
          <b>Gantangan {{ confirmDisqualifyTarget.nomorGantangan }}</b
          >?<br />
          <b>Gantangan tersebut tidak bisa diajukan lagi untuk babak selanjutnya.</b>
        </p>
        <div class="flex gap-3 justify-center w-full">
          <button
            class="btn-secondary flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold"
            @click="confirmDisqualifyTarget = null"
          >
            Batal
          </button>
          <button
            class="btn-primary flex-1 py-2 rounded-lg bg-black text-white font-bold"
            @click="proceedDisqualify"
          >
            Diskualifikasi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  background: #3041b3;
  color: #fff;
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.topbar h1 {
  margin: 0;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  flex: 1;
}

@media (min-width: 1024px) {
  .topbar h1 {
    text-align: left;
  }
}

.title {
  margin: 16px 0 24px;
  text-align: center;
  font-size: 20px;
  color: #3041b3;
  font-weight: 700;
}

.alert {
  font-size: 14px;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.alert.error {
  background: #ffe6e6;
  color: #7f1d1d;
}
.alert.info {
  background: #e8f1ff;
  color: #1f3a8a;
}
.loading {
  text-align: center;
  color: #5360a6;
  padding: 20px;
}

.block-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.block-card {
  border: none;
  border-radius: 12px;
  height: 200px;
  background: #3041b3;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}
.block-card:active {
  transform: scale(0.98);
}

.block-card-label {
  font-weight: 700;
}

.block-card.locked {
  background: #64748b;
  color: #ffffff;
  box-shadow: none;
}

.block-head {
  margin-bottom: 16px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #3041b3;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mode-card {
  border: 1px solid #c9ccd6;
  border-radius: 12px;
  padding: 12px;
  background: #f8f9fa;
  margin-bottom: 14px;
}

.mode-label {
  margin: 0 0 8px;
  font-size: 13px;
  color: #3041b3;
  font-weight: 700;
}

.mode-switcher {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.mode-btn {
  border-radius: 10px;
  border: 1px solid #c8ccd5;
  background: #fff;
  color: #2f3445;
  font-size: 11px;
  font-weight: 600;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.mode-btn.active {
  background: #3041b3;
  color: #fff;
  border-color: #3041b3;
  box-shadow: 0 4px 6px rgba(48, 65, 179, 0.2);
}

.mode-btn.warning-mode.active {
  background: #ffb400;
  border-color: #ffb400;
  color: #fff;
  box-shadow: 0 4px 6px rgba(255, 180, 0, 0.2);
}

.mode-btn.disqualified-mode.active {
  background: #000000;
  border-color: #000000;
  color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.mode-icon {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
}

/* Check (Ajuan) */
.mode-btn:not(.active) .icon-check {
  background: #3041b3;
  color: #fff;
}
.mode-btn.active .icon-check {
  background: #fff;
  color: #3041b3;
}

/* Warning (Peringatan) */
.mode-btn.warning-mode:not(.active) .icon-warning {
  background: #ffb400;
  color: #fff;
}
.mode-btn.warning-mode.active .icon-warning {
  background: #fff;
  color: #ffb400;
}

/* Ban (Diskualifikasi) */
.mode-btn.disqualified-mode:not(.active) .icon-ban {
  background: #000;
  color: #fff;
}
.mode-btn.disqualified-mode.active .icon-ban {
  background: #fff;
  color: #000;
}

.block-navigator {
  margin: 14px 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-navigator h2 {
  margin: 0;
  color: #3041b3;
  font-size: 16px;
  font-weight: 700;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #c4c8d4;
  background: transparent;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.nav-btn:disabled {
  opacity: 0.45;
}

.chevron {
  width: 10px;
  height: 10px;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  display: inline-block;
}
.chevron-right {
  transform: rotate(45deg);
}
.chevron-left {
  transform: rotate(-135deg);
}

.nav-triangle {
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  display: inline-block;
}
.triangle-right {
  border-left: 8px solid #3041b3;
  margin-left: 3px;
}
.triangle-left {
  border-right: 8px solid #3041b3;
  margin-right: 3px;
}

.grid-wrap {
  display: grid;
  max-height: max-content;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-width: 250px;
  margin: 0 auto 16px auto;
  align-content: start;
}

.gantangan-card {
  aspect-ratio: 1 / 1;
  height: auto;
  border: none;
  border-radius: 12px;
  position: relative;
  font-weight: 600;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.gantangan-card .number {
  font-size: 32px;
}

.gantangan-card.default {
  background: #8eb1e3;
}
.gantangan-card.selected {
  background: #3041b3;
  box-shadow: 0 4px 8px rgba(48, 65, 179, 0.3);
}
.gantangan-card.warning {
  background: #fce598;
  color: #fff;
}
.gantangan-card.disqualified {
  background: #000;
  color: #fff;
}
.gantangan-card.unbooked {
  background: #c1c3ca;
  color: #e8e9ed;
  box-shadow: none;
}
.gantangan-card:disabled {
  cursor: not-allowed;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
}

.badge.check {
  background: #3041b3;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.overlay-text {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  font-size: 11px;
  text-align: center;
  font-weight: 600;
}

.submit-btn {
  margin-top: 16px;
  width: 100%;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  display: block;
  border: none;
  border-radius: 12px;
  background: #3041b3;
  color: #fff;
  font-weight: 700;
  height: 42px;
  font-size: 15px;
}

.submit-btn:disabled {
  background: #bcc2e1;
  box-shadow: none;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 100;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  width: min(340px, 100%);
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-card h3 {
  margin: 0 0 12px;
  color: #3041b3;
  font-size: 18px;
  font-weight: 700;
}

.modal-card p {
  margin: 0 0 24px;
  font-size: 14px;
  color: #4a4f62;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 14px;
}
.btn-secondary {
  background: #f1f2f5;
  color: #4a4f62;
}
.btn-primary {
  background: #3041b3;
  color: #fff;
}
</style>
