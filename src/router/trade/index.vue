<template lang="pug">
Main
  .trading
    .title(:border="false", @click="show = true")
      .pair-name
        Icon(name="menufold1", size="24")
        | {{ tokensMap[tokenA].name }} / {{ tokensMap[tokenB].name }}
      .pair-logo
        Logo(:tokens="[tokenA, tokenB]")
    Alert(type="error", icon="warning", v-if="errorText") {{ errorText }}
    van-row(:gutter="10")
      van-col(span="12")
        Trading(
          :pair="pair",
          :tokenA="tokenA",
          :tokenB="tokenB",
          :importData="formData",
          @click="errorMessage"
        )
      van-col(span="12")
        OrderBook(
          :pair="pair",
          :bids="bids",
          :asks="asks",
          :tokenA="tokenA",
          :tokenB="tokenB",
          @change="changeTradingForm"
        )

  .list(slot="more")
    .title
      span(
        :class="{ current: currentType === item }",
        v-for="item in types",
        @click="currentType = item"
      ) {{ $lang(`trade.${item}`) }}
    OpenOrder(
      :pair="pair",
      :data="pendingOrders",
      :apiReady="apiReady",
      v-if="currentType === 'openOrder'"
    )
    OrderHistory(
      :pair="pair",
      :data="orderHistory",
      :apiReady="apiReady",
      v-if="currentType === 'history'"
    )
  SideBar(v-model="show", :pair="pair", @change="switchPair")
</template>
<script>
import { mapState } from "vuex";
import SideBar from "./components/side-bar.vue";
import OpenOrder from "./components/open-order.vue";
import OrderBook from "./components/order-book.vue";
import OrderHistory from "./components/order-history.vue";
import Trading from "./components/trading.vue";

let fn = null;
export default {
  components: {
    SideBar,
    OpenOrder,
    OrderHistory,
    OrderBook,
    Trading,
  },
  computed: {
    ...mapState(["tokensMap", "symbols", "address", "delay"]),
  },
  data() {
    return {
      apiReady: false,
      pair: "",
      tokenA: "",
      tokenB: "",
      show: false,
      pendingOrders: [],
      orderHistory: [],
      bids: [],
      asks: [],
      currentType: "openOrder",
      types: ["openOrder", "history"],
      formData: {},
      errorText: "",
    };
  },

  methods: {
    errorMessage(result) {
      this.errorText = "";
      if (result.code !== 200) {
        this.errorText = result.msg;
      }
    },
    changeTradingForm(data) {
      this.formData = data;
    },
    switchPair(pair) {
      if (this.pair !== pair) {
        clearTimeout(fn);
        this.beforPrice = 0;
        this.pair = pair;
        this.bids = [];
        this.asks = [];
        this.pendingOrders = [];
        [this.tokenA, this.tokenB] = pair.split("-");
        this.$router.replace({ name: "tradeDetail", params: { id: pair } });
        this.autoLoad();
      }
      this.show = false;
    },

    getOrderBook() {
      this.$axios(`/api/v1/swap/orderBook?pairName=${this.pair}`).then(
        (result) => {
          if (result.code === 0) {
            if (result.data.asks) {
              this.asks = [...result.data.asks].reverse();
            }
            if (result.data.bids) {
              this.bids = result.data.bids;
            }
          }
        }
      );
    },

    getPendingOrders() {
      this.$axios("/api/v1/swap/pendingOrders", {
        params: {
          pair: this.pair,
          address: this.address,
        },
      }).then((result) => {
        this.apiReady = true;
        if (result.code === 0) {
          this.pendingOrders = result.data.list;
        }
      });
    },

    getOrderHistory() {
      this.$axios
        .get("/api/v1/analytics/tradeHistory", {
          params: {
            pair: this.pair,
            address: this.address,
            startTime: 0,
            endTime: 0,
          },
        })
        .then((result) => {
          if (result.code === 0) {
            this.orderHistory = result.data.list;
          }
        });
    },

    autoLoad() {
      clearTimeout(fn);
      this.getOrderBook();
      if (this.address) {
        this.getPendingOrders();
        this.getOrderHistory();
      }
      fn = setTimeout(() => this.autoLoad(), this.delay.standard);
    },
  },
  created() {
    const pair = this.$route.params.id || sessionStorage.selectedPairId || "";

    const symbols = this.symbols.filter((el) => el.verified);

    if (symbols.length) {
      this.pair = [...symbols].shift().id;
    }

    this.symbols.forEach((el) => {
      if (el.id === pair) {
        this.pair = pair;
      }
    });

    [this.tokenA, this.tokenB] = this.pair.split("-");

    this.autoLoad();
  },
  beforeDestroy() {
    clearTimeout(fn);
  },
};
</script>

<style scoped lang="less">
@import "./index.less";
</style>
