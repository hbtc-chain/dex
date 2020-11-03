<template lang="pug">
Modal(
  v-model="visible",
  :title="$lang('head.connectWallet')",
  position="bottom"
)
  .connect
    .loading(v-if="connectLoading")
      van-image(:src="walletLogo", radius="4", width="40", height="40")
      van-loading
      .text {{ $lang('head.initializing') }}
      van-button(size="mini", icon="arrow-left", @click="back") {{ $lang('head.back') }}
    van-cell(:border="false", title="HBTC Wallet", @click="connect", v-else)
      van-image(:src="walletLogo", radius="4", width="40", height="40")
    Alert(v-if="errorText" type="error" icon="warning") {{errorText}}
    .download {{ $lang('head.installed').replace('{value}', 'HBTC Wallet') }}
      a.color-info(href="") {{ $lang('head.clickHere') }}
</template>
<script>
import { mapState, mapActions } from "vuex";
import Helper from "@/libs/helper";
import walletLogo from "@/assets/wallet.png";

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
    ...mapState(["mini"]),
  },
  data() {
    return {
      visible: this.value,
      walletLogo,
      connectLoading: false,
      walletConnectId: "",
      errorText: "",
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
  methods: {
    ...mapActions(["wallteInit"]),
    back() {
      this.connectLoading = false;
      if (this.walletConnectId && window.HBC_wallet_isready) {
        window.HBC_wallet.cancel(this.walletConnectId);
      }
    },
    connect() {
      this.connectLoading = true;
      this.errorText = "";
      Helper.callHandler({
        name: "connect",
        success: () => {
          this.connectLoading = false;
          this.visible = false;
          this.wallteInit();
        },
        error: (result) => {
          this.connectLoading = false;
          this.errorText = result.msg;
        },
      });
    },
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.connect {
  padding: 3 * @grid;
  background: @gray-50;
}
.download {
  text-align: center;
  padding-top: 6 * @grid;
}
.loading {
  padding: 3 * @grid 0;
  border: 1px solid @gray-50;
  border-radius: 0.5 * @grid;
  background: #fff;
  text-align: center;
  /deep/ .van-image {
    margin-bottom: 2 * @grid;
  }
  .text {
    padding: 2 * @grid 0;
  }
}
/deep/ .van-cell {
  border: 1px solid @gray-50;
  border-radius: 0.5 * @grid;
  cursor: pointer;
  &:hover {
    border-color: @primary-main;
  }
  .van-image {
    vertical-align: middle;
  }
  .van-cell__title {
    font-size: 18px;
    font-weight: 500;
    align-items: center;
    display: flex;
  }
}
</style>