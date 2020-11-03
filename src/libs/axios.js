import axios from "axios";
// 添加响应拦截器
axios.interceptors.response.use(
  (response) => {
    const json = {
      code: 0,
      msg: "ok",
      data: {},
    };
    if (response.status === 200) {
      json.data = response.data;
    } else {
      json.code = response.status;
      json.data = response.data;
    }
    return json;
  },
  (error) => error,
);
axios.defaults.transformRequest = [
  (data) => {
    if (data) {
      const ret = [];
      Object.keys(data).forEach((el) => ret.push([encodeURIComponent(el), encodeURIComponent(data[
        el])].join('=')));
      return ret.join("&");
    }
    return "";
  },
];

axios.defaults.validateStatus = (status) => status >= 200 && status < 1000;
axios.defaults.responseType = "json";
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
export default axios;
