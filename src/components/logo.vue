<template lang="pug">
span.van-logos
  van-image(
    round,
    :width="size",
    :height="size",
    :src="logo(item)",
    v-for="(item, index) in tokens",
    :key="`${item}${index}`",
    :style="{ 'margin-left': `-${size / 2}px` }"
  )
</template>
<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["tokensMap"]),
  },
  name: "Logo",
  props: {
    tokens: {
      type: Array,
      default() {
        return [];
      },
    },
    size: {
      type: [String, Number],
      default: 24,
    },
  },
  methods: {
    logo(token) {
      if (token) {
        return this.tokensMap[token].logo;
      }
      return "";
    },
  },
};
</script>