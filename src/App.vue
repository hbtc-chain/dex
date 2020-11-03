<template lang="pug">
#app
  Head
  router-view
  Modal(
    v-model="win",
    position="top",
    :title="$lang('swap.transactionSettings')"
  )
    .settings
      FormItem(:lable="$lang('swap.slippageTolerance')")
        van-row(:gutter="8")
          van-col(span="9")
            van-field(v-model="config.slippageTolerance", type="number")
              template(#extra) %
          van-col(v-for="item in [0.1, 0.5, 1]", span="5", :key="item")
            van-button(
              block,
              :type="config.slippageTolerance == item ? 'info' : 'default'",
              @click="config.slippageTolerance = item"
            ) {{ item }}%
      FormItem(:lable="$lang('swap.transactionDeadline')")
        van-row(:gutter="8", type="flex", align="center")
          van-col(span="9")
            van-field(v-model="config.transactionDeadline", type="number")
          van-col(span="15") {{ $lang('swap.minutes') }}
</template>

<script>
import { mapState, mapActions } from "vuex";
import Head from "@/components/head.vue";
import FormItem from "@/components/formItem.vue";

export default {
  computed: {
    ...mapState(["config", "configWin", "hashList", "delay"]),
  },
  components: {
    Head,
    FormItem,
  },
  data() {
    return {
      win: false,
      slippageTolerance: 0.1,
      transactionDeadline: 20,
    };
  },
  watch: {
    configWin() {
      if (this.win !== this.configWin) {
        this.win = this.configWin;
      }
    },
    win() {
      this.setState({ configWin: this.win });
    },
  },
  methods: {
    ...mapActions(["wallteInit", "setState", "pushTxs"]),
    resize() {
      this.setState({ mini: document.documentElement.clientWidth < 640 });
    },
    getTxs(hash) {
      this.$axios.get(`/api/v1/txs/${hash}`).then((result) => {
        if (result.code === 0) {
          this.pushTxs(result);
          this.$tips({
            content: [
              this.$lang(`head.${result.data.activities[0].type}`),
              this.$lang(result.data.success ? "head.success" : "head.failed"),
            ].join(':'),
            closeable: true,
            type: result.data.success ? "success" : "error",
          });
        }
      });
    },
  },
  created() {
    this.wallteInit();
    this.resize();
    window.addEventListener("resize", this.resize);
    setInterval(() => {
      this.hashList.forEach((el) => {
        if (!el.result) {
          this.getTxs(el.hash);
        }
      });
    }, this.delay.standard);
  },
};
</script>
<style scoped lang="less">
@import "./libs/mixin";
.settings {
  padding: 2 * @grid;

  /deep/ .van-field {
    height: 5 * @grid;
  }

  /deep/ .van-button {
    height: 5 * @grid;
    background: none;
    border-color: @gray-50;
  }

  /deep/ .van-button--info {
    border-color: @primary-main;
    background: @primary-main;
  }
}
</style>