<template lang="pug">
a(:href="`${chainLink}/txs/${text}?lang=${local}`")
  slot
    template(v-if="substr") {{ text.substring(0, 4) }} ... {{ text.substring(text.length - 4, text.length) }}
    template(v-else) {{ text }}
</template>
<script>
import { mapState } from "vuex";

export default {
  name: "Hash",
  props: {
    text: {
      type: String,
      default: "",
    },
    substr: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(["chainLink", "local"]),
  },
};
</script>