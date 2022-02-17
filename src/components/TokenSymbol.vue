<template>
  <a
    :href="rriUrl"
    target="_blank"
    class="group cursor-pointer relative font-light text-rGrayMark py-0.5 px-1 rounded borderself-end uppercase"
    :class="{'bg-rGrayLight border border-rGray': hasGreyBackground}"
  >
    {{ symbol }}
    <div class="absolute invisible group-hover:visible -mt-full bg-rGrayLightest text-rBlack bottom-full text-xs p-1 rounded-sm shadow border border-solid border-rGrayLight">
      {{ rri }}
    </div>
  </a>
</template>

<script lang="ts">
import { useWallet } from '@/composables'
import { computed, defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  props: {
    symbol: {
      type: String,
      required: true
    },
    rri: {
      type: String,
      required: true
    },
    hasGreyBackground: {
      type: Boolean,
      required: true
    }
  },

  setup (props) {
    const router = useRouter()
    const { explorerUrlBase } = useWallet(router)

    const rriUrl = computed(() => {
      return `${explorerUrlBase.value}#/tokens/${props.rri}`
    })

    return {
      rriUrl
    }
  }
})
</script>
