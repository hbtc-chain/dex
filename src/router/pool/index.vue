<template lang="pug">
Main.pool(:showTabs="tab === 'list'")
  // 添加流动性
  AddLiquidity(v-if="tab === 'add'", v-model="tab", :pair="pair")
  // 减少流动性
  RemoveLiquidity(v-if="tab === 'remove'", v-model="tab", :data="removeData")

  //已支持的流动性列表
  template(v-if="tab === 'list'")
    van-button(type="info", block, @click.stop.prevent="add()", size="large") + {{ $lang('pool.addLiquidity') }}

    van-divider {{ $lang('pool.yourLiquidity') }}
    van-collapse.liquidity-list(
      v-if="liquidity.length",
      v-model="activeName",
      accordion,
      :border="false"
    )
      van-collapse-item(
        v-for="(item, index) in liquidity",
        :name="index",
        :key="item.pair.tokenA.symbol + item.pair.tokenB.symbol",
        :border="false"
      )
        template(#title)
          Logo(:tokens="[item.pair.tokenA.symbol, item.pair.tokenB.symbol]")
          | {{ item.pair.tokenA.symbol | toUP }}/{{ item.pair.tokenB.symbol | toUP }}
        .more
          .item
            .label {{ $lang('pool.pooled') }} {{ item.pair.tokenA.symbol | toUP }}
            .value {{ item.pair.tokenA.amount.cutFixed(tokensMap[item.pair.tokenA.symbol].showDecimals) }}
              Logo(size="16", :tokens="[item.pair.tokenA.symbol]")
          .item
            .label {{ $lang('pool.pooled') }} {{ item.pair.tokenB.symbol | toUP }}
            .value {{ item.pair.tokenB.amount.cutFixed(tokensMap[item.pair.tokenB.symbol].showDecimals) }}
              Logo(size="16", :tokens="[item.pair.tokenB.symbol]")
          .item
            .label {{ $lang('pool.yourPoolShare') }}
            .value {{ poolShare(item) }}%
        van-row(:gutter="8")
          van-col(span="8") &nbsp;
          van-col(span="8")
            van-button(size="small", block, @click.stop.prevent="remove(item)") - {{ $lang('pool.remove') }}
          van-col(span="8")
            van-button(size="small", block, @click.stop.prevent="add(item)") + {{ $lang('pool.add') }}
    .empty(v-else)
      van-empty(v-if="liquidityApiReady || !address")
      van-loading(v-else)
</template>

<script>
import { mapState } from "vuex";
import Helper from "@/libs/helper";
import AddLiquidity from "./addLiquidity.vue";
import RemoveLiquidity from "./removeLiquidity.vue";

export default {
  components: {
    AddLiquidity,
    RemoveLiquidity,
  },
  computed: {
    ...mapState(["liquidity", "liquidityApiReady", "tokensMap", "address"]),
  },
  data() {
    return {
      removeData: {},
      pair: "",
      tab: this.$route.params.id ? "add" : "list",
      activeName: 0,
    };
  },
  methods: {
    poolShare(item) {
      return Helper.bigNumber(item.liquidityShare)
        .times(100)
        .toString(10)
        .cutFixed(2);
    },
    remove(data) {
      this.removeData = data;
      this.tab = "remove";
    },
    add(data) {
      if (data) {
        this.pair = [data.pair.tokenA.symbol, data.pair.tokenB.symbol].join(
          "-"
        );
      } else {
        this.pair = "";
      }

      this.tab = "add";
    },
    userShareTokenAmount(item, key) {
      return Helper.bigNumber(item.pair[`token${key}`].amount)
        .times(item.liquidityShare)
        .toString(10)
        .cutFixed(2);
    },
  },
};
</script>

<style scoped lang="less">
@import "../../libs/mixin";
.pool {
  /deep/ .van-action-sheet__header {
    height: 3 * @grid;
    line-height: 24px;
    font-size: 20px;
    text-align: left;
    padding: 3 * @grid @space 2 * @grid;
    font-weight: 400;
  }

  /deep/ .van-popup--bottom.van-popup--round {
    border-radius: @grid @grid 0 0;
  }

  /deep/ .van-action-sheet__close {
    padding-right: @space;
    line-height: 9 * @grid;
    color: @gray-900;
  }

  /deep/ .van-nav-bar {
    margin: 0 -@space;
    height: 3 * @grid;
    line-height: 3 * @grid;
    font-size: 20px;
    text-align: left;
    padding-bottom: 3 * @grid;
  }

  /deep/ .van-nav-bar__left {
    margin-top: -3 * @grid;
    padding-left: @space;
  }

  .empty {
    border: 2px dashed @gray-100;
    box-sizing: border-box;
    border-radius: 6px;
    min-height: 29 * @grid;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.liquidity-list {
  /deep/ .van-collapse-item {
    margin-bottom: @grid;

    .van-button {
      color: @primary-main;
      background: fade(@primary-main, 10);
      font-weight: 700;
    }

    .van-cell {
      border-radius: 0.5 * @grid;
      height: 7 * @grid;
      padding: 2 * @grid;

      .van-cell__right-icon {
        color: @gray-500;
        font-weight: 700;
      }
    }

    .van-cell,
    .van-collapse-item__content {
      background: @gray-50;
    }

    .van-cell__title {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 17px;
    }

    .van-collapse-item__content {
      padding-top: 0;
    }
  }

  .more {
    border-top: 1px dashed @gray-100;
    padding: @grid 0;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3 * @grid;
    margin-top: 0.5 * @grid;

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