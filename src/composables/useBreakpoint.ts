import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoint() {
  const isDesktop = ref(window.innerWidth >= 768)

  function update() {
    isDesktop.value = window.innerWidth >= 768
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { isDesktop }
}
