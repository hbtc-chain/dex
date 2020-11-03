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
        @click="selectToken(item.symbol)",
        :class="{ disabled: disabledSelect(item.symbol) }",
        :style="{ top: itemHeight * (index + startIndex) + 'px' }"
      )
        span.value
          template(v-if="assets[item.symbol]") {{ assets[item.symbol].amount }}
          template(v-else) 0
        template(#title)
          .left
            Logo(size="32", :tokens="[item.symbol]")
            .token
              .title {{ item.symbol | toUP }}
</template>

<script>
import { mapState } from "vuex";

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
      const tokens = this.tokens.filter(
        (el) => el.symbol.indexOf(this.keyword.toLocaleLowerCase()) > -1
      );
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
  },
  data() {
    return {
      itemHeight: 64,
      tokenDesc: false,
      keyword: "",
      visible: this.value,
      startIndex: 0,
      canNext: true,
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
    disabledSelect(token) {
      return this.disabledItem.indexOf(token) > -1;
    },
    selectToken(token) {
      this.visible = false;
      this.$emit("change", token);
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
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.token-filter {
  height: 80%;
  max-height: 795px;
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
        font-size: 17px;
        color: @gray-900;
      }
    }
  }
}
</style>
