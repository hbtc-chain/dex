<template lang="pug">
.info
  .title
    Logo(:tokens="pair.split('-')")
    | {{ pair | toUP }} {{ $lang('scan.pair') }}
  .item
    Logo(:tokens="[pairInfo.tokenA.symbol]")
    | 1 {{ pairInfo.tokenA.symbol | toUP }}={{ pairInfo.tokenA.price.cutFixed(tokensMap[pairInfo.tokenA.symbol].showDecimals) }} {{ pairInfo.tokenB.symbol | toUP }} (${{prices[pairInfo.tokenA.symbol]}})
  .item
    Logo(:tokens="[pairInfo.tokenB.symbol]")
    | 1 {{ pairInfo.tokenB.symbol | toUP }}={{ pairInfo.tokenB.price.cutFixed(tokensMap[pairInfo.tokenB.symbol].showDecimals) }} {{ pairInfo.tokenA.symbol | toUP }} (${{prices[pairInfo.tokenB.symbol]}})
  van-row(:gutter="8")
    van-col(span="12")
      van-button(type="default", :to="`/pool/${pair}`", block) + {{ $lang('scan.pairs.addLiquidity') }}
    van-col(span="12")
      van-button(type="info", :to="`/swap/${pair}`", block) {{ $lang('scan.pairs.trade') }}
</template>
<script>
import { mapState } from "vuex";

export default {
  props: {
    pair: {
      type: String,
      default: "",
    },
    prices: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    ...mapState(["tokensMap", "pairs"]),
    pairInfo() {
      return this.pairs[this.pair];
    },
  }
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";
.info {
  box-shadow: 0px 0px 12px rgba(31, 93, 193, 0.16);
  border-radius: 10px;
  margin: 0 0 @grid;
  background: #fff;
  padding: 2 * @grid 3 * @grid;
  .title {
    font-size: 20px;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-bottom: 2 * @grid;
  }
  .item {
    display: flex;
    height: 5 * @grid;
    align-items: center;
    font-size: 17px;
    font-weight: 500;
    color: @gray-500;
    margin-bottom: 2 * @grid;
  }
  /deep/ .van-button--default {
    background: @gray-200;
    color: #fff;
    border-color: @gray-200;
  }
}
</style>