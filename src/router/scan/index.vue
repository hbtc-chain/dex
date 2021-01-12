<template lang="pug">
.container
  Search(v-model="pair")
  PairInfo(:pair="pair", :prices="prices", v-if="pair")
  van-row(:gutter="8")
    van-col(span="8")
      Card(:title="$lang('scan.swapPrice')", v-if="!pair") ${{ prices['hbc'] }}
        template(v-slot:more)
          Logo.small-logo(:tokens="['hbc']")
      Card(:title="$lang('scan.totalLiquidity')") ${{ data.liquidity.cutFixed(4) }}
      Card(:title="$lang('scan.volume24hrs')") ${{ data.volume24Hr.cutFixed(4) }}
      Card(:title="$lang('scan.transactions24hrs')") {{ data.tradeCount24Hr.cutFixed(4) }}
      Card.pooled-tokens(
        :title="$lang('scan.pooledTokens')",
        v-if="pair && tokenA && tokenB"
      )
        .item
          Logo(:tokens="[tokenA]")
          | {{ nFormatter(data.tokenAAmount.cutFixed(tokensMap[tokenA].showDecimals), 2) }} ({{ tokensMap[tokenA].name }})
        .item
          Logo(:tokens="[tokenB]")
          | {{ nFormatter(data.tokenBAmount.cutFixed(tokensMap[tokenB].showDecimals), 2) }} ({{ tokensMap[tokenB].name }})
    van-col(span="16")
      Block.charts
        template(#title)
          span(
            :class="{ 'color-gray300': charts === 'volume' }",
            @click="charts = 'liquidity'"
          ) {{ $lang('scan.liquidity') }}
          span(
            :class="{ 'color-gray300': charts === 'liquidity' }",
            @click="charts = 'volume'"
          ) {{ $lang('scan.volume') }}
        Charts(
          metric="liquidity",
          type="line",
          :name="$lang('scan.liquidity')",
          v-if="charts === 'liquidity'",
          key="liquidity"
        )
        Charts(
          key="volume",
          metric="volume",
          :name="$lang('scan.volume')",
          v-if="charts === 'volume'"
        )
  Block(:title="$lang('scan.pairs.title')", v-if="!pair")
    Pairs
  Block(:title="$lang('scan.transactions.title')")
    Transactions(:pair="pair")
</template>
<script>
import { mapState } from "vuex";
import Helper from "@/libs/helper";
import Transactions from "./components/transactions.vue";
import PairInfo from "./components/pair-info.vue";
import Charts from "./components/charts.vue";
import Search from "./components/search.vue";
import Pairs from "./components/pairs.vue";
import Card from "./components/card.vue";
import Block from "./components/block.vue";

let fn = null;
export default {
  components: {
    Transactions,
    PairInfo,
    Charts,
    Search,
    Pairs,
    Card,
    Block,
  },
  computed: {
    ...mapState(["tokensMap", "symbols", "delay"]),
    prices() {
      const price = {};
      Object.keys(this.priceMap).forEach((el) => {
        price[el] = this.priceMap[el].usd;
      });
      return price;
    },
  },
  data() {
    return {
      tokens: "",
      pair: "",
      tokenA: "",
      tokenB: "",
      data: {
        liquidity: "",
        tradeCount24Hr: "",
        volume7D: "",
        volume24Hr: "",
        tokenAAmount: "",
        tokenBAmount: "",
      },
      priceMap: [],
      charts: "liquidity",
    };
  },
  watch: {
    $route() {
      const pair = this.$route.params.id;
      if (pair) {
        this.pair = pair;
        [this.tokenA, this.tokenB] = this.pair.split("-");
        this.getState();
      } else {
        this.pair = "";
      }
    },
  },
  methods: {
    nFormatter: Helper.nFormatter,
    getState() {
      Object.keys(this.data).forEach((el) => {
        this.data[el] = "";
      });
      if (this.pair) {
        this.$axios
          .get("/api/v1/analytics/pairState", {
            params: {
              pair: this.pair,
            },
          })
          .then((result) => {
            if (result.code === 0) {
              Object.assign(this.data, result.data);
            }
          });
      } else {
        this.$axios.get("/api/v1/analytics/globalState").then((result) => {
          if (result.code === 0) {
            Object.assign(this.data, result.data);
          }
        });
      }
      this.getPrice();
    },
    getPrice() {
      clearTimeout(fn);
      this.$axios
        .get("/api/v1/swap/prices", {
          params: {
            tokens: ["hbc", this.tokenA, this.tokenB].join(","),
          },
        })
        .then((result) => {
          if (result.code === 0) {
            this.priceMap = result.data.prices;
          }
        });
      fn = setTimeout(() => {
        this.getPrice();
      }, this.delay.standard);
    },
  },
  created() {
    const pair = this.$route.params.id || "";

    this.symbols.forEach((el) => {
      if (el.id === pair) {
        this.pair = pair;
      }
    });
    [this.tokenA, this.tokenB] = this.pair.split("-");

    this.getState();
  },
  beforeDestroy() {
    clearTimeout(fn);
  },
};
</script>

<style scoped lang="less">
@import "./index";
</style>