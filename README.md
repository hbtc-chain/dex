# HBC DEX

## Install


```bash
npm install
```

## Run

```bash
npm start
```

## Website [https://juswap.io/](https://juswap.io/)

## explorer [explorer.hbtcchain.io](https://explorer.hbtcchain.io/)

##一、浏览器钱包

    1、swap 通过 XXXX_wallet_isready来校验页面钱包是否初始化

    2、用户通


## APP钱包接入

### 1、通信协议
    
    swap 网页通过 jsBridge 与APP进行通信交互

### 2、封装方法
    
```bash
    const nextStep = (opt, data) => {
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
        if (isWallet) {
            window.jsBridge(opt.name, opt.data, (responseData) => {
                const data = JSON.parse(responseData);
                nextStep(opt, data)
            });
        }else if (opt.failed) {
            opt.failed()
        }
    }
```

### 3、通信过程

    1、swap 通过 get_account 获取钱包地址（未授权->钱包提示授权）。
```bash
callHandler({
    name: "get_account",
    success: (result) => {
        #获得钱包地址
        # {
        #    code: 200,
        #    msg: "OK",
        #    data: {address: "HBCeE5zNMEN3eLuieaZGQ51CuyBNYxYSBH9g"}
        # }
    },
    error: (result) =>{
        # { 
        #    code: 400, 
        #    msg: "HBC_wallet not connected"
        # }

        # { 
        #    code: 400, 
        #    msg: "Not logged in"
        # }
    }
});
```
    2、通常是自动获取钱包。出现获取失败，用户可以手动连接钱包再次获取。

```bash
callHandler({
    name: "connect",
    success: (result) => {

        # {
        #    code: 200,
        #    msg: "OK"
        # }

        #执行第一步 get_account
    },
    error: (result) => {

        # { 
        #    code: 400, 
        #    msg: "XXXXXXX"
        # }

        # 返回失败原因 result.msg;
    },
});
```
    3、发起交易。

```bash
const json = {
    "type":"hbtcchain/openswap/MsgLimitSwap",
    "value":{
        "from":"HBCeE5zNMEN3eLuieaZGQ51CuyBNYxYSBH9g",
        "referer":"HBCeE5zNMEN3eLuieaZGQ51CuyBNYxYSBH9g",
        "receiver":"HBCeE5zNMEN3eLuieaZGQ51CuyBNYxYSBH9g",
        "expired_at":"-1",
        "order_id":"715bd69f-5862-4faa-9881-5ac852ba9d32",
        "amount_in":"1000000000000000000",
        "price":"0.000065000000000000","base_symbol":"aaa",
        "quote_symbol":"hbc",
        "side":"1"
    }
}

callHandler({
    name: "sign",
    data: json,
    success: (result) => {
        # 返回交易hash result.data
        # 
        # {
        #     "code": 200,
        #     "msg": "OK",
        #     "data": {
        #         "height": "0",
        #         "txhash": "90A07369931201C5977F2D3B9660D439EA1DE73A7A4D1BBA71C7545538E2AFC7",
        #         "raw_log": .......,
        #         "logs": .....
        #     }
        # }
    },
    error: (result) => {

        # { 
        #    code: 400, 
        #    msg: "User rejected"
        # }

        # 返回失败原因 result.msg;
    },
});
```
