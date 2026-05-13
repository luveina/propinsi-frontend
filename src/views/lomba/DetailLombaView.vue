<template>
  <div class="min-h-screen font-plus-jakarta flex flex-col bg-[#F4F7FE]">
    <!-- ============================================================ -->
    <!-- 1. LAYOUT DESKTOP (Semua Role: Admin, Koor, Juri, Peserta) -->
    <!-- ============================================================ -->
    <div v-if="isDesktop" class="flex flex-1 h-screen overflow-hidden">
      <!-- Sidebar Kiri -->
      <Sidebar class="shrink-0" />

      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header Dashboard Desktop -->
        <header
          class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0"
        >
          <button
            @click="router.back()"
            class="flex items-center gap-2 text-gray-700 font-bold hover:text-[#2E42B2] transition cursor-pointer"
          >
            <Icon icon="ph:caret-left-bold" class="w-5 h-5" />
            <span>Kembali</span>
          </button>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-sm font-extrabold text-gray-900">{{ profileName }}</p>
              <p class="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                {{ userRoleLabel }}
              </p>
            </div>
            <div
              @click="router.push('/profile')"
              class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer overflow-hidden"
            >
              <Icon icon="ph:user-fill" class="w-6 h-6 text-gray-300" />
            </div>
          </div>
        </header>

        <!-- Main Content Dashboard -->
        <main class="flex-1 overflow-y-auto p-10">
          <h1 class="text-[36px] font-extrabold text-[#2E42B2] mb-8">Detail Lomba</h1>

          <transition name="fade">
            <div
              v-if="notification"
              :class="
                notificationType === 'success'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              "
              class="p-4 rounded-lg mb-8 text-sm font-bold flex items-center justify-between shadow-sm border"
            >
              <span>{{ notification }}</span>
              <button
                @click="notification = ''"
                class="text-current opacity-70 hover:opacity-100 cursor-pointer"
              >
                &times;
              </button>
            </div>
          </transition>

          <div v-if="loading" class="flex justify-center py-20">
            <div
              class="animate-spin rounded-full h-12 w-12 border-4 border-[#2E42B2] border-t-transparent"
            ></div>
          </div>

          <!-- CARD HI-FI DESKTOP -->
          <div
            v-else
            class="border border-[#2E42B2] rounded-[24px] bg-white p-10 shadow-sm relative"
          >
            <div class="flex justify-between items-start mb-6">
              <div class="flex-1 pr-10 min-w-0">
                <div class="flex items-center gap-4 mb-3">
                  <h2 class="text-[32px] font-extrabold text-[#2E42B2] uppercase">
                    {{ lomba.namaLomba }}
                  </h2>
                  <!-- Status tidak capslock -->
                  <span
                    class="px-5 py-1 rounded-full text-[12px] font-bold text-white shadow-sm"
                    :style="{ backgroundColor: getStatusStyle(lomba.status).bg }"
                  >
                    {{ getStatusLabel(lomba.status) }}
                  </span>
                </div>
                <p
                  class="text-[#2E42B2] text-[15px] leading-relaxed max-w-3xl font-medium opacity-90 whitespace-pre-line break-words"
                >
                  {{ lomba.deskripsi }}
                </p>
              </div>

              <!-- Tombol Aksi Kanan (Desktop) -->
              <div class="flex flex-col gap-3">
                <template v-if="userRole === 'KOORDINATOR_LOMBA'">
                  <button
                    @click="goToEdit"
                    :disabled="!lomba.isEditable"
                    class="w-48 py-3 rounded-xl font-bold text-sm transition shadow-md"
                    :class="
                      lomba.isEditable
                        ? 'bg-[#2E42B2] text-white hover:bg-blue-800 active:scale-95 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    "
                  >
                    Edit Lomba
                  </button>
                  <button
                    @click="openDeleteModal"
                    :disabled="!lomba.canDeleteLomba"
                    class="w-48 py-3 rounded-xl font-bold text-sm transition shadow-md"
                    :class="
                      lomba.canDeleteLomba
                        ? 'bg-[#2E42B2] text-white hover:bg-blue-800 active:scale-95 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    "
                  >
                    Hapus Lomba
                  </button>
                </template>

                <template v-else-if="userRole === 'PESERTA' || userRole === 'JURI'">
                  <button
                    :disabled="buttonStatus.disabled"
                    @click="handleButtonClick"
                    class="w-48 py-4 rounded-xl font-bold text-sm transition-all shadow-lg"
                    :class="[
                      buttonStatus.theme === 'success'
                        ? 'bg-[#AFF4C6] text-[#02542D] border border-[#02542D]'
                        : '',
                      buttonStatus.theme === 'warning'
                        ? 'bg-[#FFD88A] text-[#BF6A02] border border-[#BF6A02] active:scale-95'
                        : '',
                      buttonStatus.theme === 'blue' && !buttonStatus.disabled
                        ? 'bg-[#2E42B2] text-white active:scale-95 hover:bg-blue-800'
                        : '',
                      buttonStatus.disabled && buttonStatus.theme !== 'success'
                        ? 'bg-[#DEE8FB] text-[#2E42B2] shadow-none opacity-60'
                        : '',
                    ]"
                  >
                    {{ buttonStatus.text }}
                  </button>
                  <div class="mt-2 text-center w-48">
                    <p
                      v-if="buttonStatus.text === 'KUOTA PENUH'"
                      class="text-[11px] text-[#6D9BED] font-bold"
                    >
                      Maaf, seluruh gantangan sudah terisi.
                    </p>
                    <p
                      v-else-if="buttonStatus.text === 'RESERVASI DITUTUP'"
                      class="text-[11px] text-[#6D9BED] font-bold"
                    >
                      Batas waktu reservasi telah berakhir.
                    </p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Baris Waktu, Alamat & Toggle -->
            <div class="flex flex-wrap items-end gap-6 mb-10">
              <div class="flex flex-col gap-1.5">
                <span class="text-[13px] font-bold text-[#2E42B2] ml-1">Kelas:</span>
                <div
                  class="border border-[#2E42B2] rounded-xl px-4 py-3 flex items-center gap-3 bg-[#DEE8FB] min-w-[200px]"
                >
                  <Icon icon="ph:identification-badge-fill" class="w-5 h-5 text-[#2E42B2]" />
                  <span class="text-[13px] font-bold text-[#2D48C8]">{{ lomba.kelas }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <span class="text-[13px] font-bold text-[#2E42B2] ml-1">Alamat:</span>
                <div
                  class="border border-[#2E42B2] rounded-xl px-4 py-3 flex items-center gap-3 bg-[#DEE8FB] min-w-[260px]"
                >
                  <Icon icon="ph:map-pin-fill" class="w-5 h-5 text-[#2E42B2]" />
                  <span class="text-[13px] font-bold text-[#2D48C8]">{{ lomba.lokasi }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <span class="text-[13px] font-bold text-[#2E42B2] ml-1">Tanggal - Waktu:</span>
                <div
                  class="border border-[#2E42B2] rounded-xl px-4 py-3 flex items-center gap-3 bg-[#DEE8FB] min-w-[260px]"
                >
                  <Icon icon="ph:calendar-blank-fill" class="w-5 h-5 text-[#2E42B2]" />
                  <span class="text-[13px] font-bold text-[#2D48C8]">{{
                    formatWaktu(lomba.waktuTanggal)
                  }}</span>
                </div>
              </div>

              <div
                v-if="userRole === 'KOORDINATOR_LOMBA' && lomba.canToggleOngoing"
                class="flex items-center gap-3 pb-2.5 ml-4"
              >
                <button
                  @click="handleToggleStatus"
                  class="w-12 h-6 bg-gray-300 rounded-full relative transition-colors cursor-pointer"
                  :class="{ 'bg-[#5CB85C]': lomba.status === 'BERLANGSUNG' }"
                >
                  <div
                    class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform"
                    :class="{ 'translate-x-6': lomba.status === 'BERLANGSUNG' }"
                  ></div>
                </button>
                <span class="text-sm font-bold text-[#2E42B2]">Berlangsung</span>
              </div>
            </div>

            <!-- Desktop Juri (Sembunyikan Hadiah, Juri, CP, Harga) -->
            <div
              v-if="userRole === 'JURI'"
              class="bg-[#DEE8FB] border border-[#2E42B2]/20 rounded-[16px] p-8 grid grid-cols-3 gap-10"
            >
              <div>
                <p class="text-sm font-bold text-[#2E42B2] mb-1">Tersisa:</p>
                <p class="text-[15px] font-semibold text-[#2D48C8]">
                  {{ availableCount }} / {{ lomba.jumlahGantangan || 24 }}
                </p>
              </div>
              <div>
                <p class="text-sm font-bold text-[#2E42B2] mb-1">Jenis Burung:</p>
                <p class="text-[15px] font-semibold text-[#2D48C8] uppercase">
                  {{ lomba.jenisBurung?.replace(/_/g, ' ') }}
                </p>
              </div>
              <div>
                <p class="text-sm font-bold text-[#2E42B2] mb-1">Koordinator Lomba:</p>
                <p class="text-[15px] font-semibold text-[#2D48C8]">{{ lomba.contactPerson }}</p>
              </div>
            </div>

            <!-- Desktop Peserta, Admin, Koor Pend (Sembunyikan Juri) -->
            <div
              v-else
              class="bg-[#DEE8FB] border border-[#2E42B2]/20 rounded-[16px] p-8 grid grid-cols-4 gap-10"
            >
              <div>
                <p class="text-sm font-extrabold text-[#2E42B2] mb-3 uppercase tracking-wider">
                  Hadiah
                </p>
                <div class="text-[13px] font-bold text-[#2D48C8] space-y-2 italic">
                  <p v-for="(h, i) in lomba.hadiah" :key="i">
                    Juara {{ Number(i) + 1 }}: {{ formatHarga(h) }}
                  </p>
                </div>
              </div>
              <div class="space-y-6">
                <!-- Sembunyikan Jumlah Juri untuk role tertentu -->
                <div v-if="userRole === 'KOORDINATOR_LOMBA'">
                  <p class="text-sm font-extrabold text-[#2E42B2] mb-1">Jumlah Juri:</p>
                  <p class="text-[15px] font-semibold text-[#2D48C8]">
                    {{ lomba.jumlahJuri }} orang
                  </p>
                </div>
                <div>
                  <p class="text-sm font-extrabold text-[#2E42B2] mb-1">Narahubung:</p>
                  <p class="text-[15px] font-semibold text-[#2D48C8]">{{ lomba.contactPerson }}</p>
                </div>
              </div>
              <div class="space-y-6">
                <div>
                  <p class="text-sm font-extrabold text-[#2E42B2] mb-1">Tersisa:</p>
                  <p class="text-[15px] font-semibold text-[#2D48C8]">
                    {{ availableCount }} / {{ lomba.jumlahGantangan || 24 }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-extrabold text-[#2E42B2] mb-1">Harga Tiket:</p>
                  <p class="text-[15px] font-semibold text-[#2D48C8]">
                    {{ formatHarga(lomba.hargaTiket) }}
                  </p>
                </div>
              </div>
              <div class="space-y-6">
                <div>
                  <p class="text-sm font-bold text-[#2E42B2] mb-1">Jenis Burung:</p>
                  <p class="text-[15px] font-semibold text-[#2D48C8]">
                    {{ lomba.jenisBurung?.replace(/_/g, ' ') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- 2. LAYOUT MOBILE (Peserta & Juri di HP) -->
    <!-- ============================================================ -->
    <div v-else class="flex flex-col min-h-screen bg-white pb-32">
      <header_mobile title="Detail Lomba" @menu-click="isSidebarOpen = true" />

      <main class="p-6 overflow-y-auto">
        <transition name="fade">
          <div
            v-if="notification"
            :class="
              notificationType === 'success'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-red-100 text-red-800 border-red-300'
            "
            class="p-4 rounded-lg mb-6 text-sm font-bold flex items-center justify-between shadow-sm border"
          >
            <span>{{ notification }}</span>
            <button
              @click="notification = ''"
              class="text-current opacity-70 hover:opacity-100 cursor-pointer"
            >
              &times;
            </button>
          </div>
        </transition>

        <div v-if="loading" class="flex justify-center py-20">
          <div
            class="animate-spin rounded-full h-10 w-10 border-4 border-[#2E42B2] border-t-transparent"
          ></div>
        </div>

        <div v-else class="space-y-6">
          <!-- SEKSI JURI MOBILE -->
          <div
            v-if="userRole === 'JURI'"
            class="border-2 border-[#DEE8FB] rounded-[32px] p-6 shadow-sm space-y-6"
          >
            <div class="text-center space-y-2">
              <h2 class="text-[24px] font-extrabold text-[#2E42B2] uppercase leading-tight">
                {{ lomba.namaLomba }}
              </h2>
              <div class="flex justify-center">
                <!-- Status tidak capslock -->
                <span
                  class="inline-block px-5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                  :style="{ backgroundColor: getStatusStyle(lomba.status).bg }"
                >
                  {{ getStatusLabel(lomba.status) }}
                </span>
              </div>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <span class="text-[12px] font-bold text-[#2E42B2] ml-1">Kelas:</span>
                  <div
                    class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-2 text-[13px] font-bold text-[#1C244F] min-h-[48px]"
                  >
                    <Icon icon="ph:identification-badge-fill" class="w-5 h-5 text-[#2E42B2]" /><span
                      class="truncate"
                      >{{ lomba.kelas }}</span
                    >
                  </div>
                </div>
                <div class="space-y-1">
                  <span class="text-[12px] font-bold text-[#2E42B2] ml-1">Alamat:</span>
                  <div
                    class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-2 text-[11px] font-bold text-[#1C244F] min-h-[48px]"
                  >
                    <Icon icon="ph:map-pin-fill" class="w-5 h-5 text-[#2E42B2]" /><span
                      class="leading-tight"
                      >{{ lomba.lokasi }}</span
                    >
                  </div>
                </div>
              </div>
              <!-- Mobile Juri (Tambah Tanggal Waktu) -->
              <div class="space-y-1">
                <span class="text-[12px] font-bold text-[#2E42B2] ml-1">Tanggal - Waktu:</span>
                <div
                  class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[13px] font-bold text-[#1C244F]"
                >
                  <Icon icon="ph:calendar-blank-fill" class="w-5 h-5 text-[#2E42B2]" />
                  <span>{{ formatWaktu(lomba.waktuTanggal) }}</span>
                </div>
              </div>
            </div>

            <div
              class="bg-[#DEE8FB] border border-[#2E42B2] rounded-[24px] p-6 text-center shadow-inner"
            >
              <p class="text-[14px] text-[#2E42B2] font-bold flex flex-col items-center">
                <span class="tracking-wide">Tersisa</span>
                <span class="text-5xl font-extrabold my-1">{{ availableCount }}</span>
                <span class="text-[13px] opacity-80"
                  >dari {{ lomba.jumlahGantangan || 24 }} nomor gantangan</span
                >
              </p>
            </div>

            <div class="space-y-4">
              <div class="space-y-1">
                <span class="text-[12px] font-bold text-[#2E42B2] ml-1">Jenis Burung:</span>
                <div
                  class="bg-[#DEE8FB] border border-[#2E42B2] p-4 rounded-xl flex items-center gap-3 text-[14px] font-bold text-[#1C244F]"
                >
                  <Icon icon="ph:bird-fill" class="w-6 h-6 text-[#2E42B2]" /><span
                    class="uppercase"
                    >{{ lomba.jenisBurung?.replace(/_/g, ' ') }}</span
                  >
                </div>
              </div>
              <div class="space-y-1">
                <span class="text-[12px] font-bold text-[#2E42B2] ml-1">Koordinator Lomba:</span>
                <div
                  class="bg-[#DEE8FB] border border-[#2E42B2] p-4 rounded-xl flex items-center gap-3 text-[14px] font-bold text-[#1C244F]"
                >
                  <Icon icon="ph:user-focus-fill" class="w-6 h-6 text-[#2E42B2] shrink-0" /><span
                    class="leading-tight break-words"
                    >{{ lomba.contactPerson }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- SEKSI PESERTA MOBILE -->
          <div v-else class="space-y-6">
            <div class="border-2 border-[#DEE8FB] rounded-[24px] p-6 shadow-sm flex flex-col">
              <h2 class="text-[20px] font-bold text-[#2E42B2] mb-1">{{ lomba.namaLomba }}</h2>
              <div class="mb-3">
                <span
                  class="inline-block px-5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                  :style="{ backgroundColor: getStatusStyle(lomba.status).bg }"
                >
                  {{ getStatusLabel(lomba.status) }}
                </span>
              </div>
              <p
                v-if="lomba.deskripsi"
                class="text-[14px] text-[#2E42B2] font-normal leading-snug mb-5 whitespace-pre-line break-words"
              >
                {{ lomba.deskripsi }}
              </p>

              <div class="space-y-4">
                <div class="flex flex-col gap-1">
                  <span class="text-[12px] font-bold text-[#2E42B2]">Alamat:</span>
                  <div
                    class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[12px] font-semibold text-[#1C244F]"
                  >
                    <Icon icon="ph:map-pin-fill" class="w-5 h-5 text-[#2E42B2]" />
                    {{ lomba.lokasi }}
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[12px] font-bold text-[#2E42B2]">Tanggal - Waktu:</span>
                  <div
                    class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[12px] font-semibold text-[#1C244F]"
                  >
                    <Icon icon="ph:calendar-blank-fill" class="w-5 h-5 text-[#2E42B2]" />
                    {{ formatWaktu(lomba.waktuTanggal) }}
                  </div>
                </div>

                <!-- Mobile Peserta (Tambah Kelas, Jenis Burung, Harga) -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <span class="text-[12px] font-bold text-[#2E42B2] ml-1">Kelas:</span>
                    <div
                      class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-2 text-[13px] font-bold text-[#1C244F]"
                    >
                      <Icon
                        icon="ph:identification-badge-fill"
                        class="w-5 h-5 text-[#2E42B2]"
                      /><span class="truncate">{{ lomba.kelas }}</span>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <span class="text-[12px] font-bold text-[#2E42B2] ml-1">Jenis Burung:</span>
                    <div
                      class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-2 text-[13px] font-bold text-[#1C244F]"
                    >
                      <Icon icon="ph:bird-fill" class="w-5 h-5 text-[#2E42B2]" /><span
                        class="truncate uppercase"
                        >{{ lomba.jenisBurung?.replace(/_/g, ' ') }}</span
                      >
                    </div>
                  </div>
                </div>
                <!-- <div class="flex flex-col gap-1"><span class="text-[12px] font-bold text-[#2E42B2]">Harga Tiket:</span>
                  <div class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[14px] font-bold text-[#1C244F]">
                    <Icon icon="ph:tag-fill" class="w-5 h-5 text-[#2E42B2]" /> {{ formatHarga(lomba.hargaTiket) }}
                  </div>
                </div> -->
                <div
                  class="bg-[#DEE8FB] border border-[#2E42B2] rounded-[20px] p-5 text-center shadow-inner"
                >
                  <p class="text-[14px] text-[#2E42B2] font-bold flex flex-col items-center">
                    <span>Tersisa</span
                    ><span class="text-4xl font-extrabold my-0.5">{{ availableCount }}</span
                    ><span>dari {{ lomba.jumlahGantangan || 24 }} nomor gantangan</span>
                  </p>
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-[12px] font-bold text-[#2E42B2]">Harga Tiket:</span>
                  <div
                    class="bg-[#DEE8FB] border border-[#2E42B2] p-3 rounded-xl flex items-center gap-3 text-[14px] font-bold text-[#1C244F]"
                  >
                    <Icon icon="ph:tag-fill" class="w-5 h-5 text-[#2E42B2]" />
                    {{ formatHarga(lomba.hargaTiket) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Hadiah & Narahubung -->
            <div class="border-2 border-[#DEE8FB] rounded-[24px] p-6 space-y-6 shadow-sm">
              <div>
                <p class="text-[12px] font-bold text-[#2E42B2] mb-3 tracking-wider">
                  Daftar Hadiah:
                </p>
                <div class="text-[14px] text-blue-900 font-bold space-y-2 ml-2 italic">
                  <div
                    v-for="(h, i) in lomba.hadiah"
                    :key="i"
                    class="flex justify-between border-b border-blue-50 pb-1"
                  >
                    <span>Juara {{ Number(i) + 1 }}</span> <span>{{ formatHarga(h) }}</span>
                  </div>
                </div>
              </div>
              <div>
                <p class="text-[12px] font-bold text-[#2E42B2] mb-3 tracking-wider">Narahubung:</p>
                <div
                  class="bg-[#DEE8FB] border border-[#2E42B2] p-4 rounded-xl flex items-center gap-4 text-[14px] font-bold text-[#1C244F]"
                >
                  <Icon icon="ph:phone-fill" class="w-6 h-6 text-[#2E42B2]" />
                  {{ lomba.contactPerson }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- FIXED BOTTOM BAR MOBILE -->
      <div
        v-if="userRole === 'PESERTA' || userRole === 'JURI'"
        class="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] z-30"
      >
        <div class="max-w-md mx-auto text-center">
          <button
            :disabled="buttonStatus.disabled"
            @click="handleButtonClick"
            class="w-full py-4 rounded-xl font-bold text-lg shadow-lg"
            :class="[
              buttonStatus.theme === 'success'
                ? 'bg-[#AFF4C6] text-[#02542D] border border-[#02542D]'
                : '',
              buttonStatus.theme === 'warning'
                ? 'bg-[#FFD88A] text-[#BF6A02] border border-[#BF6A02] active:scale-95'
                : '',
              buttonStatus.theme === 'blue' && !buttonStatus.disabled
                ? 'bg-[#2E42B2] text-white active:scale-95 hover:bg-blue-800'
                : '',
              buttonStatus.disabled && buttonStatus.theme !== 'success'
                ? 'bg-[#DEE8FB] text-[#2E42B2] shadow-none opacity-60'
                : '',
            ]"
          >
            {{ buttonStatus.text }}
          </button>
          <div class="mt-3">
            <p
              v-if="buttonStatus.text === 'KUOTA PENUH'"
              class="text-[13px] text-[#6D9BED] font-medium"
            >
              Maaf, seluruh gantangan sudah terisi.
            </p>
            <p
              v-else-if="buttonStatus.text === 'RESERVASI DITUTUP'"
              class="text-[13px] text-[#6D9BED] font-medium"
            >
              Batas waktu reservasi telah berakhir.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- DRAWER SIDEBAR MOBILE -->
    <Teleport to="body">
      <Transition name="fade"
        ><div
          v-if="!isDesktop && isSidebarOpen"
          @click="isSidebarOpen = false"
          class="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
        ></div
      ></Transition>
      <Transition name="slide"
        ><div
          v-if="!isDesktop && isSidebarOpen"
          class="fixed inset-y-0 left-0 z-[70] w-64 shadow-2xl"
        >
          <Sidebar /></div
      ></Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="isDeleteModalOpen"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
        @click.self="closeDeleteModal"
      >
        <div
          class="bg-white rounded-2xl p-8 w-[360px] mx-4 shadow-lg border border-gray-200 font-plus-jakarta text-center"
        >
          <h3 class="text-xl font-bold text-[#2E42B2] mb-3">Hapus Lomba</h3>
          <p class="text-sm text-gray-600 mb-8 leading-relaxed">
            Apakah Anda yakin ingin menghapus <strong>{{ lomba?.namaLomba }}</strong
            >?
          </p>
          <div class="flex gap-3">
            <button
              @click="closeDeleteModal"
              class="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 py-2.5 rounded-xl bg-[#2E42B2] text-white text-sm font-semibold hover:bg-[#1c2d8f] transition-colors cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import Sidebar from '@/components/Sidebar.vue'
import header_mobile from '@/components/HeaderMobile.vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { getLombaDetail, updateLombaStatus, deleteLomba } from '@/services/lomba.service'

const { isDesktop } = useBreakpoint()
const route = useRoute()
const router = useRouter()
const lombaId = (route.params.id as string).replace(':', '')

const lomba = ref<any>({})
const loading = ref(true)
const isSidebarOpen = ref(false)
const isDeleteModalOpen = ref(false)

const notification = ref('')
const notificationType = ref<'success' | 'error'>('success')

const userStore = JSON.parse(localStorage.getItem('user') || '{}')
const userRole = computed(() => (userStore.role || 'CUSTOMER').toUpperCase())
const profileName = computed(() => userStore.fullName || 'User')
const userRoleLabel = computed(() => userStore.role?.replace(/_/g, ' ') || 'Role')

const availableCount = computed(() => {
  if (!lomba.value.listGantangan) return 0
  return lomba.value.listGantangan.filter((s: any) => s.status === 'AVAILABLE').length
})

const loadData = async () => {
  loading.value = true
  try {
    const data = await getLombaDetail(lombaId)

    // VALIDASI JURI
    if (userRole.value === 'JURI') {
      const isAssigned = data.listJuri?.some((j: any) => String(j.id) === String(userStore.id))
      if (!isAssigned) {
        alert('Kamu tidak ditugaskan sebagai juri pada lomba ini!')
        router.push('/katalog-lomba')
        return
      }
    }

    lomba.value = data
  } catch (e: any) {
    if (e.response?.status === 403) {
      alert('Kamu tidak ditugaskan sebagai juri pada lomba ini!')
    } else {
      alert('Lomba tidak ditemukan atau telah dihapus!')
    }
    router.push('/katalog-lomba')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// HANDLERS
const startJudging = () => router.push({ path: '/penjurian', query: { lombaId } })
const goToReservasi = () => router.push(`/reservasi/${lombaId}`)
const viewWinners = () => router.push(`/winner/${lombaId}`)
const goToEdit = () => router.push(`/edit-lomba/${lombaId}`)

const openDeleteModal = () => {
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
}

const confirmDelete = async () => {
  try {
    await deleteLomba(lombaId)
    closeDeleteModal()
    router.push('/katalog-lomba')
  } catch (e: any) {
    closeDeleteModal()
    if (e.response?.status === 400) {
      notification.value =
        e.response.data?.message || 'Lomba tidak dapat dihapus karena sudah ada peserta mendaftar.'
    } else {
      notification.value = 'Terjadi kesalahan sistem, gagal menghapus lomba.'
    }
    notificationType.value = 'error'
    setTimeout(() => (notification.value = ''), 5000)
  }
}

const handleToggleStatus = async () => {
  if (lomba.value.status !== 'BELUM_DIMULAI') return
  if (confirm('Apakah anda yakin ingin mengubah status lomba menjadi BERLANGSUNG?')) {
    try {
      await updateLombaStatus(lombaId, 'BERLANGSUNG')
      await loadData()
    } catch (e) {
      alert('Gagal memperbarui status')
    }
  }
}

// HELPERS
const getStatusStyle = (s: string) => {
  switch (s) {
    case 'BERLANGSUNG':
      return { bg: '#5CB85C' } // HIJAU
    case 'BELUM_DIMULAI':
      return { bg: '#FFB800' } // KUNING
    case 'SELESAI':
      return { bg: '#828282' } // ABU
    case 'DIBATALKAN':
      return { bg: '#D9534F' } // MERAH
    default:
      return { bg: '#DEE8FB' }
  }
}

// Title Case (Belum Dimulai)
const getStatusLabel = (status: string) => {
  if (!status) return ''
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

const buttonStatus = computed(() => {
  if (lomba.value.status === 'SELESAI') {
    return { text: 'LIHAT PEMENANG', disabled: false, theme: 'blue' };
  }

  if (userRole.value === 'JURI') {
    if (lomba.value.status === 'SELESAI')
      return { text: 'LIHAT PEMENANG', disabled: false, theme: 'blue' }
    const isAssigned = lomba.value.listJuri?.some((j: any) => j.id === userStore.id) || false
    const canScore = lomba.value.status === 'BERLANGSUNG' && isAssigned
    return {
      text: canScore ? 'MULAI PENILAIAN' : 'PENILAIAN BELUM DIBUKA',
      disabled: !canScore,
      theme: 'blue',
    }
  }

  const resStatus = lomba.value.userBookingStatus
  if (resStatus === 'PAID') return { text: 'SUDAH TERDAFTAR', disabled: true, theme: 'success' }
  if (resStatus === 'BOOKED' || resStatus === 'MENUNGGU_KONFIRMASI')
    return { text: 'LANJUTKAN PEMBAYARAN', disabled: false, theme: 'warning' }

  if (lomba.value.status !== 'BELUM_DIMULAI' || !lomba.value.isReservable)
    return { text: 'RESERVASI DITUTUP', disabled: true, theme: 'disabled' }
  if (availableCount.value === 0) return { text: 'KUOTA PENUH', disabled: true, theme: 'disabled' }

  return { text: 'RESERVASI LOMBA', disabled: false, theme: 'blue' }
})

const handleButtonClick = () => {
  if (buttonStatus.value.disabled) return
  const resStatus = lomba.value.userBookingStatus
  if (resStatus === 'BOOKED' || resStatus === 'MENUNGGU_KONFIRMASI') {
    router.push(`/pembayaran/${lomba.value.userReservationId}`)
  } else if (lomba.value.status === 'SELESAI') {
    router.push(`/winner/${lombaId}`)
  } else if (userRole.value === 'JURI') {
    router.push({ path: '/penjurian', query: { lombaId } })
  } else {
    router.push(`/reservasi/${lombaId}`)
  }
}

const formatHarga = (v: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(v)
const formatWaktu = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${m[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()} - Jam ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')}`
}

const isDesktopRole = computed(() => {
  return ['ADMIN', 'KOORDINATOR_LOMBA', 'KOORDINATOR_PENDAFTARAN'].includes(userRole.value)
})
</script>

<style scoped>
.font-plus-jakarta {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
main::-webkit-scrollbar {
  display: none;
}
</style>
