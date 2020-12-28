<template lang="pug">
#app(:class="{ 'swap-full': !mini }")
  .swap-head
    template(v-if="mini")
      .logo
        router-link(to="/")
          img(src="@/assets/logo_w.png")
      .icon
        Icon(name="menus", size="24", @click="menuStatus = true")
  .swap-content
    router-view
  van-popup.swap-menu(
    v-model="menuStatus",
    position="left",
    style="height: 100%",
    :overlay="mini",
    :lock-scroll="mini"
  )
    .toper
      img.logo(src="@/assets/logo.png")
      van-icon.icon(
        name="cross",
        size="20",
        @click="menuStatus = false",
        v-if="mini"
      )
    .user
      template(v-if="address")
        .account
          Logo(:tokens="['hbc']")
          | {{ address.substring(0, 6) }} ... {{ address.substring(address.length - 4, address.length) }}
        .balance {{ asset }} HBC
      van-button(type="info", block, @click="connectWalletWin = true", v-else) {{ $lang('head.connectWallet') }}

    Menu(@click="menuStatus = false")

  // Transaction settting
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
  WalletModal(v-model="connectWalletWin")
</template>

<script>
import { mapState, mapActions } from "vuex";
import Head from "@/components/head.vue";

export default {
  computed: {
    ...mapState([
      "address",
      "config",
      "configWin",
      "hashList",
      "assets",
      "delay",
      "mini",
    ]),
    asset() {
      let a = 0;
      if (this.assets.hbc) {
        a = this.assets.hbc.showAmount.cutFixed(2);
      }
      return a;
    },
  },
  components: {
    Head,
  },
  data() {
    return {
      win: false,
      slippageTolerance: 0.1,
      transactionDeadline: 20,
      menuStatus: false,
      connectWalletWin: false,
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
      const mini = document.documentElement.clientWidth < 640;
      this.setState({ mini });
      if (mini) {
        this.menuStatus = false;
      } else {
        this.menuStatus = true;
      }
    },
    getTxs(hash) {
      this.$axios.get(`/api/v1/txs/${hash}`).then((result) => {
        if (result.code === 0) {
          this.pushTxs(result);
          this.$tips({
            content: [
              this.$lang(`head.${result.data.activities[0].type}`),
              this.$lang(result.data.success ? "head.success" : "head.failed"),
            ].join(":"),
            closeable: true,
            type: result.data.success ? "success" : "error",
            time: this.delay.standard,
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

.swap-head {
  height: 6 * @grid;
  padding: 2 * @grid;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 528px;
  margin: 0 auto;

  .logo {
    img {
      height: 3 * @grid;
    }
  }
  .icon {
    color: @white;
  }
}

.swap-menu {
  width: 26 * @grid;
  padding: 8 * @grid 2 * @grid 0;
  .toper {
    padding-bottom: 3 * @grid;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .logo {
      height: 3 * @grid;
    }
  }
  .user {
    box-shadow: 0px 0px 12px rgba(31, 93, 193, 0.16);
    border-radius: 6px;
    overflow: hidden;
  }
  .account {
    .text-hide;
    padding: 2 * @grid 0;
    margin: 0 3 * @grid;
    line-height: 3 * @grid;
    display: flex;
    align-content: center;
    /deep/ .van-image {
      vertical-align: middle;
      margin-right: @grid;
    }
  }
  .balance {
    padding: 2 * @grid 3 * @grid;
    line-height: 3 * @grid;
    height: 3 * @grid;
    background: fade(@primary-main, 30%);
    font-size: 17px;
    font-weight: 500;
  }
}

.swap-full {
  .swap-content {
    margin-left: 40 * @grid;
  }
  .swap-menu {
    width: 30 * @grid;
    padding: 20 * @grid 5 * @grid 0;

    .toper {
      .logo {
        height: 4 * @grid;
      }
    }
  }
}

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