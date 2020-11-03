const getIp = () => {
  var interfaces = require("os").networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
        return alias.address;
      }
    }
  }
};
module.exports = {
  // 选项...
  publicPath: process.env.NODE_ENV === 'production' ?
    'https://static.bhfastime.com/swap' : '/',
  outputDir: "build",

  assetsDir: "static",

  productionSourceMap: false,

  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  chainWebpack: config => {
    config.plugins.delete("prefetch");

    if (process.env.NODE_ENV === 'production') {
      config
        .plugin('html')
        .tap(args => {
          Object.assign(args[0].minify, {
            minifyJS: true,
            minifyCSS: true
          })
          return args
        })
    }
  },
  devServer: {
    // 选项...'
    host: getIp(),
    https: true,
    open: true,
    proxy: {
      "/api": {
        target: "https://juswap.io/"
      }
    }
  }
};
