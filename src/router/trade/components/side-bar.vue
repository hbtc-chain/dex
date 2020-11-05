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
  .pair-list
    van-cell-group
      van-cell(
        v-for="item in searchLists",
        @click="switchPair(item)",
        :class="{ current: item.id === pair }",
        :key="item.id"
      )
        template(#title)
          Logo(:tokens="[item.tokenA.symbol, item.tokenB.symbol]", size="20")
          strong {{ item.tokenA.symbol | toUP }}
          span /{{ item.tokenB.symbol | toUP }}
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
    ...mapState(["symbols"]),
    searchLists() {
      const keyword = this.keyword.toLocaleLowerCase().trim();
      const symbols = this.symbols.filter((el) => {
        if (keyword.length > 1) {
          return el.id.indexOf(keyword) > -1;
        }
        return el.verified || this.userPairMap[el.id];
      });
      return symbols;
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
    };
  },
  methods: {
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
  max-height: 795px;

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
    /deep/ .van-cell {
      cursor: pointer;
      height: 48px;
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
