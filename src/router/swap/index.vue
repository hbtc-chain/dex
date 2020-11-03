<template lang="pug">
Main.swap
  .form
    FormItem(
      :lable="labelA",
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
            | {{ tokenName(tokenA) }}
            Icon(name="arrowdown", size="16")
        van-col(span="14")
          van-field(
            :formatter="formatterAmountA",
            :placeholder="$lang('swap.enterAmount')",
            v-model="amountA",
            @focus="focusDirection = 'B'",
            @blur="focusDirection = null",
            @input="inputAmount('B')",
            type="number"
          )
            template(#extra)
              a.max(@click="maxAmount(tipBalance(tokenA, 'amount'))") {{ $lang('swap.max') }}
    FormItem.option
      van-row(gutter="8")
        van-col(span="12")
          Icon(
            name="arrowdown2",
            @click="changePosition",
            fill,
            :rotate="transforDirection === 'A'"
          )
        van-col(span="12", style="textAlign:right")
          Icon(name="setting", @click="setState({ configWin: true })", fill)
    FormItem(
      :lable="toLabel",
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
            | {{ tokenName(tokenB) }}
            Icon(name="arrowdown", size="16")
        van-col(span="14")
          van-field(
            :placeholder="$lang('swap.enterAmount')",
            :formatter="formatterAmountB",
            v-model="amountB",
            @focus="focusDirection = 'A'",
            @blur="focusDirection = null",
            @input="inputAmount('A')",
            type="number"
          )
    FormItem(:lable="$lang('swap.price')", v-if="amountA && amountB")
      template(slot="tips") {{ swapPrice }}
        Icon.icon(
          :class="{ 'color-info': reversePrice }",
          @click="reversePrice = !reversePrice",
          name="exchange",
          size="24"
        )
    FormItem(:lable="$lang('swap.slippageTolerance')")
      template(slot="tips") {{ config.slippageTolerance }}%
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
      @click="confirmSwap",
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
  template(#more)
    More(:data="outData")
  WalletModal(v-model="connectWalletWin")
  Tokens(
    v-model="tokenSheetWin",
    @change="selectToken",
    :disabledItem="[tokenA, tokenB]"
  )
  ConfirmPayment(
    v-model="paymentSheetWin",
    :data="outData",
    :tokenA="tokenA",
    :tokenB="tokenB",
    @click="submit"
  )
</template>

<script>
import { mapState, mapActions } from "vuex";
import Helper from "@/libs/helper";
import FormItem from "@/components/formItem.vue";
import Tokens from "@/components/tokens.vue";
import More from "./components/more.vue";
import ConfirmPayment from "./components/confirm-payment.vue";

export default {
  components: {
    FormItem,
    Tokens,
    More,
    ConfirmPayment,
  },
  created() {
    const { tokenA, tokenB } = Helper.symbol2Token(
      this.$route.params.id,
      this.tokensMap
    );
    this.tokenA = tokenA || "hbc";
    this.tokenB = tokenB || "";
    this.computedAmount();
  },
  data() {
    return {
      fee: 0.003,
      connectWalletWin: false,
      tokenSheetWin: false,
      paymentSheetWin: false,
      currentDirection: "",
      focusDirection: null,
      transforDirection: "B",

      reversePrice: false,

      tokenA: "",
      amountA: "",
      tokenB: "",
      amountB: "",

      result: {
        maximumSold: "",
        minimumReceived: "",
        priceImpact: "",
        route: [],
      },
      errorText: "",
    };
  },
  computed: {
    ...mapState([
      "tokens",
      "tokensMap",
      "assets",
      "address",
      "symbols",
      "config",
    ]),
    outData() {
      return this;
    },
    confirmWarning() {
      if (this.transforDirection === "B") {
        return this.$lang("swap.confirmWarningOutput")
          .replace("{amount}", this.result.minimumReceived)
          .replace("{token}", this.tokenB.toLocaleUpperCase());
      }
      return this.$lang("swap.confirmWarningInput")
        .replace("{amount}", this.result.maximumSold)
        .replace("{token}", this.tokenA.toLocaleUpperCase());
    },
    buttonStatus() {
      const data = {
        text: "",
        isok: false,
        type: "default",
      };
      const pair = [...this.result.route].pop();
      const assets = this.assets[this.tokenA];
      if (
        (!this.amountA && this.transforDirection === "B") ||
        (!this.amountB && this.transforDirection === "A")
      ) {
        data.text = this.$lang("swap.enterAnAmount");
      } else if (!assets || Number(this.amountA) > Number(assets.amount)) {
        data.text = this.$lang("swap.insufficientBalance").replace(
          "{token}",
          this.tokenA.toLocaleUpperCase()
        );
      } else if (!this.tokenA || !this.tokenB) {
        data.text = this.$lang("swap.selectToken");
      } else if (!pair || Number(this.amountB) > Number(pair.tokenB.amount)) {
        data.text = this.$lang("swap.insufficientLiquidity");
      } else {
        data.text = this.$lang("tabs.swap");
        data.isok = true;
      }
      return data;
    },

    labelA() {
      if (this.transforDirection === "B") {
        return this.$lang("swap.from");
      }
      return `${this.$lang("swap.from")}(${this.$lang("swap.estimated")})`;
    },
    toLabel() {
      if (this.transforDirection === "A") {
        return this.$lang("swap.to");
      }
      return `${this.$lang("swap.to")}(${this.$lang("swap.estimated")})`;
    },
    computeSwapPrice() {
      const tokenA = this.tokenA.toLocaleUpperCase();
      const tokenB = this.tokenB.toLocaleUpperCase();
      if (this.reversePrice) {
        const price = Helper.bigNumber(this.amountB)
          .div(this.amountA)
          .toString(10)
          .cutFixed(this.tokensMap[this.tokenB].showDecimals);
        return [tokenB, tokenA, price];
      }
      const price = Helper.bigNumber(this.amountA)
        .div(this.amountB)
        .toString(10)
        .cutFixed(this.tokensMap[this.tokenA].showDecimals);
      return [tokenA, tokenB, price];
    },

    swapPrice() {
      const [tokenA, tokenB, price] = this.computeSwapPrice;
      const str = this.$lang("swap.swapPrice");
      return str
        .replace("{tokenA}", tokenA)
        .replace("{tokenB}", tokenB)
        .replace("{price}", price);
    },

    confirmSwapPrice() {
      const [tokenA, tokenB, price] = this.computeSwapPrice;
      return `${price} ${tokenA}/${tokenB}`;
    },

    dataResult() {
      const result = [];
      Helper.generateRouteNodeV2(
        this.tokenA,
        this.tokenB,
        this.symbols
      ).forEach((route) => {
        const data = {
          beforPrice: 1,
          afterPrice: 1,
          route,
        };
        if (this.transforDirection === "B") {
          data.route.forEach((el) => {
            const amountA = data.amountB || this.amountA;
            data.amountB =
              Helper.tokenAtoB(
                el,
                amountA,
                this.fee,
                this.tokensMap[el.tokenB.symbol].decimals
              ) || "";
            Object.assign(data, {
              minimumReceived: Helper.minimumReceived(
                amountA,
                data.amountB,
                this.config.slippageTolerance
              ).cutFixed(this.tokensMap[this.tokenB].decimals),
              ...Helper.priceImpact(el, data, amountA, data.amountB),
            });
          });
          if (data.amountB > 0) {
            result.push(data);
          }
        } else {
          [...data.route].reverse().forEach((el) => {
            const amountB = data.amountA || this.amountB;
            data.amountA =
              Helper.tokenBtoA(
                el,
                amountB,
                this.fee,
                this.tokensMap[el.tokenA.symbol].decimals
              ) || "";

            Object.assign(data, {
              maximumSold: Helper.maximumSold(
                data.amountA,
                amountB,
                this.config.slippageTolerance
              ).cutFixed(this.tokensMap[this.tokenA].decimals),
              ...Helper.priceImpact(el, data, data.amountA, amountB),
            });
          });
          if (data.amountA > 0) {
            result.push(data);
          }
        }
      });
      return result;
    },
  },

  methods: {
    ...mapActions(["setState"]),
    submit(result) {
      if (result.code !== 200) {
        this.errorText = result.msg;
      }
    },
    confirmSwap() {
      this.errorText = "";
      this.paymentSheetWin = true;
    },
    formatterAmountA(val) {
      return Helper.formatter(this.tokensMap, this.tokenA, val);
    },
    formatterAmountB(val) {
      return Helper.formatter(this.tokensMap, this.tokenB, val);
    },

    BigNumber: Helper.bigNumber,

    showActionSheet(direction) {
      this.currentDirection = direction;
      this.tokenSheetWin = true;
    },

    // A && B tokenName
    tokenName(token) {
      return token ? token.toLocaleUpperCase() : this.$lang("swap.selectToken");
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

    // 切换 A && B
    changePosition() {
      const clone = { ...this };

      this.tokenB = clone.tokenA;
      this.tokenA = clone.tokenB;

      if (this.transforDirection === "A") {
        this.transforDirection = "B";
        this.amountA = clone.amountB;
      } else {
        this.transforDirection = "A";
        this.amountB = clone.amountA;
      }

      this.computedAmount();
    },

    computedAmount() {
      const result = [...this.dataResult];
      const amountKey = `amount${this.transforDirection}`;
      const tokenInfo = this.tokensMap[this[`token${this.transforDirection}`]];
      if (result.length) {
        result.sort((a, b) => {
          if (this.transforDirection === "B") {
            return b.amountB - a.amountB;
          }
          return a.amountA - b.amountA;
        });
        Object.assign(this.result, result[0]);
      } else {
        Object.assign(this.result, {
          amountA: "",
          amountB: "",
          maximumSold: "",
          minimumReceived: "",
          priceImpact: "",
          route: [],
        });
      }

      this[amountKey] = this.result[amountKey];

      if (tokenInfo) {
        this[amountKey] = this[amountKey].cutFixed(tokenInfo.decimals);
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
    maxAmount(amount) {
      if (amount) {
        this.transforDirection = "B";
        this.amountA = amount;
        this.computedAmount();
      }
    },

    // input 组件在value发生变化是会触发，onInput事件造成二次运算，这里添加非focus输入框的变化不做运算
    inputAmount(direction) {
      if (this.focusDirection) {
        this.transforDirection = this.focusDirection;
      }

      if (direction === this.focusDirection) {
        this.computedAmount();
      }
    },
  },
};
</script>

<style scoped lang="less">
@import "./index.less";
</style>
