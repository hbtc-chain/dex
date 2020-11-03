<template lang="pug">
vxe-table(:data="pairs", border="inner")
  vxe-table-column(
    field="pair",
    :title="$lang('scan.pairs.name')",
    minWidth="180"
  )
    template(v-slot="{ row }")
      router-link(
        :to="{ name: 'scanDetail', params: { id: `${row.tokenA}-${row.tokenB}` } }"
      ) {{ row.tokenA | toUP }}-{{ row.tokenB | toUP }}
  vxe-table-column(
    field="liquidity",
    :title="$lang('scan.pairs.liquidity')",
    minWidth="130",
    sortable,
    align="right"
  )
    template(v-slot="{ row }") ${{ row.liquidity.cutFixed(4) }}
  vxe-table-column(
    field="volume24Hr",
    :title="$lang('scan.pairs.volume24h')",
    minWidth="180",
    sortable,
    align="right"
  )
    template(v-slot="{ row }") ${{ row.volume24Hr.cutFixed(4) }}
  vxe-table-column(
    field="volume7D",
    :title="$lang('scan.pairs.volume7d')",
    minWidth="180",
    sortable,
    align="right"
  )
    template(v-slot="{ row }") ${{ row.volume7D.cutFixed(4) }}
  vxe-table-column(
    field="tradeCount24Hr",
    :title="$lang('scan.pairs.fees')",
    minWidth="180",
    sortable,
    align="right"
  )
    template(v-slot="{ row }") ${{ row.tradeCount24Hr.cutFixed(4) }}
  vxe-table-column(field="age", title="", minWidth="180", align="right")
    template(v-slot="{ row }")
      van-button(size="mini", type="default", :to="`/pool/${row.pair}`") + {{ $lang('scan.pairs.addLiquidity') }}
      | &nbsp;
      van-button(size="mini", type="info", :to="`/swap/${row.pair}`") {{ $lang('scan.pairs.trade') }}
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
  },
  data() {
    return {
      pairs: [],
    };
  },
  methods: {
    getPairsState() {
      this.$axios.get("/api/v1/analytics/pairsState").then((result) => {
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
/deep/ .van-button--default {
  background: @gray-200;
  color: #fff;
  border-color: @gray-200;
}
</style>