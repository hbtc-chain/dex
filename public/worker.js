onmessage = function (e) {
  const data = e.data;
  const tokenA = data.tokenA;
  const tokenB = data.tokenB;
  const symbols = data.symbols;

  const route = generateRouteNodeV2(tokenA, tokenB, symbols);

  postMessage({
    route,
    tokenA,
    tokenB,
    symbols,
  });
};

const generateRouteNodeV2 = (
  tokenA,
  tokenB,
  symbols,
  history = [],
  route = [],
  cacheSymbols = [],
  cacheHistory = [],
  next
) => {
  if (!cacheSymbols.length) {
    symbols.forEach((el) => {
      cacheSymbols.push(el);
      cacheSymbols.push({
        id: [el.tokenB.symbol, el.tokenA.symbol].join("-"),
        tokenB: el.tokenA,
        tokenA: el.tokenB,
      });
    });
  }

  const list = cacheSymbols.filter((el) => {
    // 过滤列表包含 tokenA, 且历史路径里不存在已出现过的币对和反向币对, 且不能出现路径已存在的币种
    if (el.tokenA.symbol === tokenA) {
      const tempId = [el.tokenB.symbol, el.tokenA.symbol].join("-");
      const tmp = cacheHistory.filter((_el) => {
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
    cacheHistory.push(el);
    if (el.tokenB.symbol === tokenB) {
      route.push([...history, el]);
    } else if (!next) {
      generateRouteNodeV2(
        el.tokenB.symbol,
        tokenB,
        symbols,
        [...history, el],
        route,
        cacheSymbols,
        cacheHistory,
        true
      );
    }
  });
  return route;
};
