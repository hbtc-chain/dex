<template lang="pug">
Modal.pair-filter(
  v-model="visible",
  :title="$lang('trade.searchPair')",
  position="bottom"
)
  .search
    van-field(
      left-icon="search",
      v-model="keyword",
      clear-trigger="always",
      clearable,
      :placeholder="$lang('trade.searchPair')"
    )
  .pair-list(@scroll="listScroll", ref="list")
    van-cell-group(:style="listStyle")
      van-cell(
        v-for="(item, index) in renderList",
        @click="switchPair(item)",
        :class="{ current: item.id === pair }",
        :key="item.id",
        :style="{ top: itemHeight * (index + startIndex) + 'px' }"
      )
        template(#title)
          Logo(:tokens="[item.tokenA.symbol, item.tokenB.symbol]", size="20")
          strong {{ tokensMap[item.tokenA.symbol].fullName }}
          span /{{ tokensMap[item.tokenB.symbol].fullName }}
        template(v-if="!item.verified")
          van-button(
            size="mini",
            v-if="userPairMap[item.id]",
            @click.stop="removeToken(item.id)"
          ) - Remove
</template>
<script>
import { mapState } from "vuex";

const storageKey = "userPair";
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    pair: {
      type: String,
      default: "",
    },
  },
  watch: {
    value(val) {
      this.visible = val;
    },
    visible() {
      this.$emit("input", this.visible);
    },
  },
  computed: {
    ...mapState(["symbols", "token", "tokensMap"]),
    searchLists() {
      const keyword = this.keyword.toLocaleUpperCase().trim();
      const symbols = this.symbols.filter((el) => {
        if (keyword.length) {
          return (
            [
              this.tokensMap[el.tokenA.symbol].fullName,
              this.tokensMap[el.tokenB.symbol].fullName,
            ]
              .join("/")
              .indexOf(keyword) > -1
          );
        }
        return el.verified || this.userPairMap[el.id];
      });
      return symbols;
    },
    renderList() {
      return [...this.searchLists].slice(this.startIndex, this.startIndex + 20);
    },
    listStyle() {
      return {
        height: `${this.itemHeight * this.searchLists.length}px`,
      };
    },
    userPairMap() {
      const map = {};
      this[storageKey].forEach((el) => {
        map[el] = true;
      });
      return map;
    },
  },
  data() {
    return {
      keyword: "",
      visible: this.value,
      userPair: [],
      itemHeight: 48,
      canNext: true,
      startIndex: 0,
    };
  },
  methods: {
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
    removeToken(id) {
      this[storageKey] = this[storageKey].filter((el) => el !== id);
      localStorage[storageKey] = this[storageKey].join(",");
    },
    switchPair(item) {
      const { id, verified } = item;
      if (!verified && !this.userPairMap[id]) {
        this[storageKey].push(id);
        localStorage[storageKey] = this[storageKey].join(",");
      }

      sessionStorage.selectedPairId = id;

      this.$emit("change", id);
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
@import "../../../libs/mixin";

.pair-filter {
  height: 80%;
  max-height: 560px;

  .search {
    padding: 0 @space @space;
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
  }

  .pair-list {
    top: 110px;
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
      cursor: pointer;
      height: 6 * @grid;
      align-items: center;
      font-size: 13px;
      font-weight: 500;

      strong {
        font-size: 14px;
      }

      &__title {
        display: flex;
        align-items: center;
      }
    }
  }
  .current {
    background: rgba(36, 43, 50, 0.05);
  }
}
</style>
