<template lang="pug">
.form-item
  .label-item
    .label {{ lable }}
    .tips
      slot(name="tips") {{ tips }}
  slot
</template>

<script>
export default {
  name: "formItem",
  props: {
    lable: {
      type: String,
      default: "",
    },
    tips: {
      type: String,
      default: "",
    },
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.form-item {
  padding-bottom: 3 * @grid;
  .label-item {
    line-height: 22px;
    padding-bottom: 0.5 * @grid;
    display: flex;
    justify-content: space-between;
    .label {
      color: @gray-700;
      font-size: 15px;
    }
    .tips {
      color: @gray-500;
      font-size: 13px;
      display: flex;
      align-items: center;
    }
  }
}
</style>
