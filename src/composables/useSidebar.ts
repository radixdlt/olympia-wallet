import { ref, computed, ComputedRef } from 'vue'

const sidebarOpen = ref(false)

interface useSidebarInterface {
  open: ComputedRef<boolean>;
  setState: (value: boolean) => void;
}

export default function useSidebar (): useSidebarInterface {
  return {
    open: computed(() => sidebarOpen.value),
    setState (value: boolean) {
      sidebarOpen.value = value
    }
  }
}
