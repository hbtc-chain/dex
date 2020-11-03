import Vue from 'vue';
import Vuex from 'vuex';
import Helper from '@/libs/helper'
import axios from "@/libs/axios";

Vue.use(Vuex);

let timer = null;

export default new Vuex.Store({
  state: {
    delay: {
      standard: 3000,
      slow: 5000
    },
    configWin: false,
    config: {
      slippageTolerance: 0.1,
      transactionDeadline: 20,
    },
    hashList: [],
    liquidityApiReady: false,
    tokens: [],
    tokensMap: {},
    assets: {},
    pairs: {},
    liquidity: [],
    symbols: [],
    address: "",
    mini: false,
    local: "",
    isChrome: Helper.isChrome,
    isFirefox: Helper.isFirefox,
    isWallet: Helper.isWallet,
    connectWalletWin: false,
    chainLink: "//explorer.hbtcchain.io"
  },
  mutations: {
    setState(state, payload) {
      Object.assign(state, payload)
    },
  },
  actions: {
    setState({
      commit,
    }, payload) {
      commit("setState", payload);
    },

    wallteInit({
      commit, dispatch
    }) {
      Helper.callHandler({
        name: "get_account",
        success: (res) => {
          const { address } = res.data;
          const localCache = localStorage[address];
          let hashList = [];
          if (localCache) {
            try {
              hashList = JSON.parse(localCache).filter((el) => el.hash)
            } catch (error) {
              // console.error(error)
            }
          }
          commit("setState", { address, hashList });
          dispatch("getUserData");
        }
      });
    },

    pushTxs({ state }, payload) {
      if (!payload) return
      if (payload.txhash) {
        state.hashList.unshift({
          hash: payload.txhash,
          createdAt: new Date().getTime()
        })
      } else {
        state.hashList = state.hashList.map((el) => {
          if (payload.data && el.hash === payload.data.hash) {
            return { ...el, result: payload.data }
          }
          return el
        })
      }
      localStorage[state.address] = JSON.stringify(state.hashList)
    },
    getUserData({ commit, state, dispatch }) {
      if (state.address) {
        clearTimeout(timer)
        axios.get(`/api/v1/cus/${state.address}`).then((result) => {
          if (result.code === 0) {
            const assets = {};
            result.data.assets.forEach((el) => {
              assets[el.symbol] = el;
              assets[el.symbol].showAmount = el.amount;
              if (el.symbol === 'hbc') {
                assets[el.symbol].amount = Helper.bigNumber.max(0, Helper.bigNumber(el.amount).minus(0.01)).toString(10)
              }
            });
            commit("setState", { assets });
          }
        });

        axios
          .get(`/api/v1/swap/liquidity?address=${state.address}`)
          .then((result) => {
            if (result.code === 0) {
              const { tokensMap } = state
              const liquidity = result.data.list.map((element) => {
                const { pair } = element;
                pair.tokenA.amount = Helper.bigNumber(
                  pair.tokenA.amount
                ).times(element.liquidityShare)
                  .div(tokensMap[pair.tokenA.symbol].pow)
                  .toString(10)
                  .cutFixed(tokensMap[pair.tokenA.symbol].decimals);
                pair.tokenB.amount = Helper.bigNumber(
                  pair.tokenB.amount
                ).times(element.liquidityShare)
                  .div(tokensMap[pair.tokenB.symbol].pow)
                  .toString(10)
                  .cutFixed(tokensMap[pair.tokenB.symbol].decimals);
                return element;
              });
              commit('setState', {
                liquidity,
                liquidityApiReady: true,
              });
            }
          });
        timer = setTimeout(() => {
          dispatch("getUserData");
        }, state.delay.standard);
      }
    },
  },
  modules: {},
});