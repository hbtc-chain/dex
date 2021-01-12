<template lang="pug">
.search
  van-field(
    left-icon="search",
    v-model="keyword",
    :placeholder="$lang('scan.searchCoin')",
    clear-trigger="always",
    clearable,
    size="large",
    @focus="showSearchResult",
    @blur="hideSearchResult"
  )
  .result(v-show="searchResultStatus")
    .title {{ $lang(searchLists.length ? 'scan.result' : 'scan.noResult') }}
    template(v-if="searchLists.length")
      router-link.token(
        :key="`${item.tokenA.symbol}-${item.tokenB.symbol}`",
        v-for="item in searchLists",
        @click.native="searchResultStatus = false",
        :to="{ name: 'scanDetail', params: { id: `${item.tokenA.symbol}-${item.tokenB.symbol}` } }"
      )
        | {{ tokensMap[item.tokenA.symbol].fullName }}-{{ tokensMap[item.tokenB.symbol].fullName }}
        Logo(:tokens="[item.tokenA.symbol, item.tokenB.symbol]")
</template>
<script>
import { mapState } from "vuex";

let fn = null;
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapState(["tokensMap", "symbols"]),
    searchLists() {
      const keyword = this.keyword.toLocaleUpperCase().trim();
      return this.symbols
        .filter((el) => {
          if (keyword.length > 1) {
            return (
              [
                this.tokensMap[el.tokenA.symbol].fullName,
                this.tokensMap[el.tokenB.symbol].fullName,
              ]
                .join("-")
                .indexOf(keyword) > -1
            );
          }
          return el.verified;
        })
        .slice(0, 10);
    },
  },
  data() {
    return {
      keyword: "",
      searchResultStatus: false,
    };
  },
  methods: {
    showSearchResult() {
      clearTimeout(fn);
      this.searchResultStatus = true;
    },
    hideSearchResult() {
      clearTimeout(fn);
      fn = setTimeout(() => {
        this.searchResultStatus = false;
      }, 300);
    },
  },
};
</script>
<style scoped lang="less">
@import "../../../libs/mixin";
.search {
  background: none;
  margin-bottom: 2 * @grid;
  position: relative;
  z-index: 2;

  /deep/ .van-field {
    background: @white;
    height: 6 * @grid;
    border-radius: @grid;
    &__control {
      height: 5 * @grid;
    }
    &__left-icon .van-icon {
      line-height: 5 * @grid;
    }
  }

  /deep/ .van-cell {
    padding-top: @grid * 0.5;
    padding-bottom: @grid * 0.5;
  }

  .result {
    max-height: 30 * @grid;
    overflow: hidden;
    overflow-y: auto;
    position: absolute;
    background: #fff;
    left: 0;
    right: 0;
    box-shadow: 0px 2px 20px rgba(32, 47, 68, 0.1);
    border-radius: 4px;

    .title {
      padding: 0 2 * @grid;
      height: 5 * @grid;
      display: flex;
      align-items: center;
    }
  }

  .token {
    height: 5 * @grid;
    display: flex;
    align-items: center;
    padding: 0 2 * @grid;
    color: @primary-main;
    cursor: pointer;

    &:hover {
      background: @gray-50;
    }
  }
}
</style>