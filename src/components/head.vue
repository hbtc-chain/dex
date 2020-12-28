<template lang="pug">
div
  .head
    .left
      router-link(to="/")
        img(src="@/assets/logo_w.png")
    .menu
      van-button(
        size="small",
        v-if="processNumber",
        @click="processWin = true"
      )
        van-loading.color-gray500(size="20")
        .number {{ processNumber }}
      van-button(
        size="small",
        v-else-if="hashList.length",
        @click="processWin = true"
      )
        van-icon(name="underway-o", size="20")
      Icon(
        name="menus",
        size="24",
        @click="menuStatus = true",
      )
  Modal.process-list(
    v-model="processWin",
    position="bottom",
    :title="$lang('head.latestTransactions')",
    :style="objectStyle"
  )
    .list
      van-cell-group
        van-cell(
          is-link,
          v-for="item in hashList",
          :key="item.hash",
          :label="date(item.createdAt)",
          center
        )
          Hash(:text="item.hash", substr)
          template(#title)
            template(v-if="item.result") {{ $lang(`head.${item.result.activities[0].type}`) }}
              .tag.tag-success(v-if="item.result.success") {{ $lang('head.success') }}
              .tag.tag-failed(v-else) {{ $lang('head.failed') }}
            .tag(v-else) {{ $lang('head.processing') }}
    van-button(size="small", icon="delete", @click="clearAll") {{ $lang('head.clearAll') }}

  van-popup.popup(
    v-model="menuStatus",
    position="left",
    style="height: 100%",
    :overlay="mini"
  )
    Menu(@click="menuStatus = false")
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Head",
  computed: {
    ...mapState(["hashList", "local", "mini"]),

    objectStyle() {
      return {
        height: `${this.hashList.length * 66 + 100}px`,
      };
    },
    processNumber() {
      return this.hashList.filter((el) => !el.result).length;
    },
  },
  methods: {
    ...mapActions(["setState"]),
    clearAll() {
      this.processWin = false;
      this.setState({ hashList: [] });
      localStorage.removeItem("hashList");
    },
    date(time) {
      return new Date(time).format();
    },
  },
  data() {
    return {
      processWin: false,
      menuStatus: false,
    };
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.head {
  height: 6 * @grid;
  padding: 2 * @grid;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 528px;
  margin: 0 auto;
  .left {
    display: flex;
    align-items: center;
    img {
      height: 3 * @grid;
    }
  }
  .menu {
    display: flex;
    align-content: center;
    .number {
      background: @error;
      color: @white;
      position: absolute;
      top: 0;
      right: 0;
      box-sizing: border-box;
      min-width: 16px;
      padding: 0 3px;
      font-weight: 500;
      font-size: 12px;
      font-family: -apple-system-font, Helvetica Neue, Arial, sans-serif;
      line-height: 1.2;
      text-align: center;
      border-radius: 16px;
      transform: translate(50%, -50%);
      transform-origin: 100%;
    }
    .swap-icon {
      margin-left: 2 * @grid;
      color:@white
    }
  }
  h2 {
    padding-left: 2 * @grid;
    font-size: 2.5 * @grid;
    font-weight: 500;
  }
}
.process-list {
  max-height: 80%;
  .list {
    top: 60px;
    bottom: 5 * @grid;
    position: absolute;
    width: 100%;
    overflow: hidden;
    will-change: transform;
    direction: ltr;
    overflow-y: scroll;
  }
  .van-button {
    position: absolute;
    bottom: @grid*0.5;
    right: @grid;
  }
  a {
    color: @primary-main;
  }
  .tag {
    display: inline-block;
    background: @gray-50;
    padding: 2px 6px;
    color: @gray-500;
    font-size: 12px;
    line-height: 16px;
    border-radius: 2px;
    &-success {
      margin-left: 0.5 * @grid;
      background: @green;
      color: #fff;
    }
    &-failed {
      margin-left: 0.5 * @grid;
      background: @error;
      color: #fff;
    }
  }
}
</style>
