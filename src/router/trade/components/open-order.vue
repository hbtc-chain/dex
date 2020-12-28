<template lang="pug">
.open-order
  template(v-if="data.length")
    //- .cancel-all
    //-   van-button(plain, type="primary", size="small", @click="cancelAllOrder") {{ $lang('trade.cancelAll') }}
    Alert(type="error", icon="warning", v-if="errorText") {{ errorText }}
    .item(v-for="item in data")
      .title
        .type
          span(:class="`type-${item.side}`") {{ $lang(`trade.${types[item.side]}`) }}
          span {{ tokensMap[item.baseSymbol].name }}/{{ tokensMap[item.quoteSymbol].name }}
        .time {{ new Date(item.createTime * 1000).format() }}
      van-row
        van-col(span="6")
          label.color-gray300 {{ $lang('trade.openAmount') }}
        van-col(span="18", v-if="item.side") {{ amountDown(item.amountIn, item.baseSymbol).cutFixed(tokensMap[item.baseSymbol].showDecimals) }}{{ tokensMap[item.baseSymbol].name }}
        van-col(span="18", v-else) {{ amountDown(BigNumber(item.amountIn).div(item.price), item.baseSymbol).cutFixed(tokensMap[item.baseSymbol].showDecimals) }}{{ tokensMap[item.baseSymbol].name }}
      van-row
        van-col(span="6")
          label.color-gray300 {{ $lang('trade.price') }}
        van-col(span="18") {{ priceDown(item.price, item.quoteSymbol) }} {{ tokensMap[item.quoteSymbol].name }}
      van-row
        van-col(span="6")
          label.color-gray300 {{ $lang('trade.filled') }}
        van-col(span="12", v-if="item.side") {{ amountDown(BigNumber(item.amountIn).minus(item.lockedFund), item.baseSymbol).cutFixed(tokensMap[item.baseSymbol].showDecimals) }}{{ tokensMap[item.baseSymbol].name }}
        van-col(span="12", v-else) {{ amountDown(BigNumber(item.amountIn).minus(item.lockedFund).div(item.price), item.baseSymbol).cutFixed(tokensMap[item.baseSymbol].showDecimals) }}{{ tokensMap[item.baseSymbol].name }}
        van-col.cancel(span="6")
          van-button(
            plain,
            type="primary",
            size="small",
            @click="cancelOrder(item.orderID)"
          ) {{ $lang('trade.cancel') }}
  .empty(v-else)
    van-empty(v-if="apiReady || !address")
    van-loading(v-else)
</template>
<script>
import { mapState, mapActions } from "vuex";
import Helper from "@/libs/helper";

export default {
  props: {
    pair: {
      type: String,
      default: "",
    },
    data: {
      type: Array,
      defaul() {
        return [];
      },
    },
    apiReady: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      errorText: "",
      types: {
        1: "sell",
        2: "buy",
        3: "add",
        4: "remove",
      },
    };
  },
  computed: {
    ...mapState(["tokensMap", "address", "pairs"]),
  },
  methods: {
    ...mapActions(["pushTxs"]),
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
    cancelAllOrder() {
      this.cancelOrder(this.data.map((el) => el.orderID).join(","));
    },
    cancelOrder(ids) {
      this.errorText = "";
      const json = {
        type: "hbtcchain/openswap/MsgCancelLimitSwap",
        value: {
          from: this.address,
          order_ids: ids.split(","),
        },
      };
      Helper.callHandler({
        name: "sign",
        data: json,
        success: (result) => {
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
@import "../../../libs/mixin";
.open-order {
  padding-bottom: 2 * @grid;
}
.cancel-all {
  display: flex;
  justify-content: flex-end;
  padding: 1.5 * @grid @grid @grid;
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 29 * @grid;
}

/deep/ .van-button {
  height: 24px;
  font-size: 12px;
  color: @primary-main;
  border-color: fade(@primary-main, 10%);
  border-radius: 2px;
  min-width: 52px;
  background: fade(@primary-main, 10%);
}

.item {
  padding: @space;
  border-bottom: 1px solid @gray-80;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .type {
      font-size: 15px;
      font-weight: 500;
    }
    .time {
      font-size: 12px;
      color: @gray-500;
    }
    span {
      padding-right: 2 * @grid;
    }
  }

  .type-1,
  .type-3 {
    color: @error;
  }

  .type-2,
  .type-4 {
    color: @green;
  }
  .van-row {
    font-size: 12px;
    line-height: 16px;
    padding-top: @grid;
    color: @gray-900;

    label {
      margin-right: @grid;
      color: @gray-300;
    }

    .cancel {
      text-align: right;
      position: relative;
      bottom: 8px;
      margin-bottom: -8px;
    }
  }
}
</style>
