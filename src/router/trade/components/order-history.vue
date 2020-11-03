<template lang="pug">
.order-history
  template(v-if="data.length")
    .item(v-for="item in sliceTrades")
      .title
        .type
          span(:class="`type-${item.type}`") {{ $lang(`trade.${types[item.type]}`) }}
          span {{ item.tokenA | toUP }}/{{ item.tokenB | toUP }}
        .time {{ new Date(item.time * 1000).format('MM/dd hh:mm:ss') }}
      ul
        li
          label {{ $lang('trade.tradeAmount') }}({{ item.tokenB | toUP }})
          span {{ item.tokenBAmount.cutFixed(4) }}
        li
          label {{ $lang('trade.avgPrice') }}({{ item.tokenB | toUP }})
          span {{ (item.tokenBAmount / item.tokenAAmount).cutFixed(4) }}
        li
          label {{ $lang('trade.filled') }}({{ item.tokenA | toUP }})
          span {{ item.tokenAAmount.cutFixed(4) }}
      ul
        li
          label {{ $lang('trade.totalValue') }}
          span {{ item.volume.cutFixed(4) }}
        li
          label {{ $lang('trade.tradeType') }}
          span(v-if="item.type > 2") {{ $lang('trade.liquidity') }}
          span(v-else) {{ $lang(item.isLimit ? 'tabs.trade' : 'tabs.swap') }}
        li
          label {{ $lang('trade.detail') }}
          span
            Hash(:text="item.txHash", substr)
    Page(
      :total="data.length",
      :value="currentPage",
      :page-size="pageSize",
      @on-change="changePage",
      v-if="data.length > pageSize"
    )
  .empty(v-else)
    van-empty(v-if="apiReady || !address")
    van-loading(v-else)
</template>
<script>
import { mapState } from "vuex";

export default {
  props: {
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
  computed: {
    ...mapState(["address"]),
    sliceTrades() {
      return this.data.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      );
    },
  },
  data() {
    return {
      types: {
        1: "sell",
        2: "buy",
        3: "add",
        4: "remove",
      },
      currentPage: 1,
      pageSize: 10,
    };
  },
  methods: {
    changePage(n) {
      this.currentPage = n;
    }
  },
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";
.order-history {
  padding-bottom: 2 * @grid;
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 29 * @grid;
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
  ul {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @grid 0 0;
    li {
      width: 33.33%;
      span,
      label {
        display: block;
        .text-hide;
        font-weight: 500;
        font-size: 16px;
        color: @gray-700;
      }

      label {
        color: @gray-300;
        font-size: 13px;
      }
      a {
        color: @primary-main;
        font-weight: 500;
      }

      &:nth-child(1) {
        span,
        label {
          transform: scale(0.8) translateX(-10%);
        }
      }

      &:nth-child(2) {
        span,
        label {
          transform: scale(0.8);
        }
        text-align: center;
      }
      &:nth-child(3) {
        text-align: right;
        span,
        label {
          transform: scale(0.8) translateX(10%);
        }
      }
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
}
</style>
