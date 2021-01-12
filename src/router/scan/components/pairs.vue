<template lang="pug">
.pool-pair-list
  vxe-table(:data="slicePairs", border="inner", :loading="loading")
    vxe-table-column(
      field="pair",
      :title="$lang('scan.pairs.name')",
      minWidth="200"
    )
      template(v-slot="{ row }")
        router-link(
          :to="{ name: 'scanDetail', params: { id: `${row.tokenA}-${row.tokenB}` } }"
        )
          .logo
            Logo(:tokens="[row.tokenA, row.tokenB]")
            | {{ tokensMap[row.tokenA].name }}-{{ tokensMap[row.tokenB].name }}
    vxe-table-column(
      field="liquidity",
      :title="$lang('scan.pairs.liquidity')",
      minWidth="135",
      sortable,
      show-overflow
    )
      template(v-slot="{ row }") ${{ row.liquidity.cutFixed(4) }}
    vxe-table-column(
      field="volume24Hr",
      :title="$lang('scan.pairs.volume24h')",
      minWidth="135",
      sortable,
      show-overflow
    )
      template(v-slot="{ row }") ${{ row.volume24Hr.cutFixed(4) }}
    vxe-table-column(
      field="volume7D",
      :title="$lang('scan.pairs.volume7d')",
      minWidth="135",
      sortable,
      show-overflow
    )
      template(v-slot="{ row }") ${{ row.volume7D.cutFixed(4) }}
    vxe-table-column(
      field="tradeCount24Hr",
      :title="$lang('scan.pairs.fees')",
      minWidth="135",
      sortable,
      show-overflow
    )
      template(v-slot="{ row }") ${{ row.tradeCount24Hr.cutFixed(4) }}
    vxe-table-column(
      field="age",
      :title="$lang('scan.pairs.action')",
      minWidth="210",
      align="right"
    )
      template(v-slot="{ row }")
        van-button(type="default", :to="`/pool/${row.pair}`") + {{ $lang('scan.pairs.addLiquidity') }}
        | &nbsp;
        van-button(type="info", :to="`/swap/${row.pair}`") {{ $lang('scan.pairs.trade') }}
  Page(
    :total="pairs.length",
    :value="currentPage",
    :page-size="pageSize",
    @on-change="changePage",
    v-if="pairs.length"
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
    slicePairs() {
      return this.pairs.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      );
    },
  },
  data() {
    return {
      loading: false,
      pairs: [],
      currentPage: 1,
      pageSize: 10,
    };
  },
  methods: {
    changePage(n) {
      this.currentPage = n;
    },
    getPairsState() {
      this.loading = true;
      this.$axios.get("/api/v1/analytics/pairsState").then((result) => {
        this.loading = false;
        if (result.code === 0) {
          this.pairs = result.data.list.map((el) => {
            const item = {
              ...el,
            };
            item.liquidity = Number(item.liquidity.cutFixed(4));
            item.tradeCount24Hr = Number(item.tradeCount24Hr.cutFixed(4));
            item.volume7D = Number(item.volume7D.cutFixed(4));
            item.volume24Hr = Number(item.volume24Hr.cutFixed(4));
            return item;
          });
        }
      });
    },
  },
  created() {
    this.getPairsState();
  },
};
</script>
<style scoped lang="less">
@import "../../../libs/mixin";
.pool-pair-list {
  /deep/ .van-button--default {
    background: fade(@primary-main, 10%);
    color: @primary-main;
    margin-right: 6px;
  }
  /deep/ .van-button {
    height: 38px;
    line-height: 38px;
    border: none;
    padding-left: 10px;
    padding-right: 10px;
  }
  .logo {
    display: flex;
  }
}
</style>