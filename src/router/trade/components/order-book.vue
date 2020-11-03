<template lang="pug">
.handicap
  van-row.handicap-title
    van-col.handicap-price(span="12") {{ $lang('trade.price') }}({{ tokenB | toUP }})
    van-col.handicap-amount(span="12") {{ $lang('trade.orderBookAmount') }}({{ tokenA | toUP }})
  .handcap-list
    div
      .handicap-item(
        v-for="item in askList",
        @click="selectOrder('ask', item)"
      )
        span.bg-red(:style="{ width: item.w + '%' }", v-if="item.w")
        van-row
          van-col.handicap-price(span="12") {{ item.p || '---' }}
          van-col.handicap-amount(span="12") {{ item.a || '---' }}
    .handicap-info(@click="selectOrder('current', { p: currentPrice })")
      strong.color-success(v-if="priceUp") {{ currentPrice }} ▲
      strong.color-error(v-else) {{ currentPrice }} ▼
    div
      .handicap-item(
        v-for="item in bidList",
        @click="selectOrder('bid', item)"
      )
        span.bg-green(:style="{ width: item.w + '%' }", v-if="item.w")
        van-row
          van-col.handicap-price(span="12") {{ item.p || '---' }}
          van-col.handicap-amount(span="12") {{ item.a || '---' }}
</template>
<script>
import { mapState } from "vuex";
import Helper from "@/libs/helper";

export default {
  props: {
    pair: {
      type: String,
      default: "",
    },
    tokenA: {
      type: String,
      default: "",
    },
    tokenB: {
      type: String,
      default: "",
    },
    bids: {
      type: Array,
      defaul() {
        return [];
      },
    },
    asks: {
      type: Array,
      defaul() {
        return [];
      },
    },
  },
  watch: {
    currentPrice() {
      if (this.beforPrice !== this.currentPrice) {
        this.priceUp = this.currentPrice > this.beforPrice;
        this.beforPrice = this.currentPrice;
      }
    },
  },
  computed: {
    ...mapState(["tokensMap", "pairs"]),
    bidList() {
      return this.computedOrderBook(this.bids, 0);
    },
    askList() {
      return this.computedOrderBook(this.asks, 1).reverse();
    },
    currentPrice() {
      const pair = this.pairs[this.pair];
      if (pair) {
        return Helper.bigNumber(pair.tokenB.amount)
          .div(pair.tokenA.amount)
          .toString(10)
          .cutFixed(this.tokensMap[this.tokenB].showDecimals);
      }
      return "---";
    },
  },
  data() {
    return {
      priceUp: true,
      beforPrice: 0,
      currentType: "openOrder",
      types: ["openOrder", "history"],
    };
  },
  methods: {
    BigNumber: Helper.bigNumber,

    priceDown(value, token, cut) {
      if (value) {
        const val = Helper.bigNumber(value)
          .div(this.pairs[this.pair].gap)
          .toString(10);
        if (cut) {
          return val.cutFixed(this.tokensMap[token].showDecimals);
        }
        return val;
      }
      return value;
    },

    amountDown(value, token, cut) {
      if (value) {
        const val = Helper.bigNumber(value).div(this.tokensMap[token].pow);
        if (cut) {
          return val.toString(10).cutFixed(this.tokensMap[token].showDecimals);
        }
        return val.toString(10);
      }
      return value;
    },

    selectOrder(type, item) {
      this.$emit("change", { type, item });
    },

    computedOrderBook(data) {
      let count = 0;
      let i = 0;
      const list = [];
      while (i < 6) {
        const json = { p: "", a: "", w: 0 };
        if (data[i]) {
          const [p, a] = data[i];
          json.p = this.priceDown(p, this.tokenB, true);

          json.a = this.amountDown(a, this.tokenA, true);

          count = Math.max(json.a, count);
        }
        list.push(json);
        i += 1;
      }
      return list.map((el) => {
        const item = { ...el };
        if (item.p) {
          item.w = (item.a * 100) / count;
        }
        return item;
      });
    },
  },
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";
.handicap {
  .handicap-title {
    font-size: 12px;
    height: 3 * @grid;
    display: flex;
    align-items: center;
    color: @gray-500;
    margin-bottom: @grid;
  }

  .handicap-price {
    text-align: left;
  }

  .handicap-amount {
    text-align: right;
  }

  .handcap-list {
    font-size: 12px;
    color: @gray-900;
    height: 324px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .handicap-item {
    height: 3 * @grid;
    line-height: 3 * @grid;
    position: relative;
    font-size: 12px;

    span {
      top: 0;
      right: 0;
      height: 3 * @grid;
      display: block;
      position: absolute;
      opacity: 0.1;
    }

    .bg-red {
      background: @error;
    }

    .bg-green {
      background: @green;
    }
  }

  .handicap-info {
    margin: 0.25 * @grid 0;
    height: 4 * @grid;
    display: flex;
    align-items: center;

    strong {
      font-size: 14px;
      font-weight: 700;
    }

    span {
      font-size: 12px;
      color: @gray-500;
      display: block;
      text-align: right;
    }
  }
}
</style>
