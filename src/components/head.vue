<template lang="pug">
div
  .head
    .left
      router-link(to="/")
        img(src="@/assets/logo.png")
    .menu
      van-button(
        size="small",
        v-if="processNumber",
        @click="processWin = true"
      )
        van-loading.color-gray500(size="20")
        .number {{ processNumber }}
      van-button(
        size="small",
        v-else-if="hashList.length",
        @click="processWin = true"
      )
        van-icon(name="underway-o", size="20")
      Icon(
        name="setting",
        size="24",
        @click="setState({ configWin: true })",
        fill
      )
      Icon(name="menus", size="24", @click="menuStatus = true", fill)
  Modal.process-list(
    v-model="processWin",
    position="bottom",
    :title="$lang('head.latestTransactions')",
    :style="objectStyle"
  )
    .list
      van-cell-group
        van-cell(
          is-link,
          v-for="item in hashList",
          :key="item.hash",
          :label="date(item.createdAt)"
          center
        )
          Hash(:text="item.hash", substr)
          template(#title)
            template(v-if="item.result") {{ $lang(`head.${item.result.activities[0].type}`) }}
              .tag.tag-success(v-if="item.result.success") {{ $lang('head.success') }}
              .tag.tag-failed(v-else) {{ $lang('head.failed') }}
            .tag(v-else) {{ $lang('head.processing') }}
    van-button(size="small", icon="delete", @click="clearAll") {{ $lang('head.clearAll') }}

  van-popup.popup(v-model="menuStatus", position="right", style="height:100%")
    .toper
      .logo
        img(src="@/assets/logo.png")
      van-icon(name="cross", size="20", @click="menuStatus = false")
    .user
      template(v-if="address")
        .account
          Logo(:tokens="['hbc']")
          | {{ address.substring(0, 6) }} ... {{ address.substring(address.length - 4, address.length) }}
        .balance {{ asset }} HBC
      van-button(type="info", block, @click="connectWalletWin = true", v-else) {{ $lang('head.connectWallet') }}
    van-cell-group(:border="false")
      van-cell(:border="false")
        template(#title)
          Icon(name="switch")
          router-link(to="/swap", @click.native="menuStatus = false") {{ $lang('head.swap') }}
      van-cell(:border="false", v-if="address")
        template(#title)
          Icon(name="exchange")
          a(
            :href="`//explorer.hbtcchain.io/account/${address}?lang=${lang}&type=transactions`",
            @click="menuStatus = false"
          ) {{ $lang('head.transactions') }}
      van-cell(:border="false")
        template(#title)
          Icon(name="explorer")
          router-link(to="/scan", @click.native="menuStatus = false") {{ $lang('head.scan') }}
      van-cell(:border="false")
        template(#title)
          Icon(name="hbtc")
          a(
            :href="`//explorer.hbtcchain.io?lang=${lang}`",
            @click="menuStatus = false"
          ) {{ $lang('head.explorer') }}
    van-cell-group
      van-cell(:border="false")
        template(#title)
          Icon(name="question")
          a(href="//doc.hbtcchain.io/", @click="menuStatus = false") {{ $lang('head.helpCenter') }}
      van-cell-group
      van-cell(:border="false")
        template(#title)
          Icon(name="language")
          a(
            @click="setLocal('en-us')",
            :class="{ 'color-info': lang === 'en-us' }"
          ) English
          | &nbsp;/&nbsp;
          a(
            @click="setLocal('zh-cn')",
            :class="{ 'color-info': lang === 'zh-cn' }"
          ) 中文
    //- van-cell-group(:border="false")
    //-   van-cell(:border="false")
    //-     template(#title)
    //-       Icon(name="telegram")
    //-       a(href="https://www.facebook.com/HBTCOfficial", @click="menuStatus = false") {{ $lang('head.telegram') }}
    //-   van-cell(:border="false")
    //-     template(#title)
    //-       Icon(name="twitter")
    //-       a(href="https://twitter.com/hbtcnews", @click="menuStatus = false") {{ $lang('head.twitter') }}
  WalletModal(v-model="connectWalletWin")
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Head",
  computed: {
    ...mapState(["address", "assets", "local", "hashList"]),
    asset() {
      let a = 0;
      if (this.assets.hbc) {
        a = this.assets.hbc.showAmount.cutFixed(2);
      }
      return a;
    },
    objectStyle() {
      return {
        height: `${this.hashList.length * 66 + 100}px`,
      };
    },
    processNumber() {
      return this.hashList.filter((el) => !el.result).length;
    },
  },
  methods: {
    ...mapActions(["setState"]),
    clearAll() {
      this.processWin = false;
      this.setState({ hashList: [] });
      localStorage.removeItem("hashList");
    },
    date(time) {
      return new Date(time).format();
    },
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
      this.menuStatus = false;
      localStorage.locale = lang;
      this.setState({ local: lang });
    },
  },
  data() {
    return {
      connectWalletWin: false,
      menuStatus: false,
      processWin: false,
    };
  },
  created() {
    this.lang = this.local;
  },
};
</script>

<style scoped lang="less">
@import "../libs/mixin";
.head {
  height: 5 * @grid;
  padding: 2 * @grid;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 608px;
  margin: 0 auto;
  .left {
    display: flex;
    align-items: center;
    img {
      height: 4 * @grid;
    }
  }
  .menu {
    display: flex;
    align-content: center;
    .number {
      background: @error;
      color: @white;
      position: absolute;
      top: 0;
      right: 0;
      box-sizing: border-box;
      min-width: 16px;
      padding: 0 3px;
      font-weight: 500;
      font-size: 12px;
      font-family: -apple-system-font, Helvetica Neue, Arial, sans-serif;
      line-height: 1.2;
      text-align: center;
      border-radius: 16px;
      transform: translate(50%, -50%);
      transform-origin: 100%;
    }
    .swap-icon {
      margin-left: 2 * @grid;
    }
  }
  h2 {
    padding-left: 2 * @grid;
    font-size: 2.5 * @grid;
    font-weight: 500;
  }
}
.process-list {
  max-height: 80%;
  .list {
    top: 60px;
    bottom: 5 * @grid;
    position: absolute;
    width: 100%;
    overflow: hidden;
    will-change: transform;
    direction: ltr;
    overflow-y: scroll;
  }
  .van-button {
    position: absolute;
    bottom: @grid*0.5;
    right: @grid;
  }
  a {
    color: @primary-main;
  }
  .tag {
    display: inline-block;
    background: @gray-50;
    padding: 2px 6px;
    color: @gray-500;
    font-size: 12px;
    line-height: 16px;
    border-radius: 2px;
    &-success {
      margin-left: 0.5 * @grid;
      background: @green;
      color: #fff;
    }
    &-failed {
      margin-left: 0.5 * @grid;
      background: @error;
      color: #fff;
    }
  }
}
.popup {
  width: 26 * @grid;
  padding: 4 * @grid 2 * @grid 0;
  .logo {
    img {
      height: 3 * @grid;
    }
  }

  .toper {
    padding-bottom: 4 * @grid;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .van-cell {
    cursor: pointer;
    height: 8 * @grid;
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

.user {
  box-shadow: 0px 0px 12px rgba(31, 93, 193, 0.16);
  border-radius: 6px;
  overflow: hidden;
}
.account {
  .text-hide;
  padding: 2 * @grid 0;
  margin: 0 3 * @grid;
  line-height: 3 * @grid;
  display: flex;
  align-content: center;
  /deep/ .van-image {
    vertical-align: middle;
    margin-right: @grid;
  }
}
.balance {
  padding: 2 * @grid 3 * @grid;
  line-height: 3 * @grid;
  height: 3 * @grid;
  background: fade(@primary-main, 30%);
  font-size: 17px;
  font-weight: 500;
}
</style>
