<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  status: string
  sort: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'update:status', val: string): void
  (e: 'update:sort', val: string): void
}>()

const localStatus = ref(props.status)
const localSort = ref(props.sort)

watch(() => props.status, (val) => { localStatus.value = val })
watch(() => props.sort, (val) => { localSort.value = val })

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Unpaid', label: 'Unpaid' },
  { value: 'Menunggu Konfirmasi', label: 'Menunggu Konfirmasi' },
  { value: 'Invalid', label: 'Invalid' },
  { value: 'Expired', label: 'Expired' },
]

const sortOptions = [
  { value: 'oldest', label: 'Oldest' },
  { value: 'newest', label: 'Newest' },
]

function close() {
  emit('update:modelValue', false)
}

function clearFilter() {
  localStatus.value = 'all'
  localSort.value = 'newest'
}

function saveFilter() {
  emit('update:status', localStatus.value)
  emit('update:sort', localSort.value)
  close()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/35 z-[1000] flex items-end justify-center"
      @click.self="close"
    >
      <div class="w-full max-w-[430px] rounded-t-[20px] bg-white overflow-hidden flex flex-col items-center px-[15px] pt-[15px] pb-8 gap-[15px] font-plus-jakarta">

        <b class="text-[28px] leading-[34px] text-[#2e42b2]">Filters</b>

        <!-- Status Tiket -->
        <div class="self-stretch flex flex-col items-start gap-[10px]">
          <span class="text-base font-semibold text-[#2e42b2] leading-6">Status Tiket</span>
          <div class="flex flex-wrap items-start gap-[10px]">
            <div
              v-for="opt in statusOptions"
              :key="opt.value"
              :class="[
                'rounded-[15px] flex items-center justify-center py-2 px-[15px] cursor-pointer transition-colors',
                localStatus === opt.value
                  ? 'bg-[#2e42b2] text-[#dee8fb]'
                  : 'bg-[#dee8fb] border border-[#2e42b2] text-[#2e42b2] hover:bg-[#c7d7f5]'
              ]"
              @click="localStatus = opt.value"
            >
              <span class="text-sm font-medium tracking-[0.2px] leading-6">{{ opt.label }}</span>
            </div>
          </div>
        </div>

        <!-- Sort By -->
        <div class="self-stretch flex flex-col items-start gap-[10px]">
          <span class="text-base font-semibold text-[#2e42b2] leading-6">Sort By</span>
          <div class="flex flex-wrap items-start gap-[10px]">
            <div
              v-for="opt in sortOptions"
              :key="opt.value"
              :class="[
                'rounded-[15px] flex items-center justify-center py-2 px-[15px] cursor-pointer transition-colors',
                localSort === opt.value
                  ? 'bg-[#2e42b2] text-[#dee8fb]'
                  : 'bg-[#dee8fb] border border-[#2e42b2] text-[#2e42b2] hover:bg-[#c7d7f5]'
              ]"
              @click="localSort = opt.value"
            >
              <span class="text-sm font-medium tracking-[0.2px] leading-6">{{ opt.label }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="self-stretch flex items-end justify-center gap-[10px] h-[51px]">
          <div
            class="flex-1 rounded-[6px] bg-[#d2d5db] flex items-center justify-center py-[13px] px-6 cursor-pointer active:opacity-80 transition-opacity"
            @click="clearFilter"
          >
            <b class="text-sm tracking-[0.2px] leading-6 text-[#394050]">Hapus Filter</b>
          </div>
          <div
            class="flex-1 rounded-[6px] bg-[#2e42b2] flex items-center justify-center py-[13px] px-6 cursor-pointer active:opacity-85 transition-opacity"
            @click="saveFilter"
          >
            <b class="text-sm tracking-[0.2px] leading-6 text-white">Simpan Filter</b>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
