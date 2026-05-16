<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useDashboardStore } from '@/stores/dashboard/dashboard.store'

const authStore = useAuthStore()
const store = useDashboardStore()

// ─── Date filter ─────────────────────────────────────────────────────────────
const today = new Date()
const startDate = ref<string>(new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0] as string)
const endDate = ref<string>(today.toISOString().split('T')[0] as string)
const suppressFilterFetch = ref(false)

// ─── Category filter ──────────────────────────────────────────────────────────
const filterBirdType = ref<string[]>([])
const filterClass = ref<string[]>([])
const dropdownOpen = ref(false)

// Row highlight (visual only — no chart effect)
const hoveredRow = ref<string | null>(null)

// Dropdown options — locked to last unfiltered fetch so they don't disappear
const birdTypeOptions = ref<string[]>([])
const kelasOptions = ref<string[]>([])

function syncOptions() {
  const birds = store.analytics?.allBirdTypes?.length ? store.analytics.allBirdTypes : store.analytics?.top5BirdTypes ?? []
  const classes = store.analytics?.allClasses?.length ? store.analytics.allClasses : store.analytics?.top5Classes ?? []
  if (birds.length) birdTypeOptions.value = birds.map(b => b.jenisBurung)
  if (classes.length) kelasOptions.value = classes.map(c => c.kelas)
}

const activeFilters = computed(() => {
  const res: { type: 'bird' | 'class'; label: string }[] = []
  filterClass.value.forEach(k => res.push({ type: 'class', label: k }))
  filterBirdType.value.forEach(b => res.push({ type: 'bird', label: b }))
  return res
})

const dateValidationError = computed(() => {
  if (!startDate.value || !endDate.value) {
    return 'Tanggal mulai dan tanggal akhir wajib diisi'
  }

  if (startDate.value > endDate.value) {
    return 'Tanggal mulai tidak boleh lebih dari tanggal akhir'
  }

  return null
})

const analyticsError = computed(() => dateValidationError.value ?? store.error)

function removeFilter(f: { type: 'bird' | 'class'; label: string }) {
  if (f.type === 'class') {
    filterClass.value = filterClass.value.filter(k => k !== f.label)
  } else {
    filterBirdType.value = filterBirdType.value.filter(b => b !== f.label)
  }
}

// Watch filters → re-fetch with filter params
watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) applyDateFilter()
})

watch(filterBirdType, () => {
  if (suppressFilterFetch.value || dateValidationError.value) return
  store.fetchAnalytics(startDate.value, endDate.value, filterBirdType.value.length ? filterBirdType.value : undefined, filterClass.value.length ? filterClass.value : undefined)
}, { deep: true })

watch(filterClass, () => {
  if (suppressFilterFetch.value || dateValidationError.value) return
  store.fetchAnalytics(startDate.value, endDate.value, filterBirdType.value.length ? filterBirdType.value : undefined, filterClass.value.length ? filterClass.value : undefined)
}, { deep: true })

// ─── SVG chart constants ──────────────────────────────────────────────────────
const VB_W = 800
const VB_H = 280
const L = 60
const T = 20
const R = VB_W - 20
const B = VB_H - 40
const PW = R - L
const PH = B - T

// ─── Chart computed ───────────────────────────────────────────────────────────
const trendData = computed(() => store.analytics?.trendData ?? [])

const maxY = computed(() => {
  const m = Math.max(...trendData.value.map(d => d.jumlah), 0)
  if (m === 0) return 10
  return Math.ceil(m / 5) * 5
})

const pts = computed(() =>
  trendData.value.map((d, i, arr) => ({
    x: L + (arr.length > 1 ? (i / (arr.length - 1)) * PW : PW / 2),
    y: T + PH - (d.jumlah / maxY.value) * PH,
    d,
  }))
)

function lineCmds(points: Array<{ x: number; y: number }>): string {
  return points.slice(1).map((c, i) => {
    const p = points[i]!
    const cx = (p.x + c.x) / 2
    return `C ${cx} ${p!.y} ${cx} ${c.y} ${c.x} ${c.y}`
  }).join(' ')
}

function makePath(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return ''
  return `M ${points[0]!.x} ${points[0]!.y} ${lineCmds(points)}`
}

function makeArea(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return ''
  const f = points[0]!, l = points[points.length - 1]!
  return `M ${f.x} ${B} L ${f.x} ${f.y} ${lineCmds(points)} L ${l.x} ${B} Z`
}

const mainPath = computed(() => makePath(pts.value))
const mainArea = computed(() => makeArea(pts.value))

// Real daily breakdown for hovered row (from BE data — no estimate)
const hoveredBreakdown = computed(() => {
  if (!hoveredRow.value) return []
  const bird = store.analytics?.top5BirdTypes.find(b => b.jenisBurung === hoveredRow.value)
  if (bird) return bird.dailyBreakdown
  const cls = store.analytics?.top5Classes.find(c => c.kelas === hoveredRow.value)
  return cls?.dailyBreakdown ?? []
})

const catPts = computed(() => {
  if (!hoveredRow.value || !hoveredBreakdown.value.length || !pts.value.length) return []
  return pts.value.map(p => {
    const match = hoveredBreakdown.value.find(b => b.tanggal === p.d.tanggal)
    return {
      ...p,
      y: T + PH - ((match?.jumlah ?? 0) / maxY.value) * PH,
    }
  })
})
const catPath = computed(() => makePath(catPts.value))
const catArea = computed(() => makeArea(catPts.value))

// Real count for the tooltip's hovered row
const catTooltipCount = computed<number | null>(() => {
  if (!hoveredRow.value || !tooltip.value) return null
  const match = hoveredBreakdown.value.find(b => b.tanggal === tooltip.value!.d.tanggal)
  return match?.jumlah ?? 0
})

const yLabels = computed(() =>
  Array.from({ length: 6 }, (_, i) => ({
    val: Math.round(maxY.value - (maxY.value / 5) * i),
    y: T + (i / 5) * PH,
  }))
)

const xLabels = computed(() => {
  const data = trendData.value
  if (!data.length) return []
  const step = Math.max(1, Math.ceil(data.length / 8))
  return data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % step === 0 || i === data.length - 1)
    .map(({ d, i }) => ({
      text: fmtShort(d.tanggal),
      x: L + (data.length > 1 ? (i / (data.length - 1)) * PW : PW / 2),
    }))
})

function fmtShort(s: string): string {
  const d = new Date(s)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function fmtFull(s: string): string {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const svgEl = ref<SVGSVGElement | null>(null)
const tooltip = ref<{ pct: number; sy: number; d: (typeof trendData.value)[0] } | null>(null)

function onSvgMove(e: MouseEvent) {
  if (!svgEl.value || !pts.value.length) return
  const rect = svgEl.value.getBoundingClientRect()
  const svgX = ((e.clientX - rect.left) / rect.width) * VB_W
  const near = pts.value.reduce((b, p) =>
    Math.abs(p.x - svgX) < Math.abs(b.x - svgX) ? p : b
  )
  tooltip.value = {
    pct: (near.x / VB_W) * 100,
    sy: (near.y / VB_H) * rect.height,
    d: near.d,
  }
}

// ─── Table interactions ───────────────────────────────────────────────────────
function hoverRow(name: string) {
  hoveredRow.value = name
}

function unhoverRow() {
  hoveredRow.value = null
}

function clickBirdRow(name: string) {
  if (filterBirdType.value.includes(name)) {
    filterBirdType.value = filterBirdType.value.filter(n => n !== name)
  } else {
    filterBirdType.value.push(name)
  }
}

function clickClassRow(name: string) {
  if (filterClass.value.includes(name)) {
    filterClass.value = filterClass.value.filter(n => n !== name)
  } else {
    filterClass.value.push(name)
  }
}

function clearFilter() {
  filterBirdType.value = []
  filterClass.value = []
}

// ─── Initial + date-apply fetch ───────────────────────────────────────────────
async function applyDateFilter() {
  if (dateValidationError.value) {
    store.clearError()
    return
  }

  suppressFilterFetch.value = true
  clearFilter()
  await nextTick()
  suppressFilterFetch.value = false
  await store.fetchAnalytics(startDate.value, endDate.value)
  syncOptions()
}

function roleLabel(role: string | undefined): string {
  if (!role) return ''
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

onMounted(applyDateFilter)
</script>

<template>
  <div class="flex h-screen bg-[#F9FAFB] overflow-hidden font-plus-jakarta">
    <!-- Sidebar -->
    <div class="hidden md:!block shrink-0">
      <Sidebar />
    </div>

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">

      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0 shadow-sm">
        <h1 class="text-3xl font-bold text-[#2E42B2]">Dashboard Operasional</h1>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#DEE8FB] flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-[#2E42B2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div>
            <p class="font-semibold text-sm text-gray-900 leading-tight">{{ authStore.user?.fullName }}</p>
            <p class="text-xs text-gray-500">{{ roleLabel(authStore.user?.role) }}</p>
          </div>
        </div>
      </div>

      <!-- Scrollable content -->
      <main class="flex-1 overflow-y-auto px-8 py-6 space-y-6">

        <!-- ── Filter bar ────────────────────────────────────────────── -->
        <div class="bg-white rounded-xl border border-[#6D9BED] p-5 shadow-sm">
          <div class="flex flex-wrap gap-4 items-end">
            <!-- Date range -->
            <div>
              <label class="block text-xs font-semibold text-[#1C244F] mb-1">Tanggal Mulai</label>
              <div class="flex items-center gap-2 border border-[#6D9BED] rounded-lg px-3 py-2 bg-[#F3F4F6]">
                <img src="@/assets/calendar-outline.svg" class="w-4 h-4 opacity-60" alt="" />
                <input
                  v-model="startDate"
                  type="date"
                  :max="endDate"
                  class="bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#1C244F] mb-1">Tanggal Akhir</label>
              <div class="flex items-center gap-2 border border-[#6D9BED] rounded-lg px-3 py-2 bg-[#F3F4F6]">
                <img src="@/assets/calendar-outline.svg" class="w-4 h-4 opacity-60" alt="" />
                <input
                  v-model="endDate"
                  type="date"
                  :min="startDate"
                  class="bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
                />
              </div>
            </div>
            <div class="hidden md:block w-px h-9 bg-gray-200 mx-1"></div>

            <!-- Combined Filter -->
            <div class="relative w-64">
              <label class="block text-xs font-semibold text-[#1C244F] mb-1">Filter Kategori</label>
              <div
                @click="dropdownOpen = !dropdownOpen"
                class="w-full border border-[#6D9BED] rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-[#F3F4F6] cursor-pointer flex justify-between items-center"
              >
                <span>{{ activeFilters.length ? `${activeFilters.length} Filter Terpilih` : 'Semua Tiket' }}</span>
                <svg class="w-4 h-4 text-[#6D9BED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div
                v-if="dropdownOpen"
                class="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-64 max-h-72 overflow-y-auto z-30"
              >
                <!-- Kelas Lomba Section -->
                <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 font-bold text-[#1C244F] text-xs">
                  Kelas Lomba
                </div>
                <label v-for="k in kelasOptions" :key="'opt-' + k" class="flex items-center px-4 py-2 hover:bg-blue-50 text-sm cursor-pointer border-b border-gray-50 last:border-b-0">
                  <input type="checkbox" :value="k" v-model="filterClass" class="mr-3 w-4 h-4 rounded text-[#2E42B2] focus:ring-[#2E42B2]" />
                  <span class="text-gray-700">{{ k }}</span>
                </label>

                <!-- Jenis Burung Section -->
                <div class="px-3 py-2 bg-gray-50 border-y border-gray-200 sticky top-0 font-bold text-[#1C244F] text-xs">
                  Jenis Burung
                </div>
                <label v-for="b in birdTypeOptions" :key="'opt-' + b" class="flex items-center px-4 py-2 hover:bg-blue-50 text-sm cursor-pointer border-b border-gray-50 last:border-b-0">
                  <input type="checkbox" :value="b" v-model="filterBirdType" class="mr-3 w-4 h-4 rounded text-[#2E42B2] focus:ring-[#2E42B2]" />
                  <span class="text-gray-700">{{ b }}</span>
                </label>
              </div>
            </div>

            <!-- Active filter badges -->
            <TransitionGroup name="fade-badge" tag="div" class="flex flex-wrap items-center gap-2">
              <div
                v-for="f in activeFilters" :key="f.type + f.label"
                class="flex items-center gap-2 px-3 py-2 bg-[#DEE8FB] border border-[#6D9BED] rounded-lg h-[44px]"
              >
                <span class="w-2 h-2 rounded-full shrink-0" :class="f.type === 'class' ? 'bg-[#4B79E6]' : 'bg-[#2E42B2]'"></span>
                <span class="text-sm text-[#2E42B2] font-semibold">{{ f.label }}</span>
                <button
                  @click="removeFilter(f)"
                  class="text-[#2E42B2] hover:text-[#1C244F] ml-1 cursor-pointer leading-none text-base font-bold"
                >×</button>
              </div>
              <button
                v-if="activeFilters.length > 0"
                @click="clearFilter"
                class="text-xs text-red-500 underline ml-2 h-full"
              >Hapus Semua</button>
            </TransitionGroup>
          </div>
        </div>

        <!-- ── Summary Cards ────────────────────────────────────────────── -->
        <div class="grid grid-cols-4 gap-4">          <!-- Skeleton Loading for Cards -->
          <template v-if="store.loading">
            <div v-for="i in 4" :key="'skel-card-' + i" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-8 h-8 rounded-full bg-gray-200"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div class="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
            </div>
          </template>

          <!-- Card Content -->
          <template v-else>
            <!-- Revenue -->
            <div class="bg-white rounded-xl border border-[#D1E0FF] p-5 shadow-sm flex flex-col justify-between">
              <div class="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                <div class="w-8 h-8 rounded-full bg-[#E5F7E0] flex items-center justify-center shrink-0">
                  <span class="text-green-600 font-bold text-lg leading-none">💸</span>
                </div>
                Total Pendapatan
              </div>
              <div class="text-2xl font-bold text-[#1C244F]">
                {{ formatRupiah(store.analytics?.totalRevenue || 0) }}
              </div>
            </div>

            <!-- Tiket Terjual -->
            <div class="bg-white rounded-xl border border-[#D1E0FF] p-5 shadow-sm flex flex-col justify-between">
              <div class="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                <div class="w-8 h-8 rounded-full bg-[#FFF4DE] flex items-center justify-center shrink-0">
                  <span class="text-amber-500 font-bold text-lg leading-none">🎟️</span>
                </div>
                Total Tiket Terjual
              </div>
              <div class="text-2xl font-bold text-[#1C244F]">
                {{ store.analytics?.totalTiketTerjual || 0 }}
              </div>
            </div>

            <!-- Occupancy Rate -->
            <div class="bg-white rounded-xl border border-[#D1E0FF] p-5 shadow-sm flex flex-col justify-between">
              <div class="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                <div class="w-8 h-8 rounded-full bg-[#FFE5E5] flex items-center justify-center shrink-0">
                  <span class="text-red-500 font-bold text-lg leading-none">🦅</span>
                </div>
                Rata-Rata Kehadiran Gantangan
              </div>
              <div class="text-2xl font-bold text-[#1C244F]">
                {{ store.analytics?.occupancyRate || 0 }}%
              </div>
            </div>

            <!-- Booking Success -->
            <div class="bg-white rounded-xl border border-[#D1E0FF] p-5 shadow-sm flex flex-col justify-between">
              <div class="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                <div class="w-8 h-8 rounded-full bg-[#E5F0FF] flex items-center justify-center shrink-0">
                  <span class="text-blue-500 font-bold text-lg leading-none">🛍️</span>
                </div>
                Rate Booking Success
              </div>
              <div class="text-2xl font-bold text-[#1C244F]">
                {{ store.analytics?.bookingSuccessRate || 0 }}%
              </div>
            </div>
          </template>
        </div>

        <!-- Error -->
        <div v-if="analyticsError" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium flex items-center gap-3">
          <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
          {{ analyticsError }}
          <button v-if="!dateValidationError" @click="applyDateFilter" class="ml-auto underline cursor-pointer text-xs">Coba lagi</button>
        </div>

        <!-- ── Line Chart ──────────────────────────────────────────────── -->
        <div class="bg-white rounded-xl border border-[#4B79E6] p-6 shadow-sm">
          <!-- Chart header -->
          <div class="flex items-start justify-between mb-4 gap-4">
            <div>
              <h2 class="text-xl font-bold text-[#1C244F]">
                Tren Penjualan Tiket Harian
              </h2>
              <p class="text-xs text-gray-400 mt-0.5">
                <span v-if="activeFilters.length">Data difilter berdasarkan pilihan kategori</span>
                <span v-else>Menampilkan semua tiket dalam rentang tanggal yang dipilih</span>
              </p>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500 shrink-0">
              <div class="flex items-center gap-1.5">
                <span class="inline-block w-5 h-0.5 rounded bg-[#4B79E6]"></span>
                <span>{{ activeFilters.length ? 'Filter Terpilih' : 'Semua Tiket' }}</span>
              </div>
              <Transition name="fade-badge">
                <div v-if="hoveredRow" class="flex items-center gap-1.5">
                  <span class="inline-block w-5 h-0.5 rounded bg-amber-400"></span>
                  <span class="text-amber-600">{{ hoveredRow }}</span>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Skeleton -->
          <div v-if="store.loading" class="animate-pulse">
            <div class="h-[280px] bg-gray-100 rounded-lg flex items-center justify-center">
              <div class="space-y-3 w-full px-8">
                <div class="h-3 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-full"></div>
                <div class="h-3 bg-gray-200 rounded w-5/6"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!trendData.length"
            class="h-[280px] flex flex-col items-center justify-center gap-3 text-gray-400"
          >
            <img src="@/assets/data-not-found.svg" class="w-20 h-20 opacity-40" alt="" />
            <p class="text-sm font-medium">Tidak ada data untuk filter ini</p>
            <button v-if="activeFilters.length" @click="clearFilter" class="text-xs text-[#2E42B2] underline cursor-pointer">Hapus filter</button>
          </div>

          <!-- Chart -->
          <div v-else class="relative">
            <svg
              ref="svgEl"
              :viewBox="`0 0 ${VB_W} ${VB_H}`"
              class="w-full"
              style="overflow: visible"
              @mousemove="onSvgMove"
              @mouseleave="tooltip = null"
            >
              <defs>
                <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4B79E6" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#4B79E6" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="catGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.28" />
                  <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
                </linearGradient>
              </defs>

              <!-- Y-axis grid + labels -->
              <g v-for="lbl in yLabels" :key="lbl.val">
                <line :x1="L" :y1="lbl.y" :x2="R" :y2="lbl.y" stroke="#DDE1E6" stroke-width="1" />
                <text :x="L - 8" :y="lbl.y + 4" text-anchor="end" fill="#6B7280" font-size="11" font-family="Plus Jakarta Sans">
                  {{ lbl.val }}
                </text>
              </g>

              <!-- Axes -->
              <line :x1="L" :y1="T" :x2="L" :y2="B" stroke="#DDE1E6" stroke-width="1" />
              <line :x1="L" :y1="B" :x2="R" :y2="B" stroke="#DDE1E6" stroke-width="1" />

              <!-- Area fill -->
              <path :d="mainArea" fill="url(#mainGrad)" />

              <!-- Main line (dims slightly when a row is hovered) -->
              <path
                :d="mainPath"
                fill="none"
                :stroke="hoveredRow ? '#A5C0F5' : '#4B79E6'"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Hovered-row overlay -->
              <template v-if="hoveredRow && catPts.length">
                <path :d="catArea" fill="url(#catGrad)" />
                <path
                  :d="catPath"
                  fill="none"
                  stroke="#F59E0B"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <!-- Overlay dots -->
                <circle
                  v-for="p in catPts"
                  :key="'cat-' + p.d.tanggal"
                  :cx="p.x"
                  :cy="p.y"
                  :r="tooltip?.d.tanggal === p.d.tanggal ? 5 : 3"
                  fill="#F59E0B"
                  stroke="white"
                  stroke-width="1.5"
                />
              </template>

              <!-- Always-visible data point dots -->
              <circle
                v-for="p in pts"
                :key="p.d.tanggal"
                :cx="p.x"
                :cy="p.y"
                :r="tooltip?.d.tanggal === p.d.tanggal ? 5 : 3"
                fill="#4B79E6"
                stroke="white"
                stroke-width="1.5"
              />

              <!-- Hover crosshair line -->
              <template v-if="tooltip">
                <line
                  :x1="pts.find(p => p.d.tanggal === tooltip!.d.tanggal)?.x ?? 0"
                  :y1="T"
                  :x2="pts.find(p => p.d.tanggal === tooltip!.d.tanggal)?.x ?? 0"
                  :y2="B"
                  stroke="#4B79E6"
                  stroke-width="1"
                  stroke-dasharray="4 3"
                  opacity="0.4"
                />
              </template>

              <!-- X-axis labels -->
              <text
                v-for="lbl in xLabels"
                :key="lbl.text + lbl.x"
                :x="lbl.x"
                :y="B + 22"
                text-anchor="middle"
                fill="#6B7280"
                font-size="11"
                font-family="Plus Jakarta Sans"
              >
                {{ lbl.text }}
              </text>
            </svg>

            <!-- Tooltip card -->
            <div
              v-if="tooltip"
              class="absolute pointer-events-none bg-white border border-[#6D9BED] rounded-lg shadow-xl px-3 py-2 text-sm z-20 min-w-[148px]"
              :style="{
                left: Math.min(tooltip.pct, 78) + '%',
                top: Math.max(tooltip.sy - 8, 0) + 'px',
                transform: 'translateY(-100%)',
              }"
            >
              <p class="font-semibold text-[#1C244F] text-xs mb-1">{{ fmtFull(tooltip.d.tanggal) }}</p>
              <p class="text-[#2E42B2] text-xs font-medium">
                <span class="text-gray-500">{{ activeFilters.length ? 'Total Data Filter :' : 'Semua Tiket :' }}</span>
                <span class="font-bold ml-1">{{ tooltip.d.jumlah }} tiket</span>
              </p>
              <p v-if="hoveredRow && catTooltipCount !== null" class="text-amber-500 text-xs mt-0.5">
                <span class="text-gray-500">{{ hoveredRow }}:</span>
                <span class="font-bold ml-1">{{ catTooltipCount }} tiket</span>
              </p>
            </div>
          </div>
        </div>

        <!-- ── Top 5 Tables ────────────────────────────────────────────── -->
        <div class="grid grid-cols-2 gap-6 pb-8">

          <!-- Top 5 Jenis Burung -->
          <div class="rounded-xl overflow-hidden border border-[#2E42B2] shadow-sm">
            <div class="bg-[#2E42B2] px-6 py-3 flex items-center gap-3">
              <img src="@/assets/lucide_bird.svg" class="w-5 h-5 brightness-0 invert" alt="" />
              <span class="flex-1 text-sm font-bold text-[#DEE8FB]">
                Top 5 Jenis Burung Paling Diminati
                <span v-if="filterClass.length" class="text-xs font-normal opacity-70"> (Kategori Dipilih)</span>
              </span>
              <span class="text-sm font-bold text-[#DEE8FB]">% Terjual</span>
            </div>

            <!-- Skeleton -->
            <div v-if="store.loading" class="animate-pulse">
              <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-white">
                <div class="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                <div class="flex-1 h-4 bg-gray-200 rounded"></div>
                <div class="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>

            <!-- Rows -->
            <template v-else-if="store.analytics?.top5BirdTypes.length">
              <div
                v-for="(bird, idx) in store.analytics.top5BirdTypes"
                :key="bird.jenisBurung"
                class="flex items-center gap-4 px-6 py-3.5 border-b border-gray-100 cursor-pointer transition-all select-none"
                :class="[
                  filterBirdType.includes(bird.jenisBurung)
                    ? 'bg-[#DEE8FB] border-l-4 border-l-[#2E42B2]'
                    : hoveredRow === bird.jenisBurung
                      ? 'bg-[#F3F7FF]'
                      : idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFF]'
                ]"
                @mouseenter="hoverRow(bird.jenisBurung)"
                @mouseleave="unhoverRow"
                @click="clickBirdRow(bird.jenisBurung)"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  :class="filterBirdType.includes(bird.jenisBurung) ? 'bg-[#1C244F]' : 'bg-[#2E42B2]'"
                >
                  <span class="text-[#DEE8FB] text-sm font-bold">{{ idx + 1 }}</span>
                </div>
                <span class="flex-1 text-sm font-semibold text-[#1C244F]">{{ bird.jenisBurung }}</span>
                <span
                  class="text-sm font-bold transition-colors"
                  :class="filterBirdType.includes(bird.jenisBurung) ? 'text-[#2E42B2]' : 'text-[#4B79E6]'"
                >
                  {{ bird.persentase }}%
                </span>
                <svg
                  v-if="filterBirdType.includes(bird.jenisBurung)"
                  class="w-4 h-4 text-[#2E42B2] shrink-0"
                  fill="currentColor" viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </template>

            <div v-else class="px-6 py-8 text-center text-gray-400 text-sm">Tidak ada data</div>

            <div v-if="!store.loading" class="px-6 py-2 bg-[#F9FAFB] border-t border-gray-100">
              <p class="text-[10px] text-gray-400">Klik baris untuk memfilter grafik berdasarkan jenis burung</p>
            </div>
          </div>

          <!-- Top 5 Kelas Lomba -->
          <div class="rounded-xl overflow-hidden border border-[#2E42B2] shadow-sm">
            <div class="bg-[#2E42B2] px-6 py-3 flex items-center gap-3">
              <svg class="w-5 h-5 text-[#DEE8FB] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span class="flex-1 text-sm font-bold text-[#DEE8FB]">
                Top 5 Kelas Lomba Paling Diminati
                <span v-if="filterBirdType.length" class="text-xs font-normal opacity-70"> (Kategori Dipilih)</span>
              </span>
              <span class="text-sm font-bold text-[#DEE8FB]">% Terjual</span>
            </div>

            <!-- Skeleton -->
            <div v-if="store.loading" class="animate-pulse">
              <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-white">
                <div class="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                <div class="flex-1 h-4 bg-gray-200 rounded"></div>
                <div class="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>

            <!-- Rows -->
            <template v-else-if="store.analytics?.top5Classes.length">
              <div
                v-for="(cls, idx) in store.analytics.top5Classes"
                :key="cls.kelas"
                class="flex items-center gap-4 px-6 py-3.5 border-b border-gray-100 cursor-pointer transition-all select-none"
                :class="[
                  filterClass.includes(cls.kelas)
                    ? 'bg-[#DEE8FB] border-l-4 border-l-[#2E42B2]'
                    : hoveredRow === cls.kelas
                      ? 'bg-[#F3F7FF]'
                      : idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFF]'
                ]"
                @mouseenter="hoverRow(cls.kelas)"
                @mouseleave="unhoverRow"
                @click="clickClassRow(cls.kelas)"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  :class="filterClass.includes(cls.kelas) ? 'bg-[#1C244F]' : 'bg-[#2E42B2]'"
                >
                  <span class="text-[#DEE8FB] text-sm font-bold">{{ idx + 1 }}</span>
                </div>
                <span class="flex-1 text-sm font-semibold text-[#1C244F]">{{ cls.kelas }}</span>
                <span
                  class="text-sm font-bold transition-colors"
                  :class="filterClass.includes(cls.kelas) ? 'text-[#2E42B2]' : 'text-[#4B79E6]'"
                >
                  {{ cls.persentase }}%
                </span>
                <svg
                  v-if="filterClass.includes(cls.kelas)"
                  class="w-4 h-4 text-[#2E42B2] shrink-0"
                  fill="currentColor" viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </template>

            <div v-else class="px-6 py-8 text-center text-gray-400 text-sm">Tidak ada data</div>

            <div v-if="!store.loading" class="px-6 py-2 bg-[#F9FAFB] border-t border-gray-100">
              <p class="text-[10px] text-gray-400">Klik baris untuk memfilter grafik berdasarkan kelas lomba</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-badge-enter-active,
.fade-badge-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-badge-enter-from,
.fade-badge-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
