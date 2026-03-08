<template>
  <div class="min-h-screen bg-[#F4F7FE] font-plus-jakarta flex flex-col">
    <!-- ============================== -->
    <!-- LAYOUT DESKTOP (Admin & Koordinator) -->
    <!-- ============================== -->
    <div v-if="isDesktop" class="flex flex-1">
      <Sidebar />
      
      <div class="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main class="p-8 pb-20 flex-1">
          <h1 class="text-2xl font-bold text-[#2E42B2] mb-6 text-left">Profil Akun</h1>
          
          <div class="w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-[#1E3A8A] mb-6">Informasi Akun</h2>
            
            <div class="space-y-5">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-bold text-[#2D48C8]">Username</label>
                <div class="w-full bg-[#6D9BED] border border-[#2D48C8] rounded-lg px-4 py-2.5 shadow-sm">
                  <span class="font-bold text-[#1E3A8A] text-base">{{ profile.username }}</span>
                </div>
                <p class="text-[10px] text-[#4B79E6] font-medium">Username tidak bisa diubah</p>
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
                <div class="w-full bg-[#DEE8FB] border border-[#2D48C8] rounded-lg px-4 py-2.5 text-[#1C244F] font-semibold text-base">
                  {{ profile.role }}
                </div>
              </div>

              <button 
                @click="showChangePasswordModal = true"
                class="w-full bg-[#2E42B2] text-white font-bold py-2.5 rounded-lg hover:bg-blue-800 transition-all shadow-md mt-4 cursor-pointer text-sm"
              >
                Ganti Password
              </button>

              <p class="text-center text-[#4B79E6] font-medium text-xs mt-4">
                Harap Hubungi Admin (0822-2222-1111) untuk Pengubahan Detail Akun Lainnya.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- ============================== -->
    <!-- LAYOUT MOBILE (Juri & Peserta) -->
    <!-- ============================== -->
    <div v-else class="flex flex-col min-h-screen bg-white">
      <header class="bg-[#314EAE] py-4 px-5 flex items-center justify-between text-white shadow-md">
        <button class="p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <h1 class="text-xl font-bold">Profil Akun</h1>
        <div class="w-9 h-9 rounded-full bg-white/20 border border-white/40 overflow-hidden flex items-center justify-center">
            <img :src="`https://ui-avatars.com/api/?name=${profile.fullName || 'User'}`" alt="avatar" />
        </div>
      </header>

      <main class="p-6 pb-12 flex-1">
        <h2 class="text-xl font-bold text-[#1E3A8A] mb-8 text-center">Informasi Akun</h2>

        <div class="space-y-4">
              <div class="flex flex-col gap-1">
                <label class="text-[#1E3A8A] font-bold text-xs">Username</label>
                <div class="w-full bg-[#6D9BED] border border-[#2D48C8] rounded-lg px-4 py-2">
                  <span class="font-bold text-[#1E3A8A] text-sm">{{ profile.username }}</span>
                </div>
                <p class="text-[9px] text-[#4B79E6] font-bold">Username tidak bisa diubah</p>
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
                <div class="w-full bg-[#DEE8FB] border border-[#2D48C8] rounded-lg px-4 py-2 text-[#1C244F] font-semibold text-sm">
                  {{ profile.role }}
                </div>
              </div>

              <button class="w-full bg-[#2E42B2] text-white font-bold py-3 rounded-lg mt-4 shadow-md text-sm">
                Ganti Password
              </button>

              <p class="text-center text-[#4B79E6] text-[10px] mt-4 px-4 font-bold leading-tight">
                Harap Hubungi Admin (0822-2222-1111) untuk Pengubahan Detail Akun Lainnya.
              </p>
        </div>
      </main>

      <div class="p-6">
        <button @click="handleLogout" class="w-full border border-[#2E42B2] text-[#2E42B2] font-bold py-2.5 rounded-lg text-sm">
          Log Out
        </button>
      </div>
    </div>
    
    <ModalGantiPassword 
      :show="showChangePasswordModal" 
      @close="showChangePasswordModal = false" 
      @success="handlePasswordSuccess"
      @error="handlePasswordError"
    />

    <ErrorModal 
      :show="statusModal.show" 
      :type="statusModal.type" 
      :message="statusModal.message" 
      confirm-label="Kembali"
      @confirm="statusModal.show = false"
      @close="statusModal.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import ModalGantiPassword from '@/components/modals/ModalGantiPassword.vue';
import ErrorModal from '@/components/modals/ErrorModal.vue';
import { useBreakpoint } from '@/composables/useBreakpoint';
import { useAuthStore } from '@/stores/auth/auth.store';
import { getProfile } from '@/services/profile.service';
import { useRouter } from 'vue-router'

const { isDesktop } = useBreakpoint();
const authStore = useAuthStore();

const profile = ref({ username: '', fullName: '', phoneNumber: '', role: '' });
const showChangePasswordModal = ref(false);
const statusModal = reactive({ show: false, type: 'success' as 'success' | 'error', message: '' });

const router = useRouter()

const loadProfile = async () => {
  try {
    const response = await getProfile();
    profile.value = response.data;
  } catch (error: any) {
    // CEK APAKAH ERROR 401 (UNAUTHORIZED)
    if (error.response?.status === 401) {
      // 1. Hapus sesi lokal (panggil logout di store)
      authStore.logout(); 
      
      // 2. Redirect ke login dengan query parameter
      router.push({ 
        name: 'login', 
        query: { alert: 'session_expired' } 
      });
    } else {
      console.error("Gagal memuat profil", error);
    }
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.font-plus-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
</style>