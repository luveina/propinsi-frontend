<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import ModalTambahAkun from '@/components/accounts/ModalTambahAkun.vue';
import { getAllAccounts, deleteAccount } from '@/services/account.service.ts';

// ==============================
// 1. STATE (Tempat nyimpen data)
// ==============================
const accounts = ref<any[]>([]); // Menyimpan data asli dari database
const searchQuery = ref('');     // Menyimpan teks pencarian
const filterRole = ref('');      // Menyimpan pilihan filter dropdown
const isModalOpen = ref(false);  // Mengatur buka/tutup modal
const isEditMode = ref(false); // Menyimpan status apakah sedang dalam mode edit
const selectedAccount = ref<any>(null); // Menyimpan data akun yang sedang diedit (jika ada)

// delete confirmation
const isDeleteModalOpen = ref(false);
const accountToDelete = ref<any>(null);

// notification
const notification = ref<string>('');
const notificationType = ref<'success' | 'error'>('success');

// ==============================
// 2. FUNGSI TARIK DATA (GET)
// ==============================
const fetchAccounts = async () => {
  try {
    const data = await getAllAccounts();
    accounts.value = data;
  } catch (error) {
    console.error("Gagal mengambil data akun:", error);
  }
};

onMounted(() => {
  fetchAccounts();
});

// ==============================
// 3. FITUR SEARCH & FILTER
// ==============================
const filteredAccounts = computed(() => {
  return accounts.value.filter((account) => {
    const matchSearch = account.username?.toLowerCase().includes(searchQuery.value.toLowerCase()) || false;
    const matchRole = filterRole.value === '' || account.role === filterRole.value;
    return matchSearch && matchRole;
  });
});

// ==============================
// 4. HANDLER SETELAH SIMPAN
// ==============================
const handleSuccessAdd = () => {
  isModalOpen.value = false;
  fetchAccounts();
};

const handleSuccessUpdate = () => {
  isModalOpen.value = false;
  fetchAccounts();
};

const handleModalSuccess = () => {
  if (isEditMode.value) {
    handleSuccessUpdate();
  } else {
    handleSuccessAdd();
  }
};

const openEditModal = (account: any) => {
  selectedAccount.value = { ...account };
  isEditMode.value = true;
  isModalOpen.value = true;
};

const openAddModal = () => {
  selectedAccount.value = null;
  isEditMode.value = false;
  isModalOpen.value = true;
};

// delete modal
const openDeleteModal = (account: any) => {
  accountToDelete.value = account;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  accountToDelete.value = null;
};

const confirmDeleteAccount = async () => {
  if (!accountToDelete.value) return;
  try {
    await deleteAccount(accountToDelete.value.id);
    notification.value = 'Akun berhasil dinonaktifkan';
    notificationType.value = 'success';
    fetchAccounts();
  } catch (e) {
    notification.value = 'Gagal menonaktifkan akun';
    notificationType.value = 'error';
  } finally {
    closeDeleteModal();
    setTimeout(() => (notification.value = ''), 3000);
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedAccount.value = null;
};
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="bg-white px-12 py-6 shadow-sm flex justify-between items-center">
        <h1 class="text-3xl font-bold text-[#2E42B2]">Daftar Akun</h1>
        <div class="text-right leading-tight">
          <p class="font-semibold">Kimi Antonelli</p>
          <p class="text-xs text-gray-500">Admin</p>
        </div>
      </div>

      <!-- Content -->
      <div class="px-12 py-8">
        <div
          v-if="notification"
          :class="notificationType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          class="p-3 rounded mb-4"
        >
          {{ notification }}
        </div>

        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div class="flex w-full md:w-auto gap-4 flex-1">
            <div class="relative flex-1 w-full md:max-w-md">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari Username"
                class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-blue-500 text-sm"
              />
              <svg class="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>

            <div class="relative flex-1">
              <select
                v-model="filterRole"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-blue-500 text-sm bg-white"
              >
                <option value="">Filter Role</option>
                <option value="Juri">Juri</option>
                <option value="Koordinator Lomba">Koordinator Lomba</option>
                <option value="Koordinator Pendaftaran">Koordinator Pendaftaran</option>
                <option value="Peserta">Peserta</option>
              </select>
              <svg class="w-4 h-4 absolute right-3 top-3 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <button
              @click="openAddModal()"
              class="flex-1 bg-[#2E42B2] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors w-full md:w-auto justify-center cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Tambah Akun
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#2E42B2] text-white">
              <tr>
                <th class="py-3 px-6 text-sm font-semibold text-center">Username</th>
                <th class="py-3 px-6 text-sm font-semibold text-center">Nama Lengkap</th>
                <th class="py-3 px-6 text-sm font-semibold text-center">Nomor WhatsApp</th>
                <th class="py-3 px-6 text-sm font-semibold text-center">Role</th>
                <th class="py-3 px-6 text-sm font-semibold text-center">Status</th>
                <th class="py-3 px-6 text-sm font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredAccounts.length === 0">
                <td colspan="6" class="py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center">
                    <img src="@/assets/data-not-found.svg" alt="Kosong" class="w-24 opacity-50 mb-3" />
                    <p>Belum ada data akun yang sesuai.</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="(account, index) in filteredAccounts"
                :key="account.id || index"
                :class="['odd:bg-white even:bg-[#DEE8FB] hover:bg-[#EBEBEC] transition-colors', account.status === 'Inactive' ? 'bg-red-50' : '']"
              >
                <td class="py-3 px-6 text-sm text-[#2E42B2] font-medium text-center">{{ account.username }}</td>
                <td class="py-3 px-6 text-sm text-[#2E42B2] text-center">{{ account.namaLengkap }}</td>
                <td class="py-3 px-6 text-sm text-[#2E42B2] text-center">{{ account.nomorWhatsapp }}</td>
                <td class="py-3 px-6 text-sm text-center">
                  <span class="inline-block whitespace-nowrap bg-[#9CBFF4] text-[#2E42B2] py-1 px-4 rounded-full text-xs font-semibold border border-[#2E42B2]">
                    {{ account.role }}
                  </span>
                </td>
                <td class="py-3 px-6 text-sm text-center">
                  <span :class="['inline-block whitespace-nowrap py-1 px-4 rounded-full text-xs font-semibold border',
                    account.status === 'Inactive' ? 'bg-red-200 text-red-700 border-red-700' : 'bg-[#9CBFF4] text-[#2E42B2] border-[#2E42B2]']">
                    {{ account.status === 'Inactive' ? 'Non Aktif' : 'Aktif' }}
                  </span>
                </td>
                <td class="py-3 px-6 text-sm text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      v-if="account.status !== 'Inactive'"
                      @click="openEditModal(account)"
                      class="bg-[#FCD34D] hover:bg-yellow-600 text-yellow-900 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                    >Edit</button>
                    <button
                      v-if="account.status !== 'Inactive'"
                      @click="openDeleteModal(account)"
                      class="bg-[#EF4444] hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                    >Hapus</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ModalTambahAkun
          v-if="isModalOpen"
          :is-edit="isEditMode"
          :edit-data="selectedAccount"
          @close="closeModal"
          @success="handleModalSuccess"
        />

        <!-- Konfirmasi hapus soft-delete -->
        <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80">
          <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Hapus Akun</h2>
              <button @click="closeDeleteModal" class="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer">&times;</button>
            </div>
            <p>Apakah Anda yakin akan menonaktifkan akun ini?</p>
            <div class="mt-6 flex justify-end">
              <button @click="confirmDeleteAccount" class="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 cursor-pointer">
                Ya, Nonaktifkan Akun
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>
