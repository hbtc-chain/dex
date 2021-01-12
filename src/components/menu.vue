<template lang="pug">
.menu
  van-cell-group(:border="false")
    van-cell(:border="false")
      template(#title)
        Icon(name="switch")
        router-link(to="/swap", @click.native="hideMenu") {{ $lang('head.swap') }}
    van-cell(:border="false", v-if="address")
      template(#title)
        Icon(name="exchange")
        a(
          :href="`//explorer.hbtcchain.io/account/${address}?lang=${lang}&type=transactions`",
          @click="hideMenu"
        ) {{ $lang('head.transactions') }}
    van-cell(:border="false")
      template(#title)
        Icon(name="explorer")
        router-link(to="/scan", @click.native="hideMenu") {{ $lang('head.scan') }}
    van-cell(:border="false")
      template(#title)
        Icon(name="hbtc")
        a(:href="`//explorer.hbtcchain.io?lang=${lang}`", @click="hideMenu") {{ $lang('head.explorer') }}
  van-cell-group
    van-cell(:border="false")
      template(#title)
        Icon(name="question")
        a(href="https://hbtcwallet.gitbook.io/hbtc-chain-guide/", @click="hideMenu") {{ $lang('head.helpCenter') }}
    van-cell-group
    van-cell(:border="false")
      template(#title)
        Icon(name="language")
        a(@click="setLocal('en-us')", :class="{ current: lang === 'en-us' }") English
        span(style="margin: 0 5px") /
        a(@click="setLocal('zh-cn')", :class="{ current: lang === 'zh-cn' }") 中文
  van-cell-group(:border="false")
    van-cell(:border="false")
      template(#title)
        Icon(name="telegram")
        a(href="https://t.me/HBTCOfficial", @click="hideMenu") {{ $lang('head.telegram') }}
    van-cell(:border="false")
      template(#title)
        Icon(name="twitter")
        a(href="https://twitter.com/hbtcnews", @click="hideMenu") {{ $lang('head.twitter') }}
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Menu",
  props: {
    hideClose: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(["address", "local", "mini"]),
  },
  methods: {
    ...mapActions(["setState"]),
    setLocal(lang) {
      const query = this.$route.query.lang;
      let url = "";
      if (query) {
        url = window.location.pathname.replace(`lang=${query}`, `lang=${lang}`);
      } else {
        url = [window.location.pathname, `lang=${lang}`].join("?");
      }
      this.$router.replace(url);
      this.$i18n.locale = lang;
      this.lang = lang;
      this.hideMenu();
      localStorage.locale = lang;
      this.setState({ local: lang });
    },
    hideMenu() {
      if (this.mini) {
        this.$emit("click");
      }
    },
  },
  created() {
    this.lang = this.local;
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.menu {
  padding-bottom: 30px;
  .van-cell {
    padding: 0;
    cursor: pointer;
    height: 9 * @grid;
    a {
      color: @gray-700;
      &.current {
        color: @primary-main;
      }
    }
    a:hover,
    .router-link-active {
      color: @primary-main;
    }
  }
  .van-cell__title {
    font-size: 15px;
    font-weight: 500;
    display: flex;
    align-items: center;
  }
  .swap-icon {
    height: 24px;
    width: 24px;
    font-size: 20px;
    margin-right: @grid;
    text-align: center;
    line-height: 24px;
    color: #fff;
    border-radius: 4px;
    background: @gray-200;
  }
}
</style>
