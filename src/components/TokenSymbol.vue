<template>
  <a
    :href="rriUrl"
    target="_blank"
    class="group cursor-pointer relative"
  >
    <div class="font-light text-rGrayMark bg-rGrayLight border border-rGray py-0.5 px-1 rounded borderself-end uppercase">
      <slot name="symbol"></slot>
      <div class="absolute invisible group-hover:visible -mt-full bg-rGrayLightest text-rBlack bottom-full text-xs p-1 rounded-sm shadow border border-solid border-rGrayLight">
        <slot name="hoverText"></slot>
      </div>
    </div>
  </a>
</template>

<script lang="ts">
import { useWallet } from '@/composables'
import { ExecutedStakeTokensAction } from '@radixdlt/application'
import { Token } from '@radixdlt/networking'
import { computed, defineComponent, PropType } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  props: {
    // rriUrl: {
    //   type: String,
    //   required: true
    // }
    // token: {
    //   type: Object as PropType<ExecutedStakeTokensAction | Token>,
    //   required: false
    // },
    symbol: {
      type: String,
      required: true
    },
    rri: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const router = useRouter()
    const { explorerUrlBase } = useWallet(router)

    const rriUrl = computed(() => {
      return `${explorerUrlBase}/${props.rri}` // todo: fix alex's thing
    })

    return {
      rriUrl
    }
  }
})
</script>
