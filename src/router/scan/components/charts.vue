<template lang="pug">
div
  .option
    van-button(
      v-for="(item, key) in option",
      size="small",
      :type="interval === item ? 'info' : 'default'",
      @click="getKline(item)",
      :key="item"
    ) {{ $lang(`scan.${key}`) }}
  .charts
    div(style="height: 300px", ref="charts")
    .loading
      van-loading(v-if="loading")
</template>
<script>
import echarts from "echarts";

export default {
  props: {
    pair: {
      type: String,
      default: "",
    },
    metric: {
      type: String,
      default: "amount",
    },
    type: {
      type: String,
      default: "bar",
    },
    name: {
      type: String,
      default: "name",
    },
  },
  data() {
    return {
      loading: false,
      interval: "1d",
      charts: null,
      option: {
        daily: "1d",
        weekly: "7d",
      },
    };
  },
  methods: {
    getKline(interval, init) {
      if (this.interval !== interval || init) {
        this.interval = interval;
        this.loading = true;
        this.$axios
          .get("/api/v1/analytics/kline", {
            params: {
              interval,
              metric: this.metric,
              pair: this.pair,
            },
          })
          .then((result) => {
            this.loading = false;
            if (result.code === 0) {
              this.renderCharts(
                result.data.list.map((el) => {
                  const json = {
                    time: new Date(el.time * 1000).format("yyyy/MM/dd"),
                    value: el.value.cutFixed(2),
                  };
                  return json;
                })
              );
            }
          });
      }
    },

    renderCharts(data) {
      let series = [
        {
          name: this.name,
          type: "bar",
          data: data.map((el) => el.value),
          color: "rgba(51, 117, 224, 0.3)",
        },
      ];

      if (this.type === "line") {
        series = [
          {
            name: this.name,
            type: "line",
            data: data.map((el) => el.value),
            color: "#B0BFDB",
            itemStyle: {
              color: "#3673dd",
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgba(51, 117, 224, 0.3)",
                },
                {
                  offset: 1,
                  color: "rgba(66, 153, 255, 0) 1)",
                },
              ]),
            },
          },
        ];
      }

      this.charts = echarts.init(this.$refs.charts);
      // 绘制图表
      this.charts.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        xAxis: {
          data: data.map((el) => el.time),
          axisLine: {
            lineStyle: {
              color: "#6E8196",
            },
          },
        },
        yAxis: {
          splitLine: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: "#6E8196",
            },
          },
          axisLabel: {
            formatter(val) {
              return `$${val}`;
            },
          },
        },
        grid: {
          left: "1%",
          right: "0%",
          bottom: "8",
          top: "10",
          containLabel: true,
        },
        series,
      });
    },
    resize() {
      this.charts.resize();
    },
  },
  watch: {
    pair() {
      this.getKline(this.interval, true);
    },
  },
  mounted() {
    this.getKline(this.interval, true);
    window.addEventListener("resize", this.resize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resize);
  },
};
</script>

<style scoped lang="less">
@import "../../../libs/mixin";
.option {
  padding-bottom: 2 * @grid;
  /deep/ .van-button {
    margin-right: @grid;
  }
}
.charts {
  height: 314px;
  position: relative;
  .loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>