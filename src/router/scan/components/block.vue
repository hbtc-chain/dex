<template lang="pug">
.block
  .title
    slot(name="title")
      | {{ title }}
  slot
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
  },
};
</script>
<style scoped lang="less">
@import "../../../libs/mixin";
.block {
  box-shadow: 0px 0px 12px rgba(31, 93, 193, 0.16);
  border-radius: @grid;
  margin: 0 0 2 * @grid;
  background: #fff;
  padding: @grid;

  .title {
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    padding: 2 * @grid @grid;
    span {
      margin-right: 3 * @grid;
      cursor: pointer;
    }
  }
}
</style>