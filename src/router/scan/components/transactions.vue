<template lang="pug">
div
  vxe-table(:data="sliceTrades", border="inner")
    template(v-slot:empty)
      van-empty
    vxe-table-column(
      field="pair",
      :title="$lang('scan.transactions.name')",
      minWidth="220"
    )
      template(v-slot:header)
        .tabs
          span(
            :class="{ current: currentType === item }",
            @click="changeType(item)",
            v-for="item in types"
          ) {{ $lang(`scan.transactions.${item}`) }}
      template(v-slot="{row}")
        Hash(:text="row.txHash") {{ formatTradeType(row) }}
    vxe-table-column(
      field="volume",
      :title="$lang('scan.transactions.totalValue')",
      minWidth="120",
      sortable
    )
      template(v-slot="{ row }") ${{ row.volume.cutFixed(0) }}
    vxe-table-column(
      field="tokenAAmount",
      :title="$lang('scan.transactions.tokenAmount')",
      minWidth="150"
      show-overflow
    )
      template(v-slot="{ row }") {{ (row.tokenAAmount || 0).cutFixed(0) }} {{ tokensMap[row.tokenA].name }}
    vxe-table-column(
      field="tokenBAmount",
      :title="$lang('scan.transactions.tokenAmount')",
      minWidth="150"
      show-overflow
    )
      template(v-slot="{ row }") {{ (row.tokenBAmount || 0).cutFixed(0) }} {{ tokensMap[row.tokenB].name }}
    vxe-table-column(
      :title="$lang('scan.transactions.account')",
      minWidth="150"
      show-overflow
    )
      template(v-slot="{ row }")
        Account(:text="row.from", substr)
    vxe-table-column(
      field="time",
      :title="$lang('scan.transactions.time')",
      minWidth="150",
      sortable
      align="right"
    )
      template(v-slot="{ row }") {{ new Date(row.time * 1000).format('MM/dd hh:mm:ss') }}
  Page(
    :total="filterTrades.length",
    :value="currentPage",
    :page-size="pageSize",
    @on-change="changePage",
    v-if="filterTrades.length"
  )
</template>
<script>
import { mapState } from "vuex";

export default {
  props: {
    pair: {
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapState(["tokensMap"]),
    filterTrades() {
      let list = [...this.trades];
      if (this.currentType === "swaps") {
        list = this.trades.filter((el) => el.type === 1 || el.type === 2);
      } else if (this.currentType === "adds") {
        list = this.trades.filter((el) => el.type === 3);
      } else if (this.currentType === "removes") {
        list = this.trades.filter((el) => el.type === 4);
      }
      return list;
    },
    sliceTrades() {
      return this.filterTrades.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      );
    },
  },
  data() {
    return {
      currentType: "all",
      types: ["all", "swaps", "adds", "removes"],
      trades: [],
      currentPage: 1,
      pageSize: 10,
    };
  },
  methods: {
    changeType(type) {
      if (this.currentType !== type) {
        this.currentType = type;
        this.changePage(1);
      }
    },
    changePage(n) {
      this.currentPage = n;
    },
    formatTradeType(row) {
      let type = this.$lang("scan.transactions.tradeSwap");
      const tokenA = this.tokensMap[row.tokenA].name;
      const tokenB = this.tokensMap[row.tokenB].name;
      if (row.type === 2) {
        return type.replace("{tokenA}", tokenB).replace("{tokenB}", tokenA);
      }
      if (row.type === 3) {
        type = this.$lang("scan.transactions.tradeAdds");
      }
      if (row.type === 4) {
        type = this.$lang("scan.transactions.tradeRemove");
      }
      return type.replace("{tokenA}", tokenA).replace("{tokenB}", tokenB);
    },
    getRecentTrades() {
      this.$axios
        .get("/api/v1/analytics/recentTrades", {
          params: {
            pair: this.pair,
            size: 100,
          },
        })
        .then((result) => {
          if (result.code === 0) {
            this.trades = result.data.list.map((el) => {
              const item = {
                ...el,
              };
              item.volume = Number(item.volume.cutFixed(4));
              return item;
            });
          }
        });
    },
  },
  watch: {
    pair() {
      this.getRecentTrades();
    },
  },
  created() {
    this.getRecentTrades();
  },
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";
.tabs {
  span {
    line-height: 3 * @grid;
    display: inline-block;
    padding-right: 1.5 * @grid;
    color: @gray-300;
    font-weight: 700;
    cursor: pointer;

    &.current {
      color: @gray-500;
    }
  }
}
</style>