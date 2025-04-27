<template>
  <div class="chart-container" :style="{ height: `${props.height}px` }">
    <v-chart :option="chartOption" :autoresize="true" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import VChart from 'vue-echarts'

// 组件属性定义
interface ChartSeries {
  name: string
  data: number[]
  smooth?: boolean
  type?: string
}

interface ChartData {
  categories: string[]
  series: ChartSeries[]
}

interface Props {
  type: 'bar' | 'line'
  title?: string
  height?: number
  legendVisible?: boolean
  xAxisData?: string[]
  seriesData?: ChartSeries[]
  dataSource?: {
    type: 'static' | 'api'
    data: ChartData | null
  }
}

const props = withDefaults(defineProps<Props>(), {
  type: 'bar',
  title: '',
  height: 400,
  legendVisible: true,
  xAxisData: () => ['类别1', '类别2', '类别3', '类别4', '类别5'],
  seriesData: () => [],
})

// 从静态数据源获取数据
const getDataFromSource = (): { categories: string[]; series: ChartSeries[] } => {
  if (props.dataSource?.type === 'static' && props.dataSource.data) {
    const data = props.dataSource.data
    return {
      categories: data.categories || [],
      series: data.series || [],
    }
  }

  return {
    categories: props.xAxisData || [],
    series: props.seriesData || [],
  }
}

// 图表数据
const chartData = ref(getDataFromSource())

// 确保组件挂载后刷新图表
onMounted(() => {
  // 强制刷新图表数据
  setTimeout(() => {
    chartData.value = getDataFromSource()
  }, 0)
})

// 监听数据源变化
watch(
  () => props.dataSource?.data,
  (newData, oldData) => {
    console.log('图表dataSource.data发生变化', newData)
    if (newData !== oldData) {
      console.log('更新图表数据')
      chartData.value = getDataFromSource()
    }
  },
  { deep: true, immediate: true },
)

// 监听其他属性变化
watch(
  () => [props.xAxisData, props.seriesData, props.title, props.height, props.legendVisible],
  () => {
    console.log('图表其他属性发生变化')
    chartData.value = getDataFromSource()
  },
  { deep: true },
)

// 图表配置
const chartOption = computed(() => {
  // 处理数据系列
  const { categories, series } = chartData.value

  const seriesData = Array.isArray(series)
    ? series.map((item) => ({
        ...item,
        type: props.type, // 设置图表类型：bar 或 line
      }))
    : []

  return {
    title: {
      text: props.title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      show: props.legendVisible,
      top: 30,
      left: 'center',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories || [],
    },
    yAxis: {
      type: 'value',
    },
    series: seriesData,
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  min-height: 300px;
}
</style>
