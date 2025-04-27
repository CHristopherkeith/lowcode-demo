<template>
  <div class="chart-container" :style="{ height: `${props.height}px` }">
    <v-chart :option="chartOption" :autoresize="true" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import VChart from 'vue-echarts'
import { fetchApiData, setupRefreshTimer, clearRefreshTimer } from '@/utils/api-service'

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
    url: string
    method: string
    refreshInterval: number
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

// 保存refreshTimer引用
const refreshTimer = ref<number | null>(null)

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

    // 检查是否需要加载API数据
    if (props.dataSource?.type === 'api' && props.dataSource.url) {
      loadApiData()
    }
  }, 0)
})

// 在组件销毁时清除定时器
onUnmounted(() => {
  clearRefreshTimer(refreshTimer.value)
})

// 加载API数据
const loadApiData = () => {
  if (props.dataSource?.type === 'api' && props.dataSource.url) {
    console.log(`[${props.type}图表] 开始加载API数据，URL:`, props.dataSource.url)

    // 清除之前的定时器
    clearRefreshTimer(refreshTimer.value)

    // 获取API数据
    fetchApiData(props.type + 'Chart', props.dataSource, (data) => {
      console.log(`[${props.type}图表] API数据加载成功:`, data)

      // 更新图表数据
      if (data && data.categories && data.series) {
        chartData.value = {
          categories: data.categories,
          series: data.series,
        }
      }
    })

    // 设置定时刷新
    if (props.dataSource.refreshInterval > 0) {
      refreshTimer.value = setupRefreshTimer(
        'chart-' + Date.now(),
        props.type + 'Chart',
        props.dataSource,
        (data) => {
          if (data && data.categories && data.series) {
            chartData.value = {
              categories: data.categories,
              series: data.series,
            }
          }
        },
      )
    }
  }
}

// 监听数据源类型和URL变化
watch(
  () => [props.dataSource?.type, props.dataSource?.url, props.dataSource?.refreshInterval],
  ([newType, newUrl, newInterval], [oldType, oldUrl, oldInterval]) => {
    console.log(`[${props.type}图表] 数据源配置变化:`, {
      type: { from: oldType, to: newType },
      url: { from: oldUrl, to: newUrl },
      refreshInterval: { from: oldInterval, to: newInterval },
    })

    // 如果变为API类型或URL发生变化，重新加载数据
    if (
      (newType === 'api' && newUrl && (newType !== oldType || newUrl !== oldUrl)) ||
      (newType === 'api' && newUrl && newInterval !== oldInterval)
    ) {
      loadApiData()
    }

    // 如果变为静态数据，清除定时器
    if (newType === 'static' && oldType === 'api') {
      clearRefreshTimer(refreshTimer.value)
      refreshTimer.value = null

      // 从静态数据源更新图表
      chartData.value = getDataFromSource()
    }
  },
)

// 监听静态数据源变化
watch(
  () => props.dataSource?.data,
  (newData, oldData) => {
    if (props.dataSource?.type === 'static') {
      console.log('[图表] 静态数据源变化:', newData)
      if (newData !== oldData) {
        console.log('[图表] 更新图表数据')
        chartData.value = getDataFromSource()
      }
    }
  },
  { deep: true, immediate: true },
)

// 监听其他属性变化
watch(
  () => [props.xAxisData, props.seriesData, props.title, props.height, props.legendVisible],
  () => {
    if (props.dataSource?.type !== 'api') {
      console.log('[图表] 其他属性发生变化')
      chartData.value = getDataFromSource()
    }
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
