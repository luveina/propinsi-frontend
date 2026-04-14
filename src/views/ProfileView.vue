<template>
  <div class="min-h-screen bg-[#F4F7FE] font-plus-jakarta flex flex-col">
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="!isDesktop && isSidebarOpen" 
             @click="isSidebarOpen = false"
             class="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm">
        </div>
      </Transition>

      <Transition name="slide">
        <div v-if="!isDesktop && isSidebarOpen" class="fixed inset-y-0 left-0 z-[70] w-64 shadow-2xl">
          <Sidebar />
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================================ -->
    <!-- LAYOUT DESKTOP (Admin & Koordinator) -->
    <!-- ============================================================ -->
    <div v-if="isDesktop" class="flex flex-1">
      <Sidebar />

      <div class="flex-1 flex flex-col min-w-0">
        <Header /> 

        <main class="p-8 pb-20 flex-1">
          <h1 class="text-2xl font-bold text-[#2E42B2] mb-6 text-left">Profil Akun</h1>

          <div v-if="loading" class="flex justify-center items-center py-24">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"></div>
          </div>

          <div v-else class="w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-[#1E3A8A] mb-6">Informasi Akun</h2>

            <div class="space-y-5">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-bold text-[#2D48C8]">Username</label>
                <div class="w-full bg-[#6D9BED] border border-[#2D48C8] rounded-lg px-4 py-2.5 shadow-sm">
                  <span class="font-bold text-[#1E3A8A] text-base">{{ profile.username }}</span>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-sm font-bold text-[#1E3A8A]">Nama Lengkap</label>
                <div class="w-full bg-[#DEE8FB] border border-[#2D48C8] rounded-lg px-4 py-2.5 text-[#1C244F] font-semibold text-base">
                  {{ profile.fullName }}
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-sm font-bold text-[#1E3A8A]">Nomor WhatsApp</label>
                <div class="w-full bg-[#DEE8FB] border border-[#2D48C8] rounded-lg px-4 py-2.5 text-[#1C244F] font-semibold text-base">
                  {{ profile.phoneNumber }}
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-sm font-bold text-[#1E3A8A]">Role</label>
                <div class="w-full bg-[#DEE8FB] border border-[#2D48C8] rounded-lg px-4 py-2.5 text-[#1C244F] font-semibold text-base uppercase">
                  {{ formatRole(profile.role) }}
                </div>
              </div>

              <button @click="showChangePasswordModal = true" class="w-full bg-[#2E42B2] text-white font-bold py-2.5 rounded-lg hover:bg-blue-800 transition-all shadow-md mt-4 cursor-pointer text-sm">
                Ganti Password
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- LAYOUT MOBILE (Juri & Peserta) -->
    <!-- ============================================================ -->
    <div v-else class="flex flex-col min-h-screen bg-white">
      
      <HeaderMobile 
        title="Profil Akun" 
        @menu-click="isSidebarOpen = true" 
      />

      <main class="p-8 pb-12 flex-1">
        <h2 class="text-2xl font-bold text-[#2E42B2] mb-8 text-left">Informasi Akun</h2>

        <div v-if="loading" class="flex justify-center items-center py-16">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"></div>
        </div>

        <div v-else class="space-y-4">
              <div class="flex flex-col gap-1">
                <label class="text-[#1E3A8A] font-bold text-xs">Username</label>
                <div class="w-full bg-[#6D9BED] border border-[#2D48C8] rounded-lg px-4 py-2">
                  <span class="font-bold text-[#1E3A8A] text-sm">{{ profile.username }}</span>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[#1E3A8A] font-bold text-xs">Nama Lengkap</label>
                <div class="w-full bg-[#DEE8FB] border border-[#2D48C8] rounded-lg px-4 py-2 text-[#1C244F] font-semibold text-sm">
                  {{ profile.fullName }}
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[#1E3A8A] font-bold text-xs">Nomor WhatsApp</label>
                <div class="w-full bg-[#DEE8FB] border border-[#2D48C8] rounded-lg px-4 py-2 text-[#1C244F] font-semibold text-sm">
                  {{ profile.phoneNumber }}
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[#1E3A8A] font-bold text-xs">Role</label>
                <div class="w-full bg-[#DEE8FB] border border-[#2D48C8] rounded-lg px-4 py-2 text-[#1C244F] font-semibold text-sm uppercase">
                  {{ formatRole(profile.role) }}
                </div>
              </div>

              <button 
                @click="showChangePasswordModal = true"
                class="w-full bg-[#2E42B2] text-white font-bold py-3 rounded-lg mt-4 shadow-md text-sm cursor-pointer active:bg-blue-900 transition-colors"
              >
                Ganti Password
              </button>

              <p class="text-center text-[#4B79E6] text-[10px] mt-4 px-4 font-bold leading-tight">
                Harap Hubungi Admin (0812-3456-7890) untuk Pengubahan Detail Akun Lainnya.
              </p>
        </div>
      </main>

      <div class="p-6">
        <button 
          @click="handleLogout" 
          class="w-full border border-[#2E42B2] text-[#2E42B2] font-bold py-2.5 rounded-lg text-sm cursor-pointer active:bg-gray-100 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>

    <!-- MODALS -->
    <ModalGantiPassword :show="showChangePasswordModal" @close="showChangePasswordModal = false" @success="handlePasswordSuccess" @error="handlePasswordError" />
    <ErrorModal :show="statusModal.show" :type="statusModal.type" :message="statusModal.message" @confirm="statusModal.show = false" @close="statusModal.show = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import HeaderMobile from '@/components/HeaderMobile.vue';

import ModalGantiPassword from '@/components/modals/ModalGantiPassword.vue';
import ErrorModal from '@/components/modals/ErrorModal.vue';
import { useBreakpoint } from '@/composables/useBreakpoint';
import { useAuthStore } from '@/stores/auth/auth.store';
import { getProfile } from '@/services/profile.service';
import { useRouter } from 'vue-router'

const { isDesktop } = useBreakpoint();
const authStore = useAuthStore();
const router = useRouter();
const isSidebarOpen = ref(false);

const profile = ref({ username: '', fullName: '', phoneNumber: '', role: '' });
const showChangePasswordModal = ref(false);
const statusModal = reactive({ show: false, type: 'success' as 'success' | 'error', message: '' });
const loading = ref(true);

const roleLabels: Record<string, string> = {
  ADMIN: 'ADMIN',
  JURI: 'JURI',
  KOORDINATOR_LOMBA: 'KOORDINATOR LOMBA',
  KOORDINATOR_PENDAFTARAN: 'KOORDINATOR PENDAFTARAN',
  PESERTA: 'PESERTA'
};

const formatRole = (role: string) => roleLabels[role] || role.replace(/_/g, ' ');

const loadProfile = async () => {
  loading.value = true;
  try {
    const response = await getProfile();
    profile.value = response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      authStore.logout();
      router.push({ name: 'login', query: { alert: 'session_expired' } });
    }
  } finally {
    loading.value = false;
  }
};

onMounted(loadProfile);

const handlePasswordSuccess = () => {
  showChangePasswordModal.value = false;
  statusModal.type = 'success';
  statusModal.message = 'Password berhasil diperbarui.';
  statusModal.show = true;
};

const handlePasswordError = (msg: string) => {
  statusModal.type = 'error';
  statusModal.message = msg;
  statusModal.show = true;
};

function handleLogout() { authStore.logout(); }
</script>

<style scoped>
.font-plus-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>