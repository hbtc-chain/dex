<template lang="pug">
div
  .remove-liquidity
    van-nav-bar(:title="$lang('pool.removeLiquidity')", :border="false")
      van-icon(
        name="arrow-left",
        size="24",
        slot="left",
        @click.stop.prevent="back"
      )
    .amount
      .lable.color-gray500 {{ $lang('pool.amount') }}
      .value {{ amount }}%
      van-slider(v-model="amount", bar-height="4px")
    van-row.button(:gutter="8")
      van-col(span="6", v-for="item in 4", :key="item")
        van-button(
          block,
          :type="amount == item * 25 ? 'info' : 'default'",
          @click="amount = item * 25"
        ) {{ item * 25 }}%
    .item
      .lable {{ BigNumber(data.pair.tokenA.amount).times(amount).div(100) }}
      .value
        span {{ tokenName(data.pair.tokenA.symbol) }}
        Logo(size="16", :tokens="[data.pair.tokenA.symbol]")
    .item
      .lable {{ BigNumber(data.pair.tokenB.amount).times(amount).div(100) }}
      .value
        span {{ tokenName(data.pair.tokenB.symbol) }}
        Logo(size="16", :tokens="[data.pair.tokenB.symbol]")
    .price
      .item
        .lable.color-gray500 {{ $lang('pool.price') }}
        .value 1 {{ tokenName(data.pair.tokenA.symbol) }} = {{ BigNumber(data.pair.tokenB.amount).div(data.pair.tokenA.amount).toString(10).cutFixed(8) }} {{ tokenName(data.pair.tokenB.symbol) }}
      .item
        .lable &nbsp;
        .value 1 {{ tokenName(data.pair.tokenB.symbol) }} = {{ BigNumber(data.pair.tokenA.amount).div(data.pair.tokenB.amount).toString(10).cutFixed(8) }} {{ tokenName(data.pair.tokenA.symbol) }}
    Alert(type="error", icon="warning", v-if="errorText") {{ errorText }}
    van-button(
      type="info",
      block,
      size="large",
      @click="submit",
      :disabled="Number(amount) === 0"
    ) {{ $lang('pool.remove') }}
</template>

<script>
import { mapState, mapActions } from "vuex";
import Helper from "@/libs/helper";

export default {
  props: {
    value: {
      type: String,
      default: "",
    },
    data: {
      type: Object,
      default() {
        return {
          pair: {
            tokenA: {
              symbol: "dot",
              amount: "",
            },
            tokenB: {
              symbol: "hbc",
              amount: "",
            },
          },
          liquidity: "",
          liquidityShare: "",
        };
      },
    },
  },
  computed: {
    ...mapState(["tokensMap", "address", "basePow", "config"]),
  },
  data() {
    return {
      amount: 0,
      errorText: "",
    };
  },
  methods: {
    ...mapActions(["pushTxs"]),
    BigNumber: Helper.bigNumber,
    back() {
      this.$emit("input", "list");
    },
    tokenName(symbol) {
      if (symbol) {
        return this.tokensMap[symbol].name;
      }
      return "";
    },
    submit() {
      this.errorText = "";
      const json = {
        type: "hbtcchain/openswap/MsgRemoveLiquidity",
        value: {
          from: this.address,
          expired_at: `${
            this.config.transactionDeadline * 60 +
            Math.round(new Date().getTime() / 1000)
          }`,
          token_a: this.data.pair.tokenA.symbol,
          token_b: this.data.pair.tokenB.symbol,
          liquidity: Helper.bigNumber(this.data.liquidity)
            .times(this.amount)
            .idiv(100)
            .toString(10),
        },
      };
      Helper.callHandler({
        name: "sign",
        data: json,
        success: (result) => {
          this.amount = 0;
          this.back();
          this.pushTxs(result.data);
        },
        error: (result) => {
          this.errorText = result.msg;
        },
      });
    },
  },
};
</script>

<style scoped lang="less">
@import "../../libs/mixin";
.amount {
  text-align: center;
  padding-bottom: 4.4 * @grid;
  margin: 0 2 * @grid;

  .lable {
    font-size: 15px;
    line-height: 24px;
  }
  .value {
    font-size: 30px;
    font-weight: 700;
    line-height: 7 * @grid;
    padding-bottom: 2 * @grid;
  }
}

.button {
  margin-bottom: 4 * @grid;
  /deep/ .van-button {
    text-align: center;
    border-color: @gray-100;
    background: #fff;
    height: 5 * @grid;
  }
  /deep/ .van-button--info {
    border-color: @primary-main;
    background: @primary-main;
  }
}

.item {
  display: flex;
  justify-content: space-between;
  line-height: 4 * @grid;

  /deep/ .van-logos {
    margin-left: 0.5 * @grid;
    padding-right: 0;
  }
  .value {
    display: flex;
    align-items: center;
  }

  .label {
    display: flex;
    align-items: center;
    line-height: 32px;
  }
}
.price {
  background: linear-gradient(0deg, #f9f9fb, #f9f9fb), #f4f7ff;
  padding: 1.5 * @grid;
  margin: 2 * @grid 0;
}
</style>