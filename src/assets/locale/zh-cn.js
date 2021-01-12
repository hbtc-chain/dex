export default {
  tabs: {
    swap: "快速兑换",
    pool: "资金池",
    trade: "限价交易"
  },
  head: {
    explorer: "区块浏览器",
    swap: "交易",
    scan: "交易信息",
    transactions: "我的交易",
    helpCenter: "帮助中心",
    telegram: "电报",
    twitter: "推特",
    wechat: "微信",
    connectWallet: "连接钱包",
    installed: "还没安装 {value}？",
    clickHere: "请点击此处>>",
    initializing: "正在初始化...",
    back: "返回",
    latestTransactions: "最近交易",
    "hbtcchain/openswap/MsgAddLiquidity": "添加流动性",
    "hbtcchain/openswap/MsgRemoveLiquidity": "移除流动性",
    "hbtcchain/openswap/MsgSwapExactIn": "快速兑换",
    "hbtcchain/openswap/MsgSwapExactOut": "快速兑换",
    "hbtcchain/openswap/MsgLimitSwap": "限价挂单",
    "hbtcchain/openswap/MsgCancelLimitSwap": "撤销限价挂单",
    success: "成功",
    failed: "失败",
    processing: "处理中...",
    clearAll: "清空",
    noData: "您的近期交易记录会显示在这里",
    copy: "已复制"
  },
  swap: {
    route: "路由",
    searchCoin: "搜索币种",
    from: "支付",
    to: "兑换成",
    balance: "余额",
    estimated: "约",
    selectToken: "选择通证",
    tokenName: "代币名称",
    max: "全部",
    slippageTolerance: "滑点容忍度",
    price: "价格",
    swap: "兑换",
    minimumReceived: "最小接收额",
    minimumReceivedTip: "如果交易确认之前出现了不利的大幅价格变动，您的交易将退回。",
    maximumSold: "最大卖出额",
    maximumSoldTip: "如果交易确认之前出现了不利的大幅价格变动，您的交易将退回。",
    priceImpact: "价格影响",
    priceImpactTip: "受交易规模影响，市价与预期价格之间的差值。",
    liquidityProviderFee: "流动性提供者费用",
    liquidityProviderFeeTip: "流动性提供者将获得每笔交易的 0.25% 作为协议奖励。",
    enterAnAmount: "输入数量",
    insufficientBalance: "{token} 代币余额不足。",
    insufficientLiquidity: "本次交易流动性不足。",
    enterAmount: "请输入数量",
    swapPrice: "1 {tokenB} 兑换 {price} {tokenA} ",
    transactionSettings: "交易设置",
    transactionDeadline: "截止时间",
    minutes: "分钟",
    confirmSwap: "确认兑换",
    confirmWarningOutput: "兑换结果是预估值。您将获得至少 {amount} {token}，否则交易会取消。请保证您有足够的交易手续费，否则交易将失败。",
    confirmWarningInput: "支付数量是预估值。您将最多支付 {amount} {token}，否则交易会取消。请保证您有足够的交易手续费，否则交易将失败。",
    viewPairAnalytics: "查看币对分析",
  },
  pool: {
    addLiquidity: "增加流动性",
    removeLiquidity: "减少流动性",
    input: "输入",
    priceAndPoolShare: "价格和资金池份额",
    yourPosition: "您的仓位",
    initialPricesAndShare: "初始价格及份额",
    shareOfPool: "资金池份额",
    poolTokens: "资金池代币",
    yourLiquidity: "你的流动性",
    add: "添加",
    remove: "减少",
    swapPrice: "1 {tokenB} 兑换 {tokenA}",
    youWillPay: "你要存入",
    firstTips: "您是首位流动性提供者。<br>您增加的代币比例将决定本资金池的价格。<br>若您同意该价格，请点击“提供”进行审核。",
    supply: "提供",
    confirmSupply: "确认提供",
    price: "价格",
    amount: "数量",
    pooled: "已投资",
    yourPoolShare: "你的份额占比",
    depositedToken: "存入 {token}",
    notSupported: "暂时不支持测试币对接跨链代币交换。"
  },
  trade: {
    history: "历史成交",
    buy: "买入",
    price: "价格",
    cancelAll: "全部撤单",
    sell: "卖出",
    available: "可用",
    openAmount: "委托总量",
    totalAmount: "金额",
    openOrder: "当前委托",
    filled: "成交数量",
    cancel: "撤单",
    orderBookAmount: "数量",
    amount: "数量",
    searchPair: "搜索币对",
    enterPrice: "输入价格",
    enterAmount: "输入数量",
    detail: "详情",
    totalValue: "折算额(USD)",
    avgPrice: "成交均价",
    tradeAmount: "成交金额",
    tradeType: "交易类型",
    add: "增加",
    remove: "减少",
    liquidity: "流动性"
  },
  scan: {
    pooledTokens: "资金池代币",
    pairStats: "交易对数据",
    pair: "交易对",
    result: "结果",
    noResult: "无结果",
    searchCoin: "搜索币种",
    liquidity: "资产流动性",
    volume: "成交额",
    daily: "按天统计",
    weekly: "按周统计",
    swapPrice: "OpenSwap HBC 价格",
    totalLiquidity: "总流动性",
    volume24hrs: "24H成交额",
    transactions24hrs: "24H交易数量",
    pairs: {
      title: "交易对",
      name: "名称",
      liquidity: "资产流动性",
      volume24h: "24H成交额",
      volume7d: "成交额（7天）",
      fees: "24H手续费",
      addLiquidity: "增加流动性",
      trade: "交易",
      action: "操作"
    },
    transactions: {
      title: "成交",
      all: "全部",
      swaps: "兑换",
      adds: "增加",
      removes: "移除",
      totalValue: "总金额",
      tokenAmount: "总数量",
      account: "账户",
      time: "时间",
      tradeSwap: "以 {tokenA} 兑换 {tokenB}",
      tradeAdds: "增加 {tokenA} 和 {tokenB}",
      tradeRemove: "移除 {tokenA} 和 {tokenB}",
    }
  }
};