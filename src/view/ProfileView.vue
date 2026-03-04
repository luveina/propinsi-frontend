<template>
  <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row" style="font-family: 'Plus Jakarta Sans', sans-serif;">
    
    <!-- SIDEBAR PC (#2E42B2) -->
    <aside class="hidden md:flex w-72 bg-[#2E42B2] flex-col text-white p-6 shadow-xl">
      <div class="mb-12">
        <h1 class="text-2xl font-extrabold italic tracking-tighter">SILOBUR-NG</h1>
        <p class="text-xs opacity-70">by Propinsi</p>
      </div>
      <nav class="flex-1 space-y-3">
        <div class="bg-[#2D48C8] p-4 rounded-xl flex items-center shadow-lg border border-[#6D9BED]/30">
          <span class="mr-3">👤</span> <span class="font-bold">Manajemen Profil</span>
        </div>
      </nav>
      <button class="mt-auto bg-white text-[#2E42B2] py-3 rounded-xl font-bold">Log Out</button>
    </aside>

    <!-- HEADER MOBILE (#2E42B2) -->
    <header class="md:hidden bg-[#2E42B2] p-4 text-white flex justify-between items-center sticky top-0 z-50 shadow-md">
      <button class="text-2xl">☰</button>
      <h2 class="font-bold text-lg">Profil Akun</h2>
      <div class="w-10 h-10 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-[#2E42B2] font-bold">
        {{ user.namaLengkap?.charAt(0) || 'D' }}
      </div>
    </header>

    <main class="flex-1 flex flex-col relative">
      <!-- TOP BAR PC -->
      <header class="hidden md:flex bg-white p-6 justify-between items-center border-b border-gray-100">
        <h2 class="text-2xl font-extrabold text-[#2E42B2]">Profil Akun</h2>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="font-bold text-sm text-gray-800">{{ user.namaLengkap }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ user.role }}</p>
          </div>
          <div class="w-12 h-12 bg-[#DEE8FB] rounded-full flex items-center justify-center text-[#2D48C8] font-bold border border-[#6D9BED]">
            {{ user.namaLengkap?.charAt(0) || 'D' }}
          </div>
        </div>
      </header>

      <!-- INFORMASI PROFIL -->
      <div class="p-6 md:p-12 flex justify-center">
        <div class="w-full max-w-2xl">
          <h3 class="text-xl md:text-2xl font-bold text-[#2E42B2] mb-8">Informasi Akun</h3>
          <div class="space-y-6">
            <div>
              <label class="block text-[#2D48C8] font-bold text-sm mb-2">Username</label>
              <input :value="user.username" type="text" readonly class="w-full p-4 bg-[#6D9BED] text-white rounded-2xl font-bold shadow-inner border-none">
              <p class="text-[11px] text-[#2D48C8] mt-2 font-semibold italic">Username tidak bisa diubah</p>
            </div>
            <div>
              <label class="block text-[#2D48C8] font-bold text-sm mb-2">Nama Lengkap</label>
              <input :value="user.namaLengkap" type="text" readonly class="w-full p-4 bg-[#DEE8FB] border border-[#6D9BED] rounded-2xl text-gray-700">
            </div>
            <div>
              <label class="block text-[#2D48C8] font-bold text-sm mb-2">Nomor WhatsApp</label>
              <input :value="user.nomorWhatsApp" type="text" readonly class="w-full p-4 bg-[#DEE8FB] border border-[#6D9BED] rounded-2xl text-gray-700">
            </div>
            <div>
              <label class="block text-[#2D48C8] font-bold text-sm mb-2">Role</label>
              <input :value="user.role" type="text" readonly class="w-full p-4 bg-[#DEE8FB] border border-[#6D9BED] rounded-2xl text-gray-700 capitalize">
            </div>
            <button @click="showModal = true" class="w-full bg-[#2D48C8] text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-[#2E42B2] transition mt-4">
              Ganti Password
            </button>
            <p class="text-center text-xs text-[#2D48C8] mt-6 opacity-80 leading-relaxed">Harap Hubungi Admin (0822-2222-1111) untuk Pengubahan Detail Akun Lainnya.</p>
          </div>
        </div>
      </div>

      <!-- MODAL GANTI PASSWORD -->
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
        <div class="bg-white w-full max-w-md rounded-[32px] p-8 relative shadow-2xl">
          <button @click="showModal = false" class="absolute right-6 top-6 text-2xl text-gray-400">✕</button>
          <h2 class="text-[#2D48C8] text-2xl font-bold mb-6">Ganti Password</h2>
          <div class="space-y-4">
            <div class="relative">
              <label class="text-[#2D48C8] font-bold text-sm">Password Lama</label>
              <input :type="v1 ? 'text' : 'password'" v-model="form.oldPassword" class="w-full p-3 bg-[#DEE8FB] border border-[#2D48C8] rounded-xl pr-10">
              <button @click="v1 = !v1" class="absolute right-3 top-9 text-gray-400">{{ v1 ? '👁️' : '👁️‍🗨️' }}</button>
            </div>
            <div class="relative">
              <label class="text-[#2D48C8] font-bold text-sm">Password Baru</label>
              <input :type="v2 ? 'text' : 'password'" v-model="form.newPassword" class="w-full p-3 bg-[#DEE8FB] border border-[#2D48C8] rounded-xl pr-10">
              <button @click="v2 = !v2" class="absolute right-3 top-9 text-gray-400">{{ v2 ? '👁️' : '👁️‍🗨️' }}</button>
            </div>
            <div class="relative">
              <label class="text-[#2D48C8] font-bold text-sm">Konfirmasi Password Baru</label>
              <input :type="v3 ? 'text' : 'password'" v-model="form.confirmPassword" class="w-full p-3 bg-[#DEE8FB] border border-[#2D48C8] rounded-xl pr-10">
              <button @click="v3 = !v3" class="absolute right-3 top-9 text-gray-400">{{ v3 ? '👁️' : '👁️‍🗨️' }}</button>
              <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="text-red-500 text-[10px] mt-1 italic">Password tidak sesuai</p>
            </div>
            <button @click="submitPass" :disabled="!isReady" :class="isReady ? 'bg-[#2D48C8]' : 'bg-gray-400'" class="w-full text-white font-bold py-3 rounded-xl mt-4">Simpan</button>
          </div>
        </div>
      </div>

      <!-- MODAL SUKSES -->
      <div v-if="showSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
        <div class="bg-white w-full max-w-xs rounded-[32px] p-8 text-center shadow-2xl">
          <div class="w-16 h-16 bg-[#DEE8FB] border-4 border-[#2D48C8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#2D48C8] text-3xl font-bold">✓</div>
          <h2 class="text-[#2D48C8] font-bold text-lg mb-6">Password berhasil diperbarui.</h2>
          <button @click="showSuccess = false" class="w-full bg-[#2D48C8] text-white font-bold py-3 rounded-xl">Kembali</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const user = ref({ username: '', namaLengkap: '', nomorWhatsApp: '', role: '' });
const showModal = ref(false);
const showSuccess = ref(false);
const v1 = ref(false); const v2 = ref(false); const v3 = ref(false);
const form = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });

const isReady = computed(() => form.value.oldPassword && form.value.newPassword && (form.value.newPassword === form.value.confirmPassword));

const fetchProfile = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/profile');
    user.value = res.data;
  } catch (e) {
    user.value = { username: 'Mihumihuily', namaLengkap: 'Dewi Lestari', nomorWhatsApp: '0813-7572-2200', role: 'Admin' };
  }
};

const submitPass = async () => {
  try {
    await axios.put('http://localhost:8080/api/profile/password', { oldPassword: form.value.oldPassword, newPassword: form.value.newPassword });
    showModal.value = false; showSuccess.value = true;
    form.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
  } catch (err) { alert(err.response?.data || "Password lama Anda tidak sesuai"); }
};

onMounted(fetchProfile);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
input:read-only { cursor: default; }
</style>