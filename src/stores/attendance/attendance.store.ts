import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as attendanceService from '@/services/attendance.service';
import type { ParticipantResponse } from '@/interfaces/attendance.interface';

export const useAttendanceStore = defineStore('attendance', () => {
  const participants = ref<ParticipantResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchParticipants = async (
    eventId: string,
    keyword?: string,
    attendanceStatus?: string
  ) => {
    loading.value = true;
    error.value = null;
    try {
      participants.value = await attendanceService.getParticipants(
        eventId,
        keyword,
        attendanceStatus
      );
    } catch (e: any) {
      error.value = e.message || 'Gagal mengambil data peserta';
    } finally {
      loading.value = false;
    }
  };

  const updateCheckIn = async (participantId: string, isPresent: boolean) => {
    try {
      const updated = await attendanceService.checkIn(participantId, isPresent);
      
      // Update local state
      const index = participants.value.findIndex(p => p.participant_id === participantId);
      if (index !== -1) {
        participants.value[index] = updated;
      }
      
      return updated;
    } catch (e: any) {
      error.value = e.message || 'Gagal mengubah status kehadiran';
      throw e;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const presentCount = computed(() => {
    return participants.value.filter(p => p.is_present).length;
  });

  const absentCount = computed(() => {
    return participants.value.filter(p => !p.is_present).length;
  });

  return {
    participants,
    loading,
    error,
    fetchParticipants,
    updateCheckIn,
    clearError,
    presentCount,
    absentCount,
  };
});
