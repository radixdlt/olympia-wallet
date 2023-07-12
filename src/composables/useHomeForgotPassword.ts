import { ref, Ref } from 'vue'
type modeOptions = 'choice' | 'create' | 'restore'

const mode: Ref<modeOptions> = ref('choice')

interface useHomeForgotInterface {
  readonly mode: Ref<modeOptions>;
  setMode: (val: modeOptions) => void;
}

export default function useHomeForgotPassword (): useHomeForgotInterface {
  const setMode = (newMode: modeOptions) => { mode.value = newMode }
  return {
    mode,
    setMode
  }
}
