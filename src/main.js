import Vue from 'vue';
import Vant from 'vant';
import VueI18n from 'vue-i18n';
import axios from "@/libs/axios";
import zh from "@/assets/locale/zh-cn"
import en from "@/assets/locale/en-us"
import Helper from '@/libs/helper';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import tips from "@/components/tips";
import components from "@/components";
import coinLogo from "@/assets/default.png";
import 'xe-utils'
import '@/libs/common.less';
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import '@vant/touch-emulator';

Object.keys(components).forEach((key) => {
  Vue.component(key, components[key]);
});
Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(Vant);
Vue.use(VXETable)

Object.defineProperty(Vue.prototype, "$tips", {
  value: tips
});

Object.defineProperty(Vue.prototype, "$axios", {
  value: axios
});

Object.defineProperty(Vue.prototype, "$lang", {
  value(name) {
    return this.$t(`${name}`);
  }
});

Object.defineProperty(Number.prototype, "cutFixed", {
  value(n) {
    return this.toString().cutFixed(n);
  }
});

Object.defineProperty(String.prototype, "cutFixed", {
  value(n) {
    if (this === '') {
      return ""
    }
    const t = this.split(".");
    const s = "000000000000000000000000000000";
    if (n === 0) {
      return t[0]
    }
    if (n) {
      if (/\./.test(this)) {
        return [t[0], (t[1] + s).substr(0, n)].join(".");
      }
      return [this, s.substr(0, n)].join(".");
    }
    return this;
  }
});

Object.defineProperty(Date.prototype, "format", {
  value(f = "yyyy/MM/dd hh:mm:ss") {
    let format = f
    const object = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      S: this.getMilliseconds(),
    };
    if (/(y+)/.test(format)) {
      format = format.replace(
        RegExp.$1,
        this.getFullYear().toString().substr(4 - RegExp.$1.length)
      );
    }
    Object.keys(object).forEach((el) => {
      if (new RegExp(`(${el})`).test(format)) {
        format = format.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? object[el] : (`00${object[el]}`).substr((object[el].toString()).length)
        );
      }
    })
    return format;
  }
});

const render = () => {
  store.state.local = Helper.getLang();
  new Vue({
    i18n: new VueI18n({
      silentTranslationWarn: true,
      locale: store.state.local,
      messages: { "zh-cn": zh, "en-us": en }
    }),
    router,
    store,
    render: (h) => h(App),
  }).$mount('#app');
}

const getPairs = (tokensMap, init) => {
  axios.get("/api/v1/swap/pairs").then((result) => {
    if (result.code === 0) {
      const pairs = {};
      const symbols = [];

      result.data.pairs.forEach((el) => {
        const element = { ...el };
        const { tokenA, tokenB } = element
        const symbol = `${tokenA.symbol}-${tokenB.symbol}`;

        tokenA.amount = Helper.bigNumber(tokenA.amount)
          .div(tokensMap[tokenA.symbol].pow)
          .toString(10);

        tokenB.amount = Helper.bigNumber(tokenB.amount)
          .div(tokensMap[tokenB.symbol].pow)
          .toString(10);

        tokenA.price = Helper.bigNumber(tokenB.amount)
          .div(tokenA.amount)
          .toString(10)
          .cutFixed(tokensMap[tokenA.symbol].decimals);

        tokenB.price = Helper.bigNumber(tokenA.amount)
          .div(tokenB.amount)
          .toString(10)
          .cutFixed(tokensMap[tokenB.symbol].decimals);

        Object.assign(element, {
          gap: Helper.bigNumber(tokensMap[tokenB.symbol].pow)
            .div(tokensMap[tokenA.symbol].pow)
            .toString(10),
          id: symbol
        })

        symbols.push({
          verified: el.verified,
          id: symbol,
          tokenA,
          tokenB
        });

        pairs[symbol] = element;

        pairs[`${tokenB.symbol}-${tokenA.symbol}`] = {
          tokenA: { ...tokenB },
          tokenB: { ...tokenA },
          gap: element.gap,
          id: symbol
        };
      });

      Object.assign(store.state, {
        pairs,
        symbols
      })

      if (init) {
        render()
      }
    }
  });
}

const getTokens = () => {
  axios.get("/api/v1/swap/liteTokens").then((result) => {
    if (result.code === 0) {
      const tokens = result.data.items;
      const tokensMap = {};
      tokens.forEach((el) => {
        const fullName = el.name.toLocaleUpperCase()
        tokensMap[el.symbol] = {
          ...el,
          pow: Helper.bigNumber(10).pow(el.decimals).toString(10),
          showDecimals: 6,
          logo: el.logo || coinLogo,
          fullName,
          name: Helper.Substr(fullName)
        };
      });

      Object.assign(store.state, { tokens, tokensMap })

      getPairs(tokensMap, true)

      setInterval(() => {
        getPairs(tokensMap)
      }, store.state.delay.standard);
    }
  });
}

getTokens()