import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [{
  path: "/",
  redirect: "/swap",
},
{
  path: "/swap",
  name: "swap",
  component: () => import("./swap/index.vue"),
},
{
  path: "/swap/:id",
  name: "swapDetail",
  component: () => import("./swap/index.vue"),
},
{
  path: "/pool",
  name: "pool",
  component: () => import("./pool/index.vue"),
},
{
  path: "/pool/:id",
  name: "poolDetial",
  component: () => import("./pool/index.vue"),
},
{
  path: "/trade",
  name: "trade",
  component: () => import("./trade/index.vue"),
},
{
  path: "/trade/:id",
  name: "tradeDetail",
  component: () => import("./trade/index.vue"),
},
{
  path: "/scan/",
  name: "scan",
  component: () => import("./scan/index.vue"),
},
{
  path: "/scan/:id",
  name: "scanDetail",
  component: () => import("./scan/index.vue"),
}
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;