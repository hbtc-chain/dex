<template lang="pug">
van-popup.modal(
  v-model="visible",
  :safe-area-inset-bottom="false",
  :position="mini ? position : 'center'",
  round,
  :class="{ border: !mini }"
)
  .title
    .lable {{ title }}
    .value(@click="visible = false")
      van-icon(name="cross")
  slot
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      default: "center",
    },
    title: {
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapState(["mini"]),
  },
  data() {
    return {
      visible: this.value,
    };
  },
  watch: {
    value(val) {
      this.visible = val;
    },
    visible() {
      this.$emit("input", this.visible);
    },
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.modal {
  max-width: 600px;
  width: 100%;

  .title {
    position: relative;
    line-height: 3 * @grid;
    padding: 2 * @grid @space;
    font-weight: 500;
    font-size: 20px;
    .value {
      position: absolute;
      right: 0;
      top: 0;
      line-height: 7 * @grid;
      padding: 0 @space;
    }
  }
}

.border {
  border: 8px solid #fff;
}

.van-popup--round {
  border-radius: 6px;
}
.van-popup--bottom {
  border-radius: 6px 6px 0 0;
}

.van-popup--top {
  border-radius: 0 0 6px 6px;
}
</style>
