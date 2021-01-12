<template lang="pug">
Modal.confirm-payment(
  v-model="paymentSheetWin",
  :title="$lang('swap.confirmSwap')",
  position="bottom"
)
  .confirm
    van-cell-group(:border="false")
      van-cell(center, size="large")
        .value {{ tokenName(tokenA) }}
        template(#title)
          .left
            Logo(size="32", v-if="tokensMap[tokenA]", :tokens="[tokenA]")
            .title.color-gray900 {{ data.amountA }}
    van-divider(dashed, content-position="left")
      Icon(name="arrowdown2", size="16" fill)
    van-cell-group(:border="false")
      van-cell(center, size="large")
        .value {{ tokenName(tokenB) }}
        template(#title)
          .left
            Logo(size="32", v-if="tokensMap[tokenB]", :tokens="[tokenB]")
            .title {{ data.amountB }}
    Alert(v-if="data.amountA && data.amountB") {{ confirmWarning }}
  .note(v-if="data.amountA && data.amountB")
    .item
      .lable {{ $lang('swap.price') }}
        // Icon(name="question")
      .value {{ data.confirmSwapPrice }}
        Icon.icon(
          :class="{ 'color-info': data.reversePrice }",
          @click="data.reversePrice = !data.reversePrice",
          name="exchange",
          size="24"
        )
    .item(v-if="data.transforDirection == 'B'")
      .lable {{ $lang('swap.minimumReceived') }}
        // Icon(name="question")
      .value {{ data.result.minimumReceived }} {{ tokenName(tokenB) }}
    .item(v-else)
      .lable {{ $lang('swap.maximumSold') }}
        // Icon(name="question")
      .value {{ data.result.maximumSold }} {{ tokenName(tokenA) }}
    .item
      .lable {{ $lang('swap.priceImpact') }}
        // Icon(name="question")
      .value {{ data.result.priceImpact.cutFixed(2) }}%
    .item
      .lable {{ $lang('swap.liquidityProviderFee') }}
        // Icon(name="question")
      .value {{ BigNumber(data.amountA).times(data.fee).toString(10) }} {{ tokenName(tokenB) }}
    van-button(type="info", block, @click="submit", size="large") {{ $lang('swap.confirmSwap') }}
</template>

<script>
import { mapState, mapActions } from "vuex";
import Helper from "@/libs/helper";

export default {
  props: {
    tokenA: {
      type: String,
      default: "",
    },
    tokenB: {
      type: String,
      default: "",
    },
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      paymentSheetWin: false,
    };
  },
  watch: {
    value() {
      if (this.value !== this.paymentSheetWin) {
        this.paymentSheetWin = this.value;
      }
    },
    paymentSheetWin() {
      this.$emit("input", this.paymentSheetWin);
    },
  },
  computed: {
    ...mapState(["tokensMap", "address", "config"]),
    confirmWarning() {
      if (this.data.transforDirection === "B") {
        return this.$lang("swap.confirmWarningOutput")
          .replace("{amount}", this.data.result.minimumReceived)
          .replace("{token}", this.tokenName(this.tokenB));
      }
      return this.$lang("swap.confirmWarningInput")
        .replace("{amount}", this.data.result.maximumSold)
        .replace("{token}", this.tokenName(this.tokenA));
    },
  },
  methods: {
    ...mapActions(["pushTxs"]),
    BigNumber: Helper.bigNumber,
    tokenName(symbol) {
      if (symbol) {
        return this.tokensMap[symbol].name;
      }
      return "";
    },
    submit() {
      this.paymentSheetWin = false;
      const json = {
        type: "hbtcchain/openswap/MsgSwapExactIn",
        value: {
          from: this.address,
          referer: this.address,
          receiver: this.address,
          expired_at: `${
            this.config.transactionDeadline * 60 +
            Math.round(new Date().getTime() / 1000)
          }`,
        },
      };
      if (this.data.transforDirection === "B") {
        Object.assign(json.value, {
          amount_in: Helper.bigNumber(this.data.amountA)
            .times(this.tokensMap[this.tokenA].pow)
            .toString(10),
          min_amount_out: Helper.bigNumber(this.data.result.minimumReceived)
            .times(this.tokensMap[this.tokenB].pow)
            .toString(10),
          swap_path: [this.tokenA],
        });
        this.data.result.route.forEach((el) => {
          json.value.swap_path.push(el.tokenB.symbol);
        });
      } else {
        json.type = "hbtcchain/openswap/MsgSwapExactOut";
        Object.assign(json.value, {
          amount_out: Helper.bigNumber(this.data.amountB)
            .times(this.tokensMap[this.tokenB].pow)
            .toString(10),
          max_amount_in: Helper.bigNumber(this.data.result.maximumSold)
            .times(this.tokensMap[this.tokenA].pow)
            .toString(10),
          swap_path: [this.tokenA],
        });
        this.data.result.route.forEach((el) => {
          json.value.swap_path.push(el.tokenB.symbol);
        });
      }

      Helper.callHandler({
        name: "sign",
        data: json,
        success: (result) => {
          this.$emit("click", result);
          this.pushTxs(result.data);
        },
        error: (result) => {
          this.$emit("click", result);
        },
      });
    },
  },
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";

.confirm-payment {
  .confirm {
    padding: 0 @space;

    /deep/ .van-cell {
      padding: 1.5 * @grid @grid;
      height: 7 * @grid;
    }

    /deep/ .van-cell__title {
      max-width: 80%;
    }

    /deep/ .van-divider {
      border-color: @gray-100;
      margin: 0;

      i {
        height: 3 * @grid;
        width: 3 * @grid;
        text-align: center;
        line-height: 3 * @grid;
        font-weight: 700;
      }
    }

    /deep/ .van-divider::before {
      flex: initial;
      width: 0;
      margin-right: 1.5 * @grid;
    }

    .value {
      color: @gray-500;
      font-size: 17px;
      white-space: nowrap;
    }

    .left {
      display: flex;
      align-items: center;

      .token {
        padding-left: 1.5 * @grid;
      }

      .title {
        padding-left: @grid;
        font-weight: 700;
        font-size: 26px;
        line-height: 31px;
        .text-hide;
      }
    }
  }

  .error {
    font-weight: 500;
    font-size: 15px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
  }

  .note {
    margin-top: 2 * @grid;
    background: @gray-50;
    border-radius: 6px;
    padding: @space;
    position: relative;
    margin:0 10px 10px;

    .item {
      display: flex;
      justify-content: space-between;
      line-height: 4 * @grid;

      i {
        margin-left: 0.5 * @grid;
        vertical-align: middle;
        font-weight: 700;
        margin-top: -2px;
      }
    }

    .label {
      display: flex;
      align-items: center;
      line-height: 32px;
    }

    /deep/ .van-button {
      margin-top: 3 * @grid;
    }
  }
}
</style>
