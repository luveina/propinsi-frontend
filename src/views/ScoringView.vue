<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import type { ScoringBlokDetail, ScoringBlokSummary, ScoringGantangan } from '@/interfaces/scoring.interface'
import {
  getScoringBlockDetail,
  getScoringBlocks,
  postScoringDisqualify,
  postScoringVote,
  postScoringWarning,
} from '@/services/scoring.service'

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

const showEmptySubmitConfirm = ref(false)

const isJuri = computed(() => (authStore.user?.role || '').toUpperCase().includes('JURI'))

const fetchBlocks = async () => {
  if (!lombaId.value) {
    error.value = 'Lomba belum dipilih. Silakan kembali ke katalog lomba.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    blocks.value = await getScoringBlocks(lombaId.value)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Gagal mengambil data blok.'
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

const isClickable = (item: ScoringGantangan) => item.isBooked && item.status !== 'DISQUALIFIED'

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

const onCardClick = async (item: ScoringGantangan) => {
  if (!isClickable(item) || !selectedBlock.value || selectedBlock.value.locked) return

  if (mode.value === 'AJUAN') {
    toggleAjuan(item.id)
    return
  }

  const confirmationText =
    mode.value === 'PERINGATAN'
      ? `Tambahkan peringatan untuk gantangan ${item.nomorGantangan}?`
      : `Yakin diskualifikasi gantangan ${item.nomorGantangan}?`

  const ok = window.confirm(confirmationText)
  if (!ok) return

  saving.value = true
  error.value = ''
  info.value = ''

  try {
    if (mode.value === 'PERINGATAN') {
      await postScoringWarning(lombaId.value, item.id)
      info.value = `Peringatan untuk gantangan ${item.nomorGantangan} berhasil dikirim.`
    } else {
      await postScoringDisqualify(lombaId.value, item.id)
      info.value = `Gantangan ${item.nomorGantangan} berhasil didiskualifikasi.`
    }

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

  await submitAjuanFinal()
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

  if (!item.isBooked) return `${base} unbooked`
  if (item.status === 'DISQUALIFIED') return `${base} disqualified`
  if (mode.value === 'AJUAN' && isSelected(item.id)) return `${base} selected`
  if (item.warningCount > 0) return `${base} warning`
  return `${base} default`
}

onMounted(fetchBlocks)
</script>

<template>
  <main class="scoring-page">
    <section class="phone-shell">
      <header class="topbar">
        <h1>Penilaian</h1>
        <p>{{ authStore.user?.fullName }}</p>
      </header>

      <div class="content">
        <div v-if="!lombaId" class="alert error">
          Lomba belum dipilih. Buka halaman ini dari tombol Penilaian di katalog lomba.
          <div class="mt-2">
            <button class="btn-primary" @click="router.push('/katalog-lomba')">Kembali ke Katalog</button>
          </div>
        </div>
        <div v-if="error" class="alert error">{{ error }}</div>
        <div v-if="info" class="alert info">{{ info }}</div>

        <div v-if="lombaId && !isJuri" class="alert error">Halaman ini hanya untuk role Juri.</div>

        <template v-else-if="lombaId && !selectedBlock">
          <h2 class="title">Pilih Blok untuk Dinilai</h2>

          <div v-if="loading" class="loading">Memuat blok...</div>

          <div v-else class="block-grid">
            <button
              v-for="block in blocks"
              :key="block.blokId"
              class="block-card"
              :class="{ locked: block.locked }"
              :disabled="block.locked"
              @click="openBlock(block.blokId)"
            >
              <span>{{ block.blokLabel }}</span>
              <small>{{ block.locked ? 'Selesai Dinilai' : 'Belum Dinilai' }}</small>
            </button>
          </div>
        </template>

        <template v-else>
          <div class="block-head">
            <button class="back-btn" @click="backToBlocks">&lt; Kembali ke Blok</button>
            <h2>{{ selectedBlock?.blokLabel }}</h2>
          </div>

          <div class="mode-switcher">
            <button :class="{ active: mode === 'AJUAN' }" @click="mode = 'AJUAN'">Ajuan</button>
            <button :class="{ active: mode === 'PERINGATAN' }" @click="mode = 'PERINGATAN'">Peringatan</button>
            <button :class="{ active: mode === 'DISKUALIFIKASI' }" @click="mode = 'DISKUALIFIKASI'">Diskualifikasi</button>
          </div>

          <div class="grid-wrap">
            <button
              v-for="item in selectedBlock?.gantangan ?? []"
              :key="item.id"
              :class="cardClass(item)"
              :disabled="!isClickable(item) || saving || !!selectedBlock?.locked"
              @click="onCardClick(item)"
            >
              <span class="number">{{ item.nomorGantangan }}</span>

              <span v-if="mode === 'AJUAN' && isSelected(item.id)" class="badge check">✓</span>
              <span v-else-if="item.warningCount > 0 && item.status !== 'DISQUALIFIED'" class="badge warning">{{ item.warningCount }}/3</span>
              <span v-if="item.status === 'DISQUALIFIED'" class="overlay-text">Didiskualifikasi</span>
            </button>
          </div>

          <button class="submit-btn" :disabled="saving || !!selectedBlock?.locked || mode !== 'AJUAN'" @click="submitAjuan">
            {{ saving ? 'Menyimpan...' : 'Ajukan Gantangan' }}
          </button>
        </template>
      </div>
    </section>

    <div v-if="showEmptySubmitConfirm" class="modal-backdrop">
      <div class="modal-card">
        <h3>Tidak Ada Gantangan Terpilih</h3>
        <p>
          Anda belum memilih gantangan manapun. Apakah Anda yakin akan mengajukan ajuan kosong?
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showEmptySubmitConfirm = false">Batal</button>
          <button class="btn-primary" @click="submitAjuanFinal">Tetap Ajukan</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.scoring-page {
  min-height: 100vh;
  background: radial-gradient(circle at top right, #dfe8ff 0%, #eef3ff 36%, #f6f8ff 100%);
  display: flex;
  justify-content: center;
  padding: 18px 12px;
}

.phone-shell {
  width: 100%;
  max-width: 390px;
  border-radius: 20px;
  border: 1px solid #cfd8f8;
  background: #ffffff;
  box-shadow: 0 18px 34px rgba(40, 61, 156, 0.14);
  overflow: hidden;
}

.topbar {
  background: #2f43b3;
  color: #fff;
  padding: 16px;
}

.topbar h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.topbar p {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.9;
}

.content {
  padding: 16px;
}

.title {
  margin: 0 0 14px;
  text-align: center;
  font-size: 18px;
  color: #2f43b3;
}

.alert {
  font-size: 12px;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
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
  color: #5a6aa6;
}

.block-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.block-card {
  border: none;
  border-radius: 10px;
  min-height: 95px;
  background: #2f43b3;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  font-weight: 700;
}

.block-card small {
  font-size: 11px;
  opacity: 0.85;
}

.block-card.locked {
  background: #b7bdcc;
  color: #eceff7;
}

.block-head {
  margin-bottom: 10px;
}

.block-head h2 {
  margin: 6px 0 0;
  text-align: center;
  color: #2f43b3;
}

.back-btn {
  border: none;
  background: transparent;
  color: #2f43b3;
  padding: 0;
  font-size: 13px;
}

.mode-switcher {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 8px 0 12px;
}

.mode-switcher button {
  border-radius: 10px;
  border: 1px solid #d2daf7;
  background: #f3f6ff;
  color: #2f43b3;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 6px;
}

.mode-switcher button.active {
  background: #2f43b3;
  color: #fff;
  border-color: #2f43b3;
}

.grid-wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.gantangan-card {
  min-height: 70px;
  border: none;
  border-radius: 8px;
  position: relative;
  font-weight: 700;
  color: #fff;
}

.gantangan-card .number {
  font-size: 30px;
}

.gantangan-card.default {
  background: #8db4ea;
}

.gantangan-card.selected {
  background: #2f43b3;
}

.gantangan-card.warning {
  background: #f8dd8f;
  color: #553f05;
}

.gantangan-card.disqualified {
  background: #121212;
  color: #fff;
}

.gantangan-card.unbooked {
  background: #c7ccd6;
  color: #dfe3eb;
}

.gantangan-card:disabled {
  cursor: not-allowed;
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
}

.badge.check {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.badge.warning {
  width: auto;
  min-width: 28px;
  padding: 0 5px;
  background: rgba(255, 255, 255, 0.5);
  color: #4f3a00;
}

.overlay-text {
  position: absolute;
  bottom: 6px;
  left: 6px;
  right: 6px;
  font-size: 10px;
  text-align: center;
  opacity: 0.95;
}

.submit-btn {
  margin-top: 12px;
  width: 100%;
  border: none;
  border-radius: 8px;
  background: #2f43b3;
  color: #fff;
  font-weight: 700;
  height: 36px;
}

.submit-btn:disabled {
  background: #b8c2ea;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.4);
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  background: #fff;
  border-radius: 10px;
  width: min(340px, 100%);
  padding: 14px;
}

.modal-card h3 {
  margin: 0 0 8px;
  color: #1f2d78;
  font-size: 16px;
}

.modal-card p {
  margin: 0;
  font-size: 13px;
  color: #4e5680;
}

.modal-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-secondary,
.btn-primary {
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  font-weight: 700;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-primary {
  background: #2f43b3;
  color: #fff;
}

@media (min-width: 768px) {
  .scoring-page {
    padding: 28px;
  }

  .phone-shell {
    max-width: 430px;
  }
}
</style>
