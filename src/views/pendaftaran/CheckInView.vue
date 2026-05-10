<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    
    <!-- Sidebar Desktop -->
    <div class="hidden md:!block">
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden w-full">
      
      <!-- Desktop Header -->
      <div class="hidden md:!flex bg-white px-10 py-5 border-b border-gray-200 justify-between items-center shrink-0">
        <button
          @click="router.back()"
          class="text-[#2E42B2] font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity font-plus-jakarta"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
        <RouterLink to="/profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline">
          <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div class="text-right">
            <p class="font-semibold text-sm leading-tight text-gray-900 font-plus-jakarta">{{ authStore.user?.fullName }}</p>
            <p class="text-xs text-gray-500 font-plus-jakarta">
              {{ authStore.user?.role?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }}
            </p>
          </div>
        </RouterLink>
      </div>

      <!-- Mobile Header -->
      <header class="md:!hidden bg-[#2E42B2] text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-40 shadow-md">
        <button @click="router.back()" class="p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-bold flex-1 text-center font-plus-jakarta">Data Pendaftar</h1>
      </header>

      <!-- Toast -->
      <transition name="toast">
        <div
          v-if="toast.show"
          :class="[
            'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold font-plus-jakarta',
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          ]"
        >
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ toast.message }}
        </div>
      </transition>

      <!-- Content Area -->
        <div class="flex-1 overflow-y-auto bg-[#F4F7FE]">
        <div class="w-full px-5 md:px-8 pt-5 pb-8">

            <!-- Title -->
            <h1 class="text-[28px] md:text-[34px] font-bold text-[#2E42B2] mb-5 font-plus-jakarta">
            Data Pendaftar {{ namaLomba }}
            </h1>

            <!-- Filter Row -->
            <div class="flex flex-row gap-3 mb-4">

            <!-- Search -->
            <div class="relative w-[68%]">
                <input
                v-model="searchKeyword"
                @input="onSearchInput"
                type="text"
                placeholder="Cari Pendaftar"
                class="w-full h-[42px]
                        bg-[#F4F7FE]
                        border border-[#2E42B2]
                        rounded-lg
                        pl-4 pr-10
                        text-sm text-[#2E42B2]
                        placeholder-[#2E42B2]/50
                        focus:outline-none"
                />

                <svg
                class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2E42B2]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
                </svg>
            </div>

            <!-- Filter -->
            <div class="relative w-[32%]">
                <select
                v-model="selectedAttendanceStatus"
                @change="onFilterChange"
                class="w-full h-[42px]
                        bg-[#F4F7FE]
                        border border-[#2E42B2]
                        rounded-lg
                        px-4 pr-10
                        text-sm text-[#2E42B2]
                        appearance-none
                        focus:outline-none"
                >
                <option value="">Filter Status Kehadiran</option>
                <option value="present">Hadir</option>
                <option value="absent">Tidak Hadir</option>
                </select>

                <svg
                class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2E42B2]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                />
                </svg>
            </div>
            </div>

            <!-- Table -->
            <div class="w-full overflow-hidden rounded-xl border border-[#2E42B2]/20 bg-white">

            <table class="w-full border-collapse">

                <!-- Head -->
                <thead class="bg-[#2E42B2] text-white">
                <tr>
                    <th class="py-3 px-4 text-sm font-semibold">
                    Nomor Gantangan
                    </th>

                    <th class="py-3 px-4 text-sm font-semibold">
                    Nama Pendaftar
                    </th>

                    <th class="py-3 px-4 text-sm font-semibold">
                    Nomor WhatsApp
                    </th>

                    <th class="py-3 px-4 text-sm font-semibold">
                    Status Kehadiran
                    </th>
                </tr>
                </thead>

                <!-- Body -->
                <tbody>

                <tr
                    v-for="(participant, index) in attendanceStore.participants"
                    :key="participant.participant_id"
                    :class="[
                    index % 2 === 0 ? 'bg-white' : 'bg-[#E3E8F2]',
                    'border-t border-[#2E42B2]/10 text-center'
                    ]"
                >
                    <!-- Nomor -->
                    <td class="py-3 px-4">
                    <span class="text-[24px] font-bold text-[#2E42B2]">
                        {{ String(participant.gantangan_no).padStart(2, '0') }}
                    </span>
                    </td>

                    <!-- Nama -->
                    <td class="py-3 px-4 text-sm text-[#2E42B2]">
                    {{ participant.participant_name || '-' }}
                    </td>

                    <!-- WA -->
                    <td class="py-3 px-4 text-sm text-[#2E42B2]">
                    {{ participant.phone_number || '-' }}
                    </td>

                    <!-- Checkbox -->
                    <td class="py-3 px-4">
                    <div class="flex justify-center">
                        <button
                        @click="toggleAttendance(participant)"
                        :disabled="togglingIds.has(participant.participant_id)"
                        class="w-6 h-6 rounded border-2 flex items-center justify-center transition"
                        :class="participant.is_present
                            ? 'bg-[#2E42B2] border-[#2E42B2]'
                            : 'bg-white border-[#2E42B2]'"
                        >
                        <svg
                            v-if="participant.is_present"
                            class="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M5 13l4 4L19 7"
                            />
                        </svg>
                        </button>
                    </div>
                    </td>
                </tr>

                </tbody>
            </table>
            </div>

          <!-- Error Banner -->
          <div
            v-if="attendanceStore.error"
            class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-plus-jakarta"
          >
            {{ attendanceStore.error }}
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth/auth.store';
import { useAttendanceStore } from '@/stores/attendance/attendance.store';
import { getLombaById } from '@/services/lomba.service';
import type { ParticipantResponse } from '@/interfaces/attendance.interface';
import Sidebar from '@/components/Sidebar.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const attendanceStore = useAttendanceStore();

const searchKeyword = ref('');
const selectedAttendanceStatus = ref('');
const togglingIds = ref<Set<string>>(new Set());
const namaLomba = ref('');

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' });
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3000);
}

onMounted(async () => {
  if (authStore.user?.role !== 'KOORDINATOR_PENDAFTARAN') {
    router.push('/katalog-lomba');
    return;
  }

  const eventId = route.params.eventId as string;

  try {
    const res = await getLombaById(eventId);
    namaLomba.value = res.data?.namaLomba || res.namaLomba || '';
  } catch {
    namaLomba.value = '';
  }

  await loadParticipants();
});

async function loadParticipants() {
  const eventId = route.params.eventId as string;

  await attendanceStore.fetchParticipants(
    eventId,
    searchKeyword.value || undefined,
    selectedAttendanceStatus.value || undefined
  );
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => loadParticipants(), 400);
}

function onFilterChange() {
  loadParticipants();
}

async function toggleAttendance(participant: ParticipantResponse) {
  if (togglingIds.value.has(participant.participant_id)) return;

  togglingIds.value = new Set([...togglingIds.value, participant.participant_id]);
  const previousStatus = participant.is_present;
  participant.is_present = !previousStatus;

  try {
    await attendanceStore.updateCheckIn(participant.participant_id, participant.is_present);
    showToast(
      participant.is_present ? 'Berhasil Check-in' : 'Status diubah ke Tidak Hadir',
      'success'
    );
  } catch {
    participant.is_present = previousStatus;
    showToast('Gagal memperbarui status kehadiran.', 'error');
  } finally {
    const next = new Set(togglingIds.value);
    next.delete(participant.participant_id);
    togglingIds.value = next;
  }
}
</script>

<style scoped>
select { background-image: none; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-12px); }
</style>