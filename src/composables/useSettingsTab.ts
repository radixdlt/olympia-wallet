import { ref, Ref } from 'vue'

const activeTab = ref('password')

const setTab = (val: string) => {
  activeTab.value = val
}

interface useSettingsTabInterface {
  readonly activeTab: Ref<string>;
  setTab: (val: string) => void;
}

export default function useSettingsTab (): useSettingsTabInterface {
  return {
    activeTab,
    setTab
  }
}
