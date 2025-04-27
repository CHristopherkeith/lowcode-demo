import { message } from 'ant-design-vue'
import type { DataSource } from '@/types/lowcode'

// 模拟API响应数据生成器
export function generateMockData(componentType: string, url: string): any {
  console.log(`[API模拟] 请求API: ${url}`)

  // 根据组件类型生成不同的模拟数据
  switch (componentType) {
    case 'table':
      return Array.from({ length: 5 }, (_, i) => ({
        key: i,
        name: `用户${i + 1}`,
        age: Math.floor(Math.random() * 50) + 18,
        address: `模拟城市 ${i + 1} 号`,
        tags: ['模拟标签'],
      }))

    case 'barChart':
    case 'lineChart':
      return {
        categories: ['一月', '二月', '三月', '四月', '五月'],
        series: [
          {
            name: 'API数据系列1',
            data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 200) + 50),
            smooth: componentType === 'lineChart',
          },
          {
            name: 'API数据系列2',
            data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 200) + 50),
            smooth: componentType === 'lineChart',
          },
        ],
      }

    case 'form':
      return {
        name: '模拟用户',
        age: 28,
        email: 'user@example.com',
        address: '模拟地址',
        status: '活跃',
      }

    default:
      return {
        message: '模拟API数据',
        timestamp: new Date().toISOString(),
        data: Array.from({ length: 3 }, (_, i) => ({ id: i, name: `项目${i}` })),
      }
  }
}

// 模拟API请求
export function fetchApiData(
  componentType: string,
  dataSource: DataSource,
  callback: (data: any) => void,
): void {
  const { url, method } = dataSource

  console.log(`[API请求] 组件类型: ${componentType}, 请求方法: ${method}, URL: ${url}`)

  // 模拟网络延迟
  setTimeout(() => {
    try {
      const mockData = generateMockData(componentType, url)
      console.log(`[API响应] 成功获取数据:`, mockData)
      callback(mockData)
    } catch (error) {
      console.error(`[API错误] 请求失败:`, error)
      message.error('API请求失败')
    }
  }, 500)
}

// 创建和管理定时刷新
export function setupRefreshTimer(
  componentId: string,
  componentType: string,
  dataSource: DataSource,
  callback: (data: any) => void,
): number | null {
  const { refreshInterval } = dataSource

  if (!refreshInterval || refreshInterval <= 0) {
    console.log(`[定时刷新] 组件 ${componentId} 未设置刷新间隔或间隔为0，不启用定时刷新`)
    return null
  }

  console.log(`[定时刷新] 组件 ${componentId} 设置刷新间隔: ${refreshInterval}秒`)

  // 转换为毫秒
  const intervalMs = refreshInterval * 1000

  // 创建定时器
  const timerId = window.setInterval(() => {
    console.log(`[定时刷新] 组件 ${componentId} 执行定时刷新，间隔: ${refreshInterval}秒`)
    fetchApiData(componentType, dataSource, callback)
  }, intervalMs)

  return timerId
}

// 清除定时刷新
export function clearRefreshTimer(timerId: number | null): void {
  if (timerId !== null) {
    window.clearInterval(timerId)
    console.log(`[定时刷新] 清除定时器 ID: ${timerId}`)
  }
}
