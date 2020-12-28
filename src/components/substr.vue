<template lang="pug">
span
  template(v-if="token")
    template(v-if="text.length > 6")  {{ text.substring(0, 4) }} ..
    template(v-else) {{text}}
  template(v-else-if="text.length > 6") {{ text.substring(0, 6) }} ... {{ text.substring(text.length - 6, text.length) }}
  template(v-else) {{text}}
</template>
<script>

export default {
  name: "Substr",
  props: {
    text: {
      type: String,
      default: "",
    },
    token: {
      type: Boolean,
      default: false,
    },
  }
};
</script>