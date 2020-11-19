<template lang="pug">
.form(span="12")
  van-row.tabs(type="flex", justify="space-between")
    van-col(span="12", :class="{ active: !side }", @click="changeSide(0)") {{ $lang('trade.buy') }}
    van-col(span="12", :class="{ active: side }", @click="changeSide(1)") {{ $lang('trade.sell') }}
    em(:class="side ? 'em-red' : 'em-green'")
  van-field(
    :placeholder="$lang('trade.price')",
    v-model="price",
    type="number",
    :formatter="formatterAmountB"
  )
    template(#extra) {{ tokenB | toUP }}
  van-field(
    :placeholder="$lang('trade.amount')",
    v-model="amount",
    @input="changeAmount",
    type="number",
    :formatter="formatterAmountA"
  )
    template(#extra) {{ tokenA | toUP }}
  .amount.color-gray500
    .label {{ $lang('trade.available') }}：
    .value(v-if="side") {{ account.showAmountA }} {{ tokenA | toUP }}
    .value(v-else) {{ account.showAmountB }} {{ tokenB | toUP }}
  .slider(v-model="sliderValue")
    van-slider(
      v-model="sliderValue",
      bar-height="4px",
      @change="changeSlider",
      :disabled="!price"
    )
      template(#button)
        .custom-button {{ sliderValue }}
  .amount
    .label.color-gray500 {{ $lang('trade.totalAmount') }}：
    strong.value {{ takeAmount }} {{ tokenB | toUP }}
  van-button.btn(
    :class="{ 'sell-btn': side }",
    block,
    v-if="!address",
    @click="connectWalletWin = true"
  ) {{ $lang('head.connectWallet') }}
  van-button.btn.sell-btn(
    block,
    v-else-if="side",
    @click="submit",
    :disabled="!(amount > 0) || !(price > 0)"
  ) {{ buttonText('trade.sell') }}
  van-button.btn(block, v-else, @click="submit", :disabled="!amount || !price") {{ buttonText('trade.buy') }}
  WalletModal(v-model="connectWalletWin")
</template>
<script>
import { mapState, mapActions } from "vuex";
import { v4 as uuidv4 } from "uuid";
import Helper from "@/libs/helper";
import FormItem from "@/components/formItem.vue";

export default {
  components: {
    FormItem,
  },
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
    importData: {
      type: Object,
      default() {
        return {};
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
    importData() {
      this.price = this.importData.item.p || "";
      if (this.importData.type === "bid") {
        if (this.side) {
          this.amount =
            Math.min(this.importData.item.a, this.account.amountA) || "";
        } else {
          this.amount = "";
        }
      }

      if (this.importData.type === "ask") {
        if (this.side) {
          this.amount = "";
        } else {
          this.amount =
            Math.min(
              this.importData.item.a,
              Helper.bigNumber(this.account.amountB)
                .div(this.price)
                .toString(10)
                .cutFixed(this.tokensMap[this.tokenB].showDecimals)
            ) || "";
        }
      }
    },
  },
  computed: {
    ...mapState(["tokensMap", "assets", "pairs", "address", "config"]),
    account() {
      const amount = {
        amountA: 0,
        showAmountA: 0,
        amountB: 0,
        showAmountB: 0,
      };
      if (this.assets[this.tokenA]) {
        amount.amountA = this.formatterAmountA(this.assets[this.tokenA].amount);
        amount.showAmountA = this.formatterAmountA(
          this.assets[this.tokenA].showAmount
        );
      }
      if (this.assets[this.tokenB]) {
        amount.amountB = this.formatterAmountB(this.assets[this.tokenB].amount);
        amount.showAmountB = this.formatterAmountB(
          this.assets[this.tokenB].showAmount
        );
      }
      return amount;
    },
    takeAmount() {
      if (this.price && this.amount) {
        return this.formatterAmountB(
          Helper.bigNumber(this.price)
            .times(this.amount)
            .toString(10)
            .cutFixed(this.tokensMap[this.tokenB].showDecimals)
        );
      }
      return "--";
    },
  },
  data() {
    return {
      connectWalletWin: false,
      price: "",
      amount: "",
      sliderValue: 0,
      side: 1,
    };
  },
  methods: {
    ...mapActions(["pushTxs"]),
    BigNumber: Helper.bigNumber,
    formatterAmountB(val) {
      return Helper.formatter(this.tokensMap, this.tokenB, val);
    },
    formatterAmountA(val) {
      return Helper.formatter(this.tokensMap, this.tokenA, val);
    },
    buttonText(defaultText) {
      if (this.price > 0 && this.amount > 0) {
        return this.$lang(defaultText);
      }
      if (this.price > 0) {
        return this.$lang("trade.enterAmount");
      }
      return this.$lang("trade.enterPrice");
    },
    changeAmount() {
      if (this.side) {
        this.sliderValue = Math.round(
          (this.amount * 100) / this.account.amountA
        );
      } else {
        this.sliderValue = Math.round(
          (this.amount * 100) /
            Helper.bigNumber(this.account.amountB).div(this.price)
        );
      }

      if (this.amount <= 0) {
        this.sliderValue = 0;
      }

      this.sliderValue = Math.min(this.sliderValue, 100);
    },

    changeSide(val) {
      if (val !== this.side) {
        this.side = val;
        this.sliderValue = 0;
        this.amount = "";
      }
    },
    changeSlider(val) {
      if (this.side) {
        this.amount = Helper.bigNumber(this.account.amountA)
          .times(val)
          .div(100)
          .toString(10);
      } else {
        this.amount = Helper.bigNumber(this.account.amountB)
          .div(this.price)
          .times(val)
          .div(100)
          .toString(10)
          .cutFixed(this.tokensMap[this.tokenB].showDecimals);
      }
    },

    submit() {
      this.$emit("click", "clearTip");
      const json = {
        type: "hbtcchain/openswap/MsgLimitSwap",
        value: {
          from: this.address,
          referer: this.address,
          receiver: this.address,
          expired_at: "-1",
          order_id: uuidv4(),
          amount_in: "",
          price: "",
          base_symbol: this.tokenA,
          quote_symbol: this.tokenB,
          side: `${this.side}`,
        },
      };
      if (this.side) {
        json.value.amount_in = Helper.bigNumber(this.amount)
          .times(this.tokensMap[this.tokenA].pow)
          .toString(10);
        json.value.price = Helper.bigNumber(this.price)
          .times(this.pairs[this.pair].gap)
          .toString(10)
          .cutFixed(18);
      } else {
        json.value.price = Helper.bigNumber(this.price)
          .times(this.pairs[this.pair].gap)
          .toString(10)
          .cutFixed(18);
        json.value.amount_in = Helper.bigNumber(this.takeAmount)
          .times(this.tokensMap[this.tokenB].pow)
          .toString(10);
      }

      Helper.callHandler({
        name: "sign",
        data: json,
        success: (result) => {
          this.amount = 0;
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

.form {
  .tabs {
    overflow: hidden;
    background: @white;
    box-shadow: 0px 1px 1px rgba(36, 43, 50, 0.1),
      0px 0px 10px rgba(36, 43, 50, 0.05);
    border-radius: 2px;
    position: relative;

    /deep/ .van-col {
      text-align: center;
      font-size: 16px;
      font-weight: 700;
      color: @gray-900;
      height: 40px;
      line-height: 40px;

      &.active {
        color: @white;
      }

      &:first-of-type {
        &.active {
          background-color: @green;
        }
      }

      &:last-of-type {
        &.active {
          background-color: @error;
        }
      }
    }

    em {
      content: "";
      position: absolute;
      top: 0;
      right: calc(50% - 8px);

      &.em-green {
        border-top: 20px solid @white;
        border-right: @grid solid @white;
        border-left: @grid solid @green;
        border-bottom: 20px solid @green;
      }

      &.em-red {
        border-top: 20px solid @error;
        border-right: @grid solid @error;
        border-left: @grid solid @white;
        border-bottom: 20px solid @white;
      }
    }
  }

  /deep/ .van-field {
    margin-top: 3 * @grid;
  }

  .amount {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2 * @space;
    height: 36px;
    line-height: 36px;

    .value {
      max-width: 70%;
      .text-hide;
    }
  }

  .slider {
    height: 20px;
    padding-top: @grid;
    margin: 0 @space;
  }

  .custom-button {
    min-width: 36px;
    color: @white;
    font-size: 16px;
    line-height: 24px;
    text-align: center;
    background-color: @primary-light;
    border-radius: 100px;
    transform: scale(0.8);
  }

  .btn {
    border-radius: 2px;
    height: 40px;
    color: @white;
    font-size: 16px;
    font-weight: 700;
    background: @green;
    border-color: @green;
  }

  .sell-btn {
    background: @error;
    border-color: @error;
  }
}
</style>
