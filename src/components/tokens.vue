<template lang="pug">
Modal.token-filter(
  v-model="visible",
  position="bottom",
  :title="$lang('swap.selectToken')"
)
  .search
    van-field(
      left-icon="search",
      v-model="keyword",
      clear-trigger="always",
      clearable,
      :placeholder="$lang('scan.searchCoin')"
    )
    van-row(gutter="8", type="flex", align="center")
      van-col(span="18") {{ $lang('swap.tokenName') }}
      van-col(span="6")
        Icon(
          fill,
          name="sort",
          :selected="tokenDesc",
          @click="tokenDesc = !tokenDesc"
        )
  .list(@scroll="listScroll", ref="list")
    van-cell-group(:style="listStyle")
      van-cell(
        center,
        size="large",
        v-for="(item, index) in renderList",
        :key="item.symbol",
        @click="selectToken(item)",
        :class="{ disabled: disabledSelect(item.symbol) }",
        :style="{ top: itemHeight * (index + startIndex) + 'px' }"
      )
        span.value
          strong(v-if="assets[item.symbol]") {{ assets[item.symbol].amount }}
          strong(v-else) 0
          br
          van-button(
            size="mini",
            v-if="userTokensMap[item.symbol]",
            @click.stop="removeToken(item.symbol)"
          ) - Remove

        template(#title)
          .left
            Logo(size="32", :tokens="[item.symbol]")
            .token
              .title {{ tokensMap[item.symbol].fullName }}
                Substr(:text="item.symbol")
</template>

<script>
import { mapState } from "vuex";

const storageKey = "userTokens";
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    disabledItem: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    ...mapState(["tokens", "assets", "tokensMap", "mini"]),
    tokensList() {
      const keyword = this.keyword.toLocaleLowerCase().trim();
      const tokens = this.tokens.filter((el) => {
        if (keyword.length > 1) {
          return el.name.indexOf(keyword) > -1;
        }
        return el.verified || this.userTokensMap[el.symbol];
      });
      if (this.tokenDesc) {
        tokens.reverse();
      }
      return tokens;
    },
    renderList() {
      return [...this.tokensList].slice(this.startIndex, this.startIndex + 16);
    },
    listStyle() {
      return {
        height: `${this.itemHeight * this.tokensList.length}px`,
      };
    },
    userTokensMap() {
      const map = {};
      this[storageKey].forEach((el) => {
        map[el] = true;
      });
      return map;
    },
  },
  data() {
    return {
      itemHeight: 64,
      tokenDesc: false,
      keyword: "",
      visible: this.value,
      startIndex: 0,
      canNext: true,
      userTokens: [],
    };
  },
  watch: {
    value(val) {
      this.visible = val;
    },
    visible() {
      this.$emit("input", this.visible);
    },
  },
  methods: {
    removeToken(symbol) {
      this[storageKey] = this[storageKey].filter((el) => el !== symbol);
      localStorage[storageKey] = this[storageKey].join(",");
    },
    disabledSelect(token) {
      return this.disabledItem.indexOf(token) > -1;
    },
    selectToken(item) {
      const { symbol, verified } = item;
      if (!verified && !this.userTokensMap[symbol]) {
        this[storageKey].push(symbol);
        localStorage[storageKey] = this[storageKey].join(",");
      }
      this.visible = false;
      this.$emit("change", symbol);
    },
    listScroll() {
      if (this.canNext) {
        setTimeout(() => {
          this.startIndex = Math.max(
            0,
            Math.floor(this.$refs.list.scrollTop / this.itemHeight) - 3
          );
          this.canNext = true;
        }, 5);
        this.canNext = false;
      }
    },
  },
  created() {
    if (localStorage[storageKey]) {
      this[storageKey] = localStorage[storageKey].split(",");
    }
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.token-filter {
  height: 80%;
  max-height: 560px;
  .search {
    padding: @space;
    padding-top: 0;

    .van-row {
      margin-top: 2 * @grid;
    }

    /deep/ .van-col--6 {
      text-align: right;
    }

    /deep/ .van-col--18 {
      color: @gray-300;
    }

    /deep/ .van-button {
      font-size: 16px;
      font-weight: 700;
    }
  }

  .list {
    top: 160px;
    bottom: 0;
    position: absolute;
    width: 100%;
    overflow: hidden;
    will-change: transform;
    direction: ltr;
    overflow-y: scroll;
    /deep/ .van-cell-group {
      position: relative;
    }

    /deep/ .van-cell {
      left: 0;
      position: absolute;
      padding: 1.5 * @grid @space;
      height: 8 * @grid;
    }

    .disabled {
      opacity: 0.5;
    }

    .value {
      color: @gray-900;
      font-size: 15px;
    }

    .left {
      display: flex;
      align-items: center;
      .title {
        font-weight: 500;
        font-size: 14px;
        color: @gray-900;
        span {
          display: block;
          font-size: 12px;
          color: @gray-300;
        }
      }
    }
  }
}
</style>
