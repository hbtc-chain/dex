<template lang="pug">
van-popup.modal(
  v-model="visible",
  :safe-area-inset-bottom="false",
  :position="clientWidth <= 560 ? position : 'center'",
  round,
  :class="{ position: !mini }",
  get-container="#app"
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
    ...mapState(["mini", "clientWidth"]),
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
  max-width: 516px;
  width: 100%;
  border: 1.5 * @grid solid #fff;
  .title {
    position: relative;
    line-height: 3 * @grid;
    padding: 2 * @grid @space;
    font-weight: 500;
    font-size: 20px;
    text-align: center;
    .value {
      position: absolute;
      right: 0;
      top: 0;
      line-height: 7 * @grid;
      padding: 0 @space;
    }
  }
}

@media (max-width: 560px) {
  .modal {
    border-width: 0;
  }
}

.position {
  margin-left: 17.5 * @grid;
}

.van-popup--round {
  border-radius: @grid !important;
}
.van-popup--bottom {
  border-radius: 6px 6px 0 0 !important;
}

.van-popup--top {
  border-radius: 0 0 6px 6px !important;;
}
</style>
