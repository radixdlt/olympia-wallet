import { ref, Ref } from 'vue'

const modal: Ref<string | null> = ref(null)

interface useHomeModalInterface {
  readonly modal: Ref<string | null>;
  setModal: (val: string | null) => void;
}

export default function useHomeModal (): useHomeModalInterface {
  return {
    modal,
    setModal: (val: string | null) => {
      modal.value = val
    }
  }
}
