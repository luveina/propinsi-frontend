<script setup lang="ts">
// Placeholder — seluruh implementasi diserahkan ke PBI-17
// Route params: id (ID reservasi/tiket)
</script>

<template>
  <!-- Header sudah dihandle AppLayout -->
  <div class="flex flex-col items-center justify-center gap-6 bg-[#f9fafb] min-h-full px-5 py-10 font-plus-jakarta">

    <!-- Placeholder box -->
    <div class="self-stretch rounded-[12px] bg-[#dee8fb] border-2 border-dashed border-[#2e42b2] flex flex-col items-center justify-center gap-3 p-10">
      <span class="text-4xl">📤</span>
      <span class="text-lg font-bold text-[#2e42b2] text-center">Upload Bukti Pembayaran</span>
      <span class="text-sm text-[#374151] text-center leading-relaxed">
        Halaman ini sedang dikerjakan (PBI-17).<br />
        <!-- Ticket ID: <b>{{ $route.params.id }}</b> -->
      </span>
    </div>

    <!-- Kembali -->
    <router-link
      :to="{ name: 'MyTickets' }"
      class="self-stretch rounded-[6px] bg-[#2e42b2] flex items-center justify-center py-[13px] px-6 cursor-pointer active:opacity-85 transition-opacity no-underline"
    >
      <b class="text-base tracking-[0.2px] leading-6 text-white">← Kembali ke Tiket Saya</b>
    </router-link>

  </div>
</template>
