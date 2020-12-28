<template lang="pug">
.card
  .card-wrap
    .title {{ title }}
    .value
      slot
    .more
      slot(name="more")
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

.card {
  box-shadow: 0px 0px 12px rgba(31, 93, 193, 0.16);
  border-radius: @grid;
  margin: 0 0 @grid;
  background: #fff;
  height: 102px;
  display: flex;
  align-items: center;

  &-wrap {
    position: relative;
    padding: 0 2 * @grid;
    flex: 1;
  }

  .title {
    color: @gray-500;
  }

  .value {
    padding-top: @grid;
    font-weight: 700;
    font-size: 20px;
    line-height: 3 * @grid;
    color: @gray-700;
  }

  .more {
    position: absolute;
    right: 2 * @grid;
    top: 3 * @grid;
  }
}
</style>