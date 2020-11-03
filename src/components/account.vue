<template lang="pug">
a(:href="`${chainLink}/account/${text}`")
  slot
    template(v-if="substr") {{ text.substring(0, 6) }} ... {{ text.substring(text.length - 6, text.length) }}
    template(v-else) {{ text }}
</template>
<script>
import { mapState } from "vuex";

export default {
  name: "Account",
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
    ...mapState(["chainLink"]),
  },
};
</script>