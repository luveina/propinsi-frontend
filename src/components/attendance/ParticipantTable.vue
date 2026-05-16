<template>
  <div class="w-full">
    <div class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="w-full">
        <thead>
          <tr class="bg-blue-600 text-white">
            <th class="px-4 py-3 text-left text-sm font-semibold">No. Gantangan</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Nama Peserta</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">No. HP</th>
            <th class="px-4 py-3 text-center text-sm font-semibold">Status Kehadiran</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(participant, index) in participants"
            :key="participant.participant_id"
            :class="index % 2 === 0 ? 'bg-white' : 'bg-blue-50'"
            class="border-b border-gray-200 hover:bg-blue-100 transition-colors"
          >
            <td class="px-4 py-3 text-sm font-medium text-gray-900">
              {{ participant.gantangan_no }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-700">
              {{ participant.participant_name }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-700">
              {{ participant.phone_number }}
            </td>
            <td class="px-4 py-3 text-center">
              <label class="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="participant.is_present"
                  @change="(e) => toggleAttendance(participant, (e.target as HTMLInputElement).checked)"
                  :disabled="isUpdating"
                  class="w-5 h-5 rounded"
                  :class="participant.is_present ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'"
                />
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-if="participants.length === 0"
      class="text-center py-12 text-gray-500"
    >
      <p>Tidak ada data peserta</p>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="isUpdating"
      class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg px-6 py-4 shadow-lg">
        <p class="text-gray-700">Memproses...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAttendanceStore } from '@/stores/attendance/attendance.store';
import type { ParticipantResponse } from '@/interfaces/attendance.interface';

interface Props {
  participants: ParticipantResponse[];
}

defineProps<Props>();

const attendanceStore = useAttendanceStore();
const isUpdating = ref(false);
const notification = ref('');
const notificationType = ref<'success' | 'error'>('success');

const toggleAttendance = async (participant: ParticipantResponse, isPresent: boolean) => {
  isUpdating.value = true;
  try {
    await attendanceStore.updateCheckIn(participant.participant_id, isPresent);
    notification.value = 'Berhasil Check-in';
    notificationType.value = 'success';
    
    // Auto-hide notification after 2 seconds
    setTimeout(() => {
      notification.value = '';
    }, 2000);
  } catch (error: any) {
    notification.value = error.message || 'Gagal mengubah status kehadiran';
    notificationType.value = 'error';
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
input[type='checkbox']:checked {
  background-color: #2563eb;
  border-color: #2563eb;
}

input[type='checkbox']:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
