<template lang="pug">
.page
  ul
    li(@click="setPage('first')", :class="currentValue <= 1 ? 'disabled' : ''")
      Icon(size="16", name="first")
    li(@click="setPage('prev')", :class="currentValue <= 1 ? 'disabled' : ''")
      Icon(size="16", name="arrowleft")
    li.num {{ currentValue }} / {{ max }}
    li(
      @click="setPage('next')",
      :class="currentValue >= max ? 'disabled' : ''"
    )
      Icon(size="16", name="arrowright")
    li(
      @click="setPage('last')",
      :class="currentValue >= max ? 'disabled' : ''"
    )
      Icon(size="16", name="last")
</template>
<script>
export default {
  name: "Page",
  props: {
    value: {
      type: [String, Number],
      default: 1,
    },
    total: {
      type: [String, Number],
      default: 0,
    },
    pageSize: {
      type: [String, Number],
      default: 10,
    },
  },
  data() {
    return {
      currentValue: this.value,
      max: 0,
    };
  },
  watch: {
    total() {
      this.max = Math.floor(this.total / this.pageSize);
    },
    value() {
      this.currentValue = this.value;
    },
  },
  methods: {
    setPage(str) {
      if (str === "first") {
        this.currentValue = 1;
      } else if (str === "last") {
        this.currentValue = this.max;
      } else if (str === "prev" && this.currentValue > 1) {
        this.currentValue = Number(this.currentValue) - 1;
      } else if (str === "next" && this.currentValue < this.max) {
        this.currentValue = Number(this.currentValue) + 1;
      }
      if (this.value !== this.currentValue) {
        this.$emit("on-change", this.currentValue);
      }
    },
  },
  created() {
    this.max = Math.ceil(this.total / this.pageSize);
  },
};
</script>
<style scoped lang="less">
@import "../libs/mixin";
.page {
  padding-top: @grid;
  ul,
  li {
    list-style: none;
  }
  ul {
    text-align: center;
  }
  li {
    margin: 0 2px;
    text-align: center;
    padding: 0 10px;
    display: inline-block;
    height: 4 * @grid;
    cursor: pointer;
    color: @gray-500;
    line-height: 4 * @grid;
    border: 1px solid @gray-100;
    vertical-align: top;
    user-select: none;
    i {
      line-height: 4 * @grid;
    }

    &:active {
      background: @primary-main;
      border-color: @primary-main;
      color: @white !important;
    }
    &:hover {
      color: @primary-main;
    }
    &.num {
      background: @gray-50 !important;
      color: @gray-500 !important;
      border: 1px solid @gray-100;
      min-width: 90px;
      padding: 0;
    }

    &.disabled,
    &.disabled:hover {
      cursor: not-allowed;
      color: @gray-200 !important;
    }

    &.disabled {
      &:active {
        color: @gray-100;
        border: 1px solid @gray-100 !important;
        background: none !important;
      }
    }
  }
}
</style>