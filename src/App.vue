<template lang="pug">
#app(:class="{ 'swap-full': !mini }")
  .swap-head
    template(v-if="mini")
      .logo
        router-link(to="/")
          img(src="@/assets/logo_w.png")
      .icon
        van-badge(:content="processNumber", v-if="address")
          Icon(
            name="importbykeystore",
            size="24",
            @click="processWin = true",
            @touchstart="processWin = true"
          )
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
      van-icon.icon(name="cross", size="20", @click="menuStatus = true", v-if="mini")
    .user
      template(v-if="address")
        .account(@click="openProcess") {{ address.substring(0, 6) }} ... {{ address.substring(address.length - 4, address.length) }}
          van-badge(:content="processNumber")
            Icon(name="arrowright", size="24")
        .balance
          Logo(:tokens="['hbc']")
          | {{ asset }} HBC
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
  Process(v-model="processWin")
</template>

<script>
import { mapState, mapActions } from "vuex";
import Process from "@/components/process.vue";

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
    processNumber() {
      return this.hashList.filter((el) => !el.result).length || "";
    },
  },
  components: {
    Process,
  },
  data() {
    return {
      win: false,
      slippageTolerance: 0.1,
      transactionDeadline: 20,
      menuStatus: false,
      connectWalletWin: false,
      processWin: false,
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
    openProcess() {
      this.menuStatus = false;
      this.processWin = true;
    },
    resize() {
      const mini = document.documentElement.clientWidth < 840;
      this.setState({
        mini,
        clientWidth: document.documentElement.clientWidth,
      });
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
    i {
      margin-left: 2 * @grid;
    }
  }
}

.swap-menu {
  width: 26 * @grid;
  padding: 0 2 * @grid;
  .toper {
    padding-top: 8 * @grid;
    padding-bottom: 3 * @grid;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .logo {
      height: 3 * @grid;
    }
  }
  .user {
    background: @gray-100;
    border-radius: @grid;
    overflow: hidden;
    border: 1px solid @gray-100;
  }
  .account {
    .text-hide;
    padding: 2 * @grid 12px 2 * @grid 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: @gray-500;
  }
  .balance {
    padding: @grid 20px;
    height: 3 * @grid;
    background: @white;
    font-size: 14px;
    color: @primary-main;
    display: flex;
    align-content: center;
    /deep/ .van-image {
      vertical-align: middle;
    }
  }
}

.swap-full {
  .swap-content {
    margin-left: 35 * @grid;
  }
  .swap-menu {
    width: 27 * @grid;
    padding: 0 4 * @grid;

    .toper {
      padding-top: 10 * @grid;
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