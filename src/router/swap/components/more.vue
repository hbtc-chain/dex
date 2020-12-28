<template lang="pug">
.more(v-if="data.amountA && data.amountB")
  .item(v-if="data.transforDirection == 'B'")
    .lable {{ $lang('swap.minimumReceived') }}
      // Icon(name="question")
    .value {{ data.result.minimumReceived }} {{ data.tokenName(data.tokenB) }}
  .item(v-else)
    .lable {{ $lang('swap.maximumSold') }}
      // Icon(name="question")
    .value {{ data.result.maximumSold }} {{ data.tokenName(data.tokenA) }}
  .item
    .lable {{ $lang('swap.priceImpact') }}
      // Icon(name="question")
    .value {{ data.result.priceImpact.cutFixed(2) }}%
  .item
    .lable {{ $lang('swap.liquidityProviderFee') }}
      // Icon(name="question")
    .value {{ BigNumber(data.amountA).times(data.fee).toString(10) }} {{ data.tokenName(data.tokenB) }}
  router-link.view(:to="viewLink") {{ $lang('swap.viewPairAnalytics') }}
  .route(v-if="data.result.route.length > 1")
    .item
      .lable {{ $lang('swap.route') }}
        // Icon(name="question")
    van-row(type="flex", align="center")
      van-col(span="6")
        Logo(:tokens="[data.tokenA]")
        | {{ data.tokenName(data.tokenA) }}
      template(v-for="item in data.result.route")
        van-col(span="3")
          Icon(name="more-line", size="24")
        van-col(span="6")
          Logo(:tokens="[item.tokenB.symbol]")
          | {{ data.tokenName(item.tokenB.symbol) }}
</template>

<script>
import { mapState } from "vuex";
import Helper from "@/libs/helper";

export default {
  props: {
    data: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    ...mapState(["pairs"]),
    viewLink() {
      return {
        name: "scanDetail",
        params: {
          id: this.pairs[[this.data.tokenA, this.data.tokenB].join("-")].id,
        },
      };
    },
  },
  data() {
    return {};
  },
  methods: {
    BigNumber: Helper.bigNumber,
  },
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";
.more {
  margin: -2 * @grid @space 0;
  background: linear-gradient(0deg, #f9f9fb, #f9f9fb), #f4f7ff;
  box-shadow: 0px 0px 12px rgba(31, 93, 193, 0.16);
  border-radius: @grid;
  padding: 3 * @grid @space;
  position: relative;

  .item {
    display: flex;
    justify-content: space-between;
    line-height: 4 * @grid;

    i {
      margin-left: 0.5 * @grid;
      vertical-align: middle;
    }
  }

  .label {
    display: flex;
    align-items: center;
    line-height: 32px;
    white-space: nowrap;
  }

  .value {
    .text-hide;
    max-width: 40%;
  }
}

.route {
  border-top: 1px dashed @gray-100;
  margin-top: @grid;
  padding-top: @grid;

  /deep/ .van-row {
    margin-top: 0.5 * @grid;
  }

  /deep/ .van-col {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.view {
  display: block;
  border: 1px solid @gray-100;
  text-align: center;
  padding: 5px;
  margin-top: @grid;
  border-radius: 0.5 * @grid;
  background: @gray-100;
  color: @primary-main;
}
</style>
