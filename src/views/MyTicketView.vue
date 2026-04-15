<template>
  <div class="min-h-screen bg-[#F4F7FE] font-plus-jakarta">
    <header_mobile title="My Ticket" />

    <main class="mx-auto w-full max-w-md px-5 py-6">
      <section class="rounded-3xl border border-[#D9E3FF] bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF0FF] text-[#2E42B2] font-black">T</div>
          <div>
            <h1 class="text-xl font-extrabold text-[#2E42B2]">Tiket Saya</h1>
            <p class="text-sm text-slate-500">Ringkasan reservasi terakhir</p>
          </div>
        </div>

        <div v-if="ticket" class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <span class="text-slate-500">Reservasi ID</span>
            <span class="font-semibold text-slate-800 text-right break-all">{{ ticket.reservasiId }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-slate-500">Lomba</span>
            <span class="font-semibold text-slate-800 text-right">{{ ticket.lombaId }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-slate-500">Nomor Gantangan</span>
            <span class="font-semibold text-slate-800 text-right">{{ ticket.nomorGantangan }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-slate-500">Status</span>
            <span class="font-bold text-[#2E42B2] text-right">{{ ticket.status }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-slate-500">Nominal</span>
            <span class="font-bold text-[#2E42B2] text-right">{{ formatCurrency(ticket.nominal) }}</span>
          </div>
        </div>

        <div v-else class="rounded-2xl bg-[#F7FAFF] p-5 text-center text-sm text-slate-600">
          Belum ada tiket yang tersimpan.
        </div>

        <button class="mt-6 w-full rounded-xl bg-[#2E42B2] py-3.5 text-sm font-bold text-white" @click="goBackToCatalog">
          Kembali ke Katalog
        </button>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import header_mobile from '@/components/HeaderMobile.vue';
import { getLastTicket } from '@/services/reservasi.service';

const router = useRouter();
const ticket = computed(() => getLastTicket() as null | {
  reservasiId: string;
  lombaId: string;
  nomorGantangan: string;
  nominal: number;
  status: string;
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value ?? 0);

const goBackToCatalog = () => {
  router.push({ name: 'katalog-lomba' });
};
</script>
