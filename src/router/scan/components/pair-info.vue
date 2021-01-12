<template lang="pug">
.info(v-if="prices[pairInfo.tokenA.symbol]")
  .title
      Logo(:tokens="pair.split('-')")
      | {{ tokensMap[pairInfo.tokenA.symbol].fullName }}-{{ tokensMap[pairInfo.tokenB.symbol].fullName }} {{ $lang('scan.pair') }}
  van-row
    van-col(span="8")
      .item
        Logo(:tokens="[pairInfo.tokenA.symbol]")
        | 1 {{ tokensMap[pairInfo.tokenA.symbol].name }} = {{ pairInfo.tokenA.price.cutFixed(6) }} {{ tokensMap[pairInfo.tokenB.symbol].name }}(${{ prices[pairInfo.tokenA.symbol].cutFixed(4) }})
    van-col(span="8")
      .item
        Logo(:tokens="[pairInfo.tokenB.symbol]")
        | 1 {{ tokensMap[pairInfo.tokenB.symbol].name }} = {{ pairInfo.tokenB.price.cutFixed(6) }}{{ tokensMap[pairInfo.tokenA.symbol].name }} (${{ prices[pairInfo.tokenB.symbol].cutFixed(4) }})
    van-col(span="8")
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
  },
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";
.info {
  box-shadow: 0px 0px 12px rgba(31, 93, 193, 0.16);
  border-radius: 10px;
  margin: 0 0 2 * @grid;
  background: #fff;
  padding: 2 * @grid 2 * @grid;
  .title {
    font-size: 18px;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-bottom: 2 * @grid;
  }
  .item {
    display: flex;
    height: 5 * @grid;
    align-items: center;
    font-size: 14px;
    color: @gray-500;
  }
  /deep/ .van-button--default {
    background: fade(@primary-main, 10%);
    color: @primary-main;
    margin-right: 6px;
  }
  /deep/ .van-button{
    height: 38px;
    line-height: 38px;
    border: none;
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>