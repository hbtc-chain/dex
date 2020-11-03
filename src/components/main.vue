<template lang="pug">
.container
  .main
    .tabs(v-if="showTabs")
      router-link(to="/swap") {{ $lang('tabs.swap') }}
      router-link(to="/trade") {{ $lang('tabs.trade') }}
      router-link(to="/pool") {{ $lang('tabs.pool') }}
    .content
      slot
  slot(name="more")
</template>

<script>
export default {
  name: "Main",
  props: {
    showTabs: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";

.container {
  max-width: 640px;
  margin: 0 auto;
  padding-bottom: 2 * @grid;
}
.main {
  box-shadow: 0px 0px 12px rgba(31, 93, 193, 0.16);
  border-radius: 6px;
  margin: 0 @space;
  background: #fff;
  position: relative;
  z-index: 2;
}

.content {
  padding: 3 * @grid @space 2 * @grid;
}

.tabs {
  display: flex;
  box-shadow: 0px 1px 0px @gray-100;
  margin-bottom: 1px;
  a {
    display: flex;
    flex: 1;
    height: 8 * @grid;
    align-items: center;
    justify-content: center;
    font-size: 2 * @grid;
    background: linear-gradient(0deg, #f9f9fb, #f9f9fb), #f4f7ff;
    color: @gray-500;

    &.router-link-active {
      background: #fff;
      color: @gray-900;
    }
  }
}
</style>
