<template lang="pug">
Modal.process(
  v-model="visible",
  position="bottom",
  :title="$lang('scan.transactions.account')",
  :style="objectStyle"
)
  .address.copy(:data-clipboard-text="address")
    span {{ address }}
    Icon(name="copy", size="24")

  template(v-if="hashList.length")
    .title {{ $lang('head.latestTransactions') }}
    .list
      Hash.item(:text="item.hash", v-for="item in hashList", :key="item.hash")
        .type(v-if="item.result") {{ $lang(`head.${item.result.activities[0].type}`) }}
          .tag.tag-success(v-if="item.result.success") {{ $lang('head.success') }}
          .tag.tag-failed(v-else) {{ $lang('head.failed') }}
          .time {{ date(item.createdAt) }}
        .tag(v-else) {{ $lang('head.processing') }}
        .hash
          Substr(:text="item.hash")
          Icon(name="arrowright", size="16")
    van-button(size="small", @click="clearAll") {{ $lang('head.clearAll') }}
  .noData(v-else) {{ $lang('head.noData') }}
</template>

<script>
import ClipboardJS from "clipboard";
import { mapState, mapActions } from "vuex";

export default {
  name: "process",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    value(val) {
      this.visible = val;
    },
    visible() {
      this.$emit("input", this.visible);
    },
  },
  computed: {
    ...mapState(["hashList", "address", "delay"]),
    objectStyle() {
      return {
        height: `${this.hashList.length * 65 + 200}px`,
      };
    },
  },
  methods: {
    ...mapActions(["setState"]),
    clearAll() {
      this.setState({ hashList: [] });
      localStorage.removeItem(this.address);
    },
    date(time) {
      return new Date(time).format();
    },
  },
  data() {
    return {
      visible: this.value,
    };
  },
  created() {
    const clipboard = new ClipboardJS(".copy");
    clipboard.on("success", () => {
      this.$tips({
        content: this.$lang("head.copy"),
        closeable: true,
        type: "success",
        time: this.delay.standard,
      });
    });
  },
};
</script>
<style scoped lang="less">
@import "../libs/mixin";

.process {
  max-height: 80%;
  .address {
    background: @gray-50;
    border-radius: @grid;
    padding: @grid @grid*2;
    display: flex;
    color: @gray-700;
    align-items: center;
    justify-content: space-between;
    margin: 0 10px;
    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    i {
      width: 24px;
    }
  }
  .list {
    top: 140px;
    bottom: 6.5 * @grid;
    position: absolute;
    left: 10px;
    right: 10px;
    overflow: hidden;
    will-change: transform;
    direction: ltr;
    overflow-y: scroll;
    border-bottom: 1px solid @gray-100;
    border-top: 1px solid @gray-100;
  }
  .title {
    margin: 2 * @grid 10px 0;
    color: @gray-700;
    font-weight: 500;
  }
  .noData {
    padding-top: 4 * @grid;
    text-align: center;
    color: @gray-500;
  }
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid @gray-100;
    padding: @grid 0;
    min-height: 6 * @grid;
    &:last-child{
      border: none;
    }
  }
  .time {
    font-size: 12px;
    padding-top: 0.5 * @grid;
  }
  .van-button {
    background: fade(@primary-main, 10);
    color: @primary-main;
    position: absolute;
    bottom: @grid;
    right: @grid;
    min-width: 120px;
    height: 4 * @grid;
  }
  a {
    color: @gray-500;
  }
  .tag {
    display: inline-block;
    background: @gray-50;
    padding: 2px 6px;
    color: @gray-700;
    font-size: 12px;
    line-height: 16px;
    border-radius: 10px;
    &-success {
      margin-left: 0.5 * @grid;
      background: fade(@green, 60);
    }
    &-failed {
      margin-left: 0.5 * @grid;
      background: fade(@error, 60);
    }
  }
}
</style>
