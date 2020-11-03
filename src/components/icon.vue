<template lang="pug">
i.swap-icon(:class="classes", :style="styles", @click="handleClick")
</template>
<script>
export default {
  name: "Icon",
  props: {
    name: {
      type: String,
      default: "",
    },
    size: {
      type: [Number, String],
      default: "",
    },
    rotate: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    fill: { type: Boolean, default: false },
  },
  computed: {
    classes() {
      const classSet = new Set();
      if (this.name) {
        classSet.add(`swap-icon-${this.name}`);
      }
      if (this.fill) {
        classSet.add(`swap-icon-fill`);
      }
      if (this.selected) {
        classSet.add(`swap-icon-rotate`);
      }
      if (this.rotate) {
        classSet.add(`swap-icon-rotate`);
      }

      return Array.from(classSet);
    },
    styles() {
      const style = {};
      if (this.size) {
        style["font-size"] = `${this.size}px`;
      }
      return style;
    },
  },
  methods: {
    handleClick(event) {
      this.$emit("click", event);
    },
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
@font-face {
  font-family: "iconfont"; /* project id 2129214 */
  src: url("//at.alicdn.com/t/font_2129214_nwzczbn0hs.eot");
  src: url("//at.alicdn.com/t/font_2129214_nwzczbn0hs.eot?#iefix")
      format("embedded-opentype"),
    url("//at.alicdn.com/t/font_2129214_nwzczbn0hs.woff2") format("woff2"),
    url("//at.alicdn.com/t/font_2129214_nwzczbn0hs.woff") format("woff"),
    url("//at.alicdn.com/t/font_2129214_nwzczbn0hs.ttf") format("truetype"),
    url("//at.alicdn.com/t/font_2129214_nwzczbn0hs.svg#") format("svg");
}

.swap-icon {
  position: relative;
  display: inline-block;
  font: normal normal normal 14px/1 iconfont;
  font-size: inherit;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;

  &:before {
    display: inline-block;
  }
  &-last:before {
    content: "\e627";
  }

  &-arrowright:before {
    content: "\e628";
  }

  &-arrowleft:before {
    content: "\e629";
  }

  &-first:before {
    content: "\e62b";
  }

  &-copy:before {
    content: "\e61d";
  }

  &-exchange:before {
    content: "\e61c";
  }

  &-menufold2:before {
    content: "\e61a";
  }

  &-menufold1:before {
    content: "\e61b";
  }

  &-arrowdown2:before {
    content: "\e619";
  }

  &-more-line:before {
    content: "\e616";
  }

  &-Back:before {
    content: "\e617";
  }

  &-disclosure:before {
    content: "\e618";
  }

  &-arrowdown:before {
    content: "\e615";
  }

  &-importbykeystore:before {
    content: "\e612";
  }

  &-importbyprivatekey:before {
    content: "\e613";
  }

  &-importbymnemonic:before {
    content: "\e614";
  }

  &-menus:before {
    content: "\e60e";
  }

  &-telegram:before {
    content: "\e60f";
  }

  &-wechart:before {
    content: "\e610";
  }

  &-twitter:before {
    content: "\e611";
  }

  &-QRcode:before {
    content: "\e60d";
  }

  &-add:before {
    content: "\e60c";
  }

  &-warning:before {
    content: "\e60b";
  }

  &-sort:before {
    content: "\e608";
  }

  &-sort-top:before {
    content: "\e609";
  }

  &-sort-bottom:before {
    content: "\e60a";
  }

  &-locked:before {
    content: "\e606";
  }

  &-setting:before {
    content: "\e607";
  }

  &-language:before {
    content: "\e600";
  }

  &-hbtc:before {
    content: "\e601";
  }

  &-switch:before {
    content: "\e602";
  }

  &-search:before {
    content: "\e603";
  }

  &-explorer:before {
    content: "\e604";
  }

  &-question:before {
    content: "\e605";
  }

  &-fill {
    color: @gray-500;
    height: 4 * @grid;
    width: 4 * @grid;
    font-size: 3 * @grid;
    text-align: center;
    line-height: 4 * @grid;
    border-radius: 4px;
    background: @gray-50;
  }
  &-selected {
    color: @primary-main;
  }
  &-rotate {
    transform: rotate(180deg);
  }
}
</style>