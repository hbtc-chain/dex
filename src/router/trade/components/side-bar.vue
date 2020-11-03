<template lang="pug">
.search
  van-search(
    v-model="search",
    :placeholder="$lang('trade.searchCoin')",
    clear-trigger="always",
    clearable
  )
  .token-list
    van-cell-group
      van-cell(
        v-for="item in searchLists",
        @click="switchPair(item.id)",
        :class="{ current: item.id === pair }",
        :key="item.id"
      )
        template(#title)
          strong {{ item.tokenA.symbol | toUP }}
          span /{{ item.tokenB.symbol | toUP }}
        Logo(:tokens="[item.tokenA.symbol, item.tokenB.symbol]" size="20")
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
    ...mapState(["symbols"]),
    searchLists() {
      if (this.search) {
        return this.symbols.filter(
          (el) => el.id.indexOf(this.search.toLocaleLowerCase()) > -1
        );
      }
      return this.symbols;
    },
  },
  data() {
    return {
      search: "",
    };
  },
  methods: {
    switchPair(pair) {
      if (this.pair !== pair) {
        this.$emit("change", pair);
      }
    },
  },
  created() {},
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";

.search {
  width: 30 * @grid;
  /deep/ .van-search {
    padding: 3 * @grid 2 * @grid 2 * @grid;

    /deep/ .van-search__content {
      padding-left: 0;
    }

    /deep/ input {
      font-size: 15px;

      &::placeholder {
        color: @gray-500;
      }
    }
  }

  .current {
    background: rgba(36, 43, 50, 0.05);
  }

  .token-list {
    /deep/ .van-cell {
      cursor: pointer;
      height: 40px;
      align-items: center;
      font-size: 13px;
      font-weight: 500;

      strong {
        font-size: 14px;
      }
      .van-logos{
        display: block;
      }
    }
  }
}
</style>
