<template lang="pug">
.alert(:class="classes")
  Icon(:name="icon", size="24", v-if="icon")
  slot
</template>
<script>
export default {
  name: "Alert",
  props: {
    type: {
      validator(value) {
        return ["info", "error"].indexOf(value) > -1;
      },
      default: "info",
    },
    icon: {
      type: String,
      default: "",
    },
  },

  computed: {
    classes() {
      const classSet = new Set();
      classSet.add(`alert-${this.type}`);

      if (this.icon) {
        classSet.add(`alert-icon`);
      }
      return Array.from(classSet);
    },
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.alert {
  font-size: 13px;
  line-height: 19px;
  border-radius: 4px;
  padding: @grid 1.5 * @grid;
  position: relative;
  margin-bottom: 2 * @grid;
  &-info {
    background: fade(@primary-main, 10%);
    color: @primary-main;
  }
  &-error {
    background: fade(@error, 20%);
    color: @error;
  }

  &-icon {
    padding-left: 5 * @grid;
  }
  .swap-icon {
    position: absolute;
    left: @grid;
    top: @grid*0.5;
  }
}
</style>
