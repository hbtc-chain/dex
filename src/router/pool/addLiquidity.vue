<template lang="pug">
div
  .add-liquidity
    van-nav-bar(:title="$lang('pool.addLiquidity')", :border="false")
      Icon(name="Back", size="20", slot="left", @click.stop.prevent="back")
    // 首次添加未支持交易对的提示
    Alert(
      v-if="tokenA && tokenB && (tokensMap[tokenA].chain === 'hbc' || tokensMap[tokenB].chain === 'hbc') && tokensMap[tokenA].chain !== tokensMap[tokenB].chain",
      type="error"
    ) {{ $lang('pool.notSupported') }}
    Alert(
      v-else-if="firstAdd && liquidityApiReady && amountA && tokenA && tokenB",
      type="error",
      v-html="$lang('pool.firstTips')"
    )
    FormItem(
      :lable="$lang('pool.input')",
      :tips="`${$lang('swap.balance')}:${tipBalance(tokenA, 'showAmount')}`"
    )
      van-row(gutter="8")
        van-col(span="10")
          van-button(block, @click.stop.prevent="showActionSheet('A')")
            van-image(
              v-if="tokensMap[tokenA]",
              round,
              width="24",
              height="24",
              :src="tokensMap[tokenA].logo"
            )
            | {{ tokenName(tokenA) || $lang('swap.selectToken') }}
            Icon(name="arrowdown", size="16")
        van-col(span="14")
          van-field(
            :placeholder="$lang('swap.enterAmount')",
            v-model="amountA",
            @focus="focusDirection = 'B'",
            @blur="focusDirection = null",
            @input="inputAmount('B')",
            type="number",
            :formatter="formatterAmountA"
          )
            template(#extra)
              a.max(@click="maxAmount('A')") {{ $lang('swap.max') }}
    FormItem
      Icon(name="add", fill)
    FormItem(
      :lable="$lang('pool.input')",
      :tips="`${$lang('swap.balance')}:${tipBalance(tokenB, 'showAmount')}`"
    )
      van-row(gutter="8")
        van-col(span="10")
          van-button(block, @click.stop.prevent="showActionSheet('B')")
            van-image(
              v-if="tokensMap[tokenB]",
              round,
              width="24",
              height="24",
              :src="tokensMap[tokenB].logo"
            )
            | {{ tokenName(tokenB) || $lang('swap.selectToken') }}
            Icon(name="arrowdown", size="16")
        van-col(span="14")
          van-field(
            :placeholder="$lang('swap.enterAmount')",
            v-model="amountB",
            @focus="focusDirection = 'A'",
            @blur="focusDirection = null",
            @input="inputAmount('A')",
            type="number",
            :formatter="formatterAmountB"
          )
            template(#extra)
              a.max(@click="maxAmount('B')") {{ $lang('swap.max') }}

    // tokenA,tokenB有流动性
    template(v-if="pairs[symbol]")
      // tokenA,tokenB价格和资金池份额
      .info
        h4 {{ $lang('pool.priceAndPoolShare') }}
        van-row
          van-col(span="8")
            strong(v-if="tokenA") {{ prices[tokenA].cutFixed(tokensMap[tokenA].showDecimals) }}
            span {{ $lang('pool.swapPrice').replace('{tokenA}', tokensMap[tokenA].name).replace('{tokenB}', tokensMap[tokenB].name) }}
          van-col(span="8")
            strong(v-if="tokenB") {{ prices[tokenB].cutFixed(tokensMap[tokenB].showDecimals) }}
            span {{ $lang('pool.swapPrice').replace('{tokenA}', tokensMap[tokenB].name).replace('{tokenB}', tokensMap[tokenA].name) }}
          van-col(span="8")
            strong {{ shareOfPool }}%
            span {{ $lang('pool.shareOfPool') }}
      // 您的仓位
      .info(v-if="userShare")
        h4 {{ $lang('pool.yourPosition') }}
        van-row
          van-col(span="12")
            strong {{ userShare.pair.tokenA.amount.cutFixed(tokensMap[tokenA].showDecimals) }}
            span {{ tokenName(tokenA) }}
          van-col(span="12")
            strong {{ userShare.pair.tokenB.amount.cutFixed(tokensMap[tokenB].showDecimals) }}
            span {{ tokenName(tokenB) }}
    // 没有流动性
    template(v-else)
      .info
        h4 {{ $lang('pool.initialPricesAndShare') }}
        van-row
          van-col(span="8")
            strong {{ amountA || 0 }}
            span {{ tokenName(tokenA) }}
          van-col(span="8")
            strong {{ amountB || 0 }}
            span {{ tokenName(tokenB) }}
          van-col(span="8")
            strong(v-if="amountA && amountB") 100%
            strong(v-else) 0%
            span {{ $lang('pool.shareOfPool') }}
    Alert(type="error", icon="warning", v-if="errorText") {{ errorText }}
    van-button(
      type="info",
      size="large",
      block,
      v-if="!address",
      @click="connectWalletWin = true"
    ) {{ $lang('head.connectWallet') }}
    van-button(
      type="info",
      block,
      @click="confirmAdd",
      size="large",
      v-else-if="buttonStatus.isok"
    ) {{ buttonStatus.text }}
    van-button(
      block,
      size="large",
      disabled,
      :type="buttonStatus.type",
      v-else
    ) {{ buttonStatus.text }}
  WalletModal(v-model="connectWalletWin")
  Tokens(
    v-model="tokenSheetWin",
    @change="selectToken",
    :disabledItem="[tokenA, tokenB]"
  )
  Modal.confirm-payment(
    position="bottom",
    v-model="paymentSheetWin",
    :title="errorText || $lang('pool.youWillPay')"
  )
    .note(v-if="tokenA && tokenB")
      .item
        .lable {{ depositedToken(tokenA) }}
        .value {{ amountA }}
          Logo(size="16", :tokens="[tokenA]")
      .item
        .lable {{ depositedToken(tokenB) }}
        .value {{ amountB }}
          Logo(size="16", :tokens="[tokenB]")
      .item
        .lable {{ $lang('pool.price') }}
        .value 1 {{ tokenName(tokenA) }} = {{ prices[tokenB].cutFixed(tokensMap[tokenA].showDecimals) }} {{ tokenName(tokenB) }}
      .item
        .lable &nbsp;
        .value 1 {{ tokenName(tokenB) }} = {{ prices[tokenA].cutFixed(tokensMap[tokenB].showDecimals) }}{{ tokenName(tokenA) }}
      .item
        .lable {{ $lang('pool.shareOfPool') }}
        .value {{ shareOfPool }}%
      van-button(type="info", block, @click="submit", size="large") {{ $lang('pool.confirmSupply') }}
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
    pair: {
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapState([
      "tokens",
      "tokensMap",
      "assets",
      "pairs",
      "liquidity",
      "liquidityApiReady",
      "address",
      "config",
    ]),

    buttonStatus() {
      const data = {
        text: "",
        isok: false,
        type: "default",
      };

      const assetsA = this.assets[this.tokenA];
      const assetsB = this.assets[this.tokenB];
      if (!this.amountA || !this.amountB) {
        data.text = this.$lang("swap.enterAnAmount");
      } else if (!assetsA || this.amountA > Number(assetsA.amount)) {
        data.text = this.$lang("swap.insufficientBalance").replace(
          "{token}",
          this.tokensMap[this.tokenA].name
        );
      } else if (
        (!assetsB || this.amountB > Number(assetsB.amount)) &&
        this.tokenB
      ) {
        data.text = this.$lang("swap.insufficientBalance").replace(
          "{token}",
          this.tokensMap[this.tokenB].name
        );
      } else if (!this.tokenA || !this.tokenB) {
        data.text = this.$lang("swap.selectToken");
      } else if (
        this.tokenA &&
        this.tokenB &&
        (this.tokensMap[this.tokenA].chain === "hbc" ||
          this.tokensMap[this.tokenB].chain === "hbc") &&
        this.tokensMap[this.tokenA].chain !== this.tokensMap[this.tokenB].chain
      ) {
        data.text = this.$lang("pool.supply");
      } else {
        data.text = this.$lang("pool.supply");
        data.isok = true;
      }
      return data;
    },

    prices() {
      const pair = this.pairs[this.symbol];
      const price = {
        [this.tokenA]: 0,
        [this.tokenB]: 0,
      };
      if (pair) {
        price[this.tokenA] = pair.tokenA.price;
        price[this.tokenB] = pair.tokenB.price;
      }
      return price;
    },
    symbol() {
      return [this.tokenA, this.tokenB].join("-");
    },
    userPositon() {
      const positions = {};
      this.liquidity.forEach((element) => {
        const el = { ...element };
        positions[
          [element.pair.tokenA.symbol, element.pair.tokenB.symbol].join("-")
        ] = element;
        positions[
          [element.pair.tokenB.symbol, element.pair.tokenA.symbol].join("-")
        ] = Object.assign(el, {
          pair: {
            tokenA: { ...element.pair.tokenB },
            tokenB: { ...element.pair.tokenA },
          },
        });
      });
      return positions;
    },
    userShare() {
      return this.userPositon[this.symbol];
    },
    firstAdd() {
      return !this.pairs[this.symbol];
    },
  },
  data() {
    return {
      connectWalletWin: false,
      focusDirection: null,
      uniDirection: "B",
      shareOfPool: "0",
      tokenA: "",
      amountA: "",
      tokenB: "",
      amountB: "",
      tokenSheetWin: false,
      paymentSheetWin: false,
      errorText: "",
    };
  },
  methods: {
    ...mapActions(["pushTxs"]),
    tokenName(symbol) {
      if (symbol) {
        return this.tokensMap[symbol].name;
      }
      return "";
    },
    confirmAdd() {
      this.errorText = "";
      this.paymentSheetWin = true;
    },
    formatterAmountA(val) {
      return Helper.formatter(this.tokensMap, this.tokenA, val);
    },
    formatterAmountB(val) {
      return Helper.formatter(this.tokensMap, this.tokenB, val);
    },
    depositedToken(token) {
      return this.$lang("pool.depositedToken").replace(
        "{token}",
        this.tokensMap[token].name
      );
    },
    back() {
      this.$emit("input", "list");
    },
    showActionSheet(direction) {
      this.currentDirection = direction;
      this.tokenSheetWin = true;
    },

    // 选取token
    selectToken(token) {
      if (
        [this.tokenA, this.tokenB].indexOf(token) === -1 &&
        this[`token${this.currentDirection}`] !== token
      ) {
        this[`token${this.currentDirection}`] = token;
      }
      this.tokenSheetWin = false;
      this.computedAmount();
    },
    computedAmount() {
      if (!this.firstAdd) {
        const pairAmount = this.pairs[this.symbol].tokenA.amount;
        if (this.uniDirection === "B") {
          this.amountB = "";
          if (this.amountA > 0) {
            this.amountB = Helper.bigNumber(this.amountA)
              .times(Helper.bigNumber(this.prices[this.tokenB]))
              .toString(10)
              .cutFixed(this.tokensMap[this.tokenB].decimals);
          }
        } else {
          this.amountA = "";
          if (this.amountB > 0) {
            this.amountA = Helper.bigNumber(this.amountB)
              .times(Helper.bigNumber(this.prices[this.tokenA]))
              .toString(10)
              .cutFixed(this.tokensMap[this.tokenA].decimals);
          }
        }

        this.shareOfPool = 0;
        if (this.amountA) {
          this.shareOfPool = Helper.bigNumber(this.amountA)
            .times(100)
            .div(Helper.bigNumber(this.amountA).plus(pairAmount))
            .toString(10)
            .cutFixed(2);
        }
      }
    },
    // A && B 资产
    tipBalance(token, type) {
      if (token && this.assets[token]) {
        return this.assets[token][type].cutFixed(
          this.tokensMap[token].showDecimals
        );
      }
      return 0;
    },
    // 设置 A && B 最大值
    maxAmount(direction) {
      this[`amount${direction}`] = this.tipBalance(
        this[`token${direction}`],
        "amount"
      );
      if (direction === "B") {
        this.uniDirection = "A";
      } else {
        this.uniDirection = "B";
      }
      this.computedAmount();
    },

    // input 组件在value发生变化是会触发，onInput事件造成二次运算，这里添加非focus输入框的变化不做运算
    inputAmount(direction) {
      if (this.focusDirection) {
        this.uniDirection = this.focusDirection;
      }

      if (direction === this.focusDirection) {
        this.computedAmount();
      }
    },

    submit() {
      this.paymentSheetWin = false;
      const json = {
        type: "hbtcchain/openswap/MsgAddLiquidity",
        value: {
          from: this.address,
          expired_at: `${
            this.config.transactionDeadline * 60 +
            Math.round(new Date().getTime() / 1000)
          }`,
          token_a: this.tokenA,
          token_b: this.tokenB,
          max_token_a_amount: Helper.bigNumber(this.amountA)
            .times(this.tokensMap[this.tokenA].pow)
            .toString(10),
          max_token_b_amount: Helper.bigNumber(this.amountB)
            .times(this.tokensMap[this.tokenB].pow)
            .toString(10),
        },
      };

      Helper.callHandler({
        name: "sign",
        data: json,
        success: (result) => {
          this.back();
          this.pushTxs(result.data);
        },
        error: (result) => {
          this.errorText = result.msg;
        },
      });
    },
  },
  created() {
    const { tokenA, tokenB } = Helper.symbol2Token(
      this.pair || this.$route.params.id,
      this.tokensMap
    );
    this.tokenA = tokenA || "hbc";
    this.tokenB = tokenB;
    this.computedAmount();
  },
};
</script>

<style scoped lang="less">
@import "../../libs/mixin";
.add-liquidity {
  /deep/ .van-nav-bar__content {
    align-items: inherit;
  }
  /deep/ .van-button--normal {
    font-size: 17px;
    text-align: left;
    padding: 0 1.5 * @grid;

    i {
      position: absolute;
      right: 1.5 * @grid;
      top: 1.5 * @grid;
    }

    .van-button__content {
      justify-content: left;
    }
    .van-button__text {
      margin-right: 2 * @grid;
      padding: 2px 0;
      .text-hide;
    }
    .van-image {
      vertical-align: middle;
      margin-top: -2px;
      margin-right: @grid;
    }
  }
  /deep/ .van-field__control {
    .text-hide;
  }
  .max {
    font-size: 13px;
    font-weight: 700;
    color: @primary-main;
  }

  .info {
    background: linear-gradient(0deg, #f9f9fb, #f9f9fb), #f4f7ff;
    padding: 1.5 * @grid;
    margin-bottom: 2 * @grid;
    line-height: 1.5;

    strong {
      display: block;
      .text-hide;
    }

    span {
      display: block;
      color: @gray-300;
      font-size: 12px;
      padding-top: 0.5 * @grid;
    }

    h4 {
      margin: 0 0 @grid;
      color: @gray-700;
      font-weight: 500;
    }

    /deep/ .van-col--8:last-child {
      text-align: right;
    }

    /deep/ .van-col--8:nth-child(2) {
      text-align: center;
    }
  }
}

.confirm-payment {
  .confirm {
    padding: 0 @space;

    .value {
      font-size: 30px;
      line-height: 7 * @grid;
      font-weight: 500;
      height: 7 * @grid;
    }

    .lable {
      margin-bottom: 3 * @grid;
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
    background: @gray-50;
    border-radius: 6px;
    padding: @space;
    position: relative;

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

    /deep/ .van-logos {
      margin-left: 0.5 * @grid;
      padding-right: 0;
    }
    .value {
      display: flex;
      align-items: center;
    }
  }
}
</style>