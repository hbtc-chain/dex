<template lang="pug">
.card
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
  border-radius: 10px;
  margin: 0 0 @grid;
  background: #fff;
  padding: 3 * @grid 2 * @grid 2 * @grid;
  position: relative;

  .title {
    color: @gray-500;
    padding-bottom: 0.5 * @grid;
  }

  .value {
    font-weight: 700;
    font-size: 26px;
    line-height: 5 * @grid;
  }

  .more {
    position: absolute;
    right: 2 * @grid;
    top: 3 * @grid;
  }
}
</style>