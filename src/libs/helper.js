import BigNumber from "bignumber.js";

const userAgent = navigator.userAgent.toLocaleLowerCase();
const isChrome = /chrome/.test(userAgent);
const isFirefox = /firefox/.test(userAgent);
const isWallet = /hbtcchainwallet/.test(userAgent);

BigNumber.config({ DECIMAL_PLACES: 40 })

const getQueryVariable = (variable) => {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  let i = 0;
  for (; i < vars.length; i += 1) {
    const pair = vars[i].split("=");
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
}

/**
 * 生成兑换路由
 * pairs : 资金池支持兑换的列表
 * tokenA: 支付币种
 * tokenB: 兑换成目标币种
 * 从 pairs 匹配从 tokenA 到 tokenB 所有兑换途径，目前仅支持二跳，默认hbc做为中间跳转币种。
 *  */

const generateRouteNodeV2 = (tokenA, tokenB, symbols, history = [], route = [], cacheSymbols = []) => {
  if (!cacheSymbols.length) {
    symbols.forEach((el) => {
      cacheSymbols.push(el);
      cacheSymbols.push({
        id: [el.tokenB.symbol, el.tokenA.symbol].join('-'),
        tokenB: el.tokenA,
        tokenA: el.tokenB
      })
    })
  }

  const list = cacheSymbols.filter((el) => {
    // 过滤列表包含 tokenA, 且历史路径里不存在已出现过的币对和反向币对, 且不能出现路径已存在的币种
    if (el.tokenA.symbol === tokenA) {
      const tempId = [el.tokenB.symbol, el.tokenA.symbol].join("-");
      const tmp = history.filter((_el) => {
        const match =
          el.id === _el.id ||
          tempId === _el.id ||
          el.tokenB.symbol === _el.tokenA.symbol;
        return match;
      });
      return tmp.length === 0;
    }
    return false;
  });

  list.forEach((el) => {
    if (el.tokenB.symbol === tokenB) {
      if (history.length) {
        route.push([...history, el]);
      } else {
        route.push([el]);
      }
    } else {
      generateRouteNodeV2(
        el.tokenB.symbol,
        tokenB,
        symbols,
        [...history, el],
        route,
        cacheSymbols
      );
    }
  });
  return route;
}

/**
 * 支付 -> 兑换成
 * 已知条件：1、支付数值amountA  2、支付币种流动性tokenA.amount  3、兑换成币种流动性tokenB.amount  4 费率 fee
 * nAmount = amountA * (1-fee)
 * 计算公式：nAmount * tokenB.amount / (nAmount + tokenA.amount)
 * */

const tokenAtoB = (pairs, amountA, fee, decimals) => {
  let a = 0;
  const nAmount = BigNumber(amountA).times(BigNumber(1).minus(fee))
  if (pairs && amountA) {
    a = nAmount.times(pairs.tokenB.amount)
      .div(nAmount.plus(pairs.tokenA.amount))
      .toString(10)
      .cutFixed(decimals)
  }
  return a;
}

/**
 * 兑换成 -> 支付
 * 已知条件：1、兑换成数值amountB  2、支付币种流动性tokenA.amount  3、兑换成币种流动性tokenB.amount   4 费率 fee
 * 计算公式：amountB * tokenA.amount / (tokenB.amount-amountB) / (1-fee)
 * */

const tokenBtoA = (pairs, amountB, fee, decimals) => {
  let a = 0;
  if (pairs && amountB) {
    a = BigNumber(amountB)
      .times(pairs.tokenA.amount)
      .div(BigNumber(pairs.tokenB.amount).minus(amountB))
      .div(BigNumber(1).minus(fee))
      .toString(10)
      .cutFixed(decimals)
  }
  return a;
}

/**
 * 最小接收额
 * 已知条件：1、支付数值amountA  2、兑换成数值amountB  3、滑点容忍度slippageTolerance
 * 计算公式：amountA / (amountA / amountB * (1 + slippageTolerance/100))
 * */

const minimumReceived = (amountA, amountB, slippageTolerance) => BigNumber(amountA)
  .div(BigNumber(amountA)
    .div(amountB)
    .times(BigNumber(slippageTolerance).div(100).plus(1)))
  .toString(10)

/**
 * 最大卖出额
 * 已知条件：1、支付数值amountA  2、兑换成数值amountB  3、滑点容忍度slippageTolerance
 * 计算公式：amountA / amountB * (1 + slippageTolerance/100) * amountB
 * */
const maximumSold = (amountA, amountB, slippageTolerance) => BigNumber(amountA)
  .div(amountB)
  .times(BigNumber(slippageTolerance).div(100).plus(1))
  .times(amountB)
  .toString(10)

/**
 * 价格影响
 * 已知条件：1、支付币种流动性tokenA.amount  2、兑换成币种流动性tokenB.amount 3、上一跳购入前价格data.beforPrice  4、上一跳购入后价格data.afterPrice 5、支付数值amountA 6、兑换成数值amountB
 * 计算公式：
 *  1、购入前价格：tokenA.amount/tokenB.amount * data.beforPrice
 *  2、购入后价格：(tokenA.amount+amountA)/(tokenB.amount-amountB) * data.afterPrice
 *  3、价格影响值：(购入后价格-购入前价格)/购入前价格
 * */

const priceImpact = (pair, data, amountA, amountB) => {
  const beforPrice = BigNumber(pair.tokenA.amount)
    .div(pair.tokenB.amount)
    .times(data.beforPrice)

  const afterPrice = BigNumber(pair.tokenA.amount)
    .plus(amountA)
    .div(BigNumber(pair.tokenB.amount).minus(amountB))
    .times(data.afterPrice)

  return {
    beforPrice: beforPrice.toString(10),
    afterPrice: afterPrice.toString(10),
    priceImpact: afterPrice.minus(beforPrice).div(beforPrice).times(100).toString(10)
  }
}

const nextStep = (opt, data) => {
  // console.log('wallet==============', data)
  if (data.code === 200 && opt.success) {
    opt.success(data)
  }
  if (data.code !== 200 && opt.error) {
    opt.error(data)
  }
  if (opt.done) {
    opt.done(data)
  }
}

const callHandler = (opt) => {
  // console.log(opt.data)
  if (isWallet) {
    window.jsBridge(opt.name, opt.data, (responseData) => {
      const data = JSON.parse(responseData);
      nextStep(opt, data)
    });
  } else if (window.HBC_wallet_isready) {
    window.HBC_wallet.callHandler(opt.name, opt.data, (responseData) => {
      nextStep(opt, responseData)
    });
  } else if (opt.failed) {
    opt.failed()
  }
}

export default {
  isChrome,
  isFirefox,
  isWallet,
  callHandler,
  bigNumber: BigNumber,
  tokenAtoB,
  tokenBtoA,
  generateRouteNodeV2,
  minimumReceived,
  maximumSold,
  priceImpact,
  formatter(tokensMap, tokenId, val) {
    const value = val.split(".");
    const token = tokensMap[tokenId];
    let length = 10000;
    if (token) {
      length = token.decimals;
    }
    if (value.length > 1 && value[1].length > length) {
      return val.cutFixed(length);
    }
    return val;
  },

  symbol2Token(string = '', tokensMap = {}) {
    const [tokenA, tokenB] = string.toLocaleLowerCase().split('-');
    const tokens = { tokenA: "", tokenB: "" }

    if (tokenA && tokensMap[tokenA]) {
      tokens.tokenA = tokenA
    }

    if (tokenB && tokensMap[tokenB]) {
      tokens.tokenB = tokenB
    }

    return tokens
  },
  getLang() {
    const list = ["en-us", "zh-cn"];
    const navLang = navigator.language.toLocaleLowerCase();
    const { locale } = localStorage;
    let language = "en-us";
    const query = getQueryVariable('lang')
    if (list.indexOf(navLang) > -1) {
      language = navLang;
    }
    if (list.indexOf(locale) > -1) {
      language = locale;
    }
    if (list.indexOf(query) > -1) {
      language = query;
    }
    localStorage.locale = language;
    return language;
  },
};