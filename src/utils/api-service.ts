import { message } from 'ant-design-vue'
import type { DataSource } from '@/types/lowcode'

// 随机数据生成辅助函数
const randomUtils = {
  // 随机整数
  int: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,

  // 随机浮点数（保留2位小数）
  float: (min: number, max: number): number => +(Math.random() * (max - min) + min).toFixed(2),

  // 随机选择数组中的一项
  pickOne: <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)],

  // 随机生成指定长度的数组
  array: <T>(length: number, generator: (index: number) => T): T[] => {
    return Array.from({ length }, (_, i) => generator(i))
  },

  // 随机生成中文名
  chineseName: (): string => {
    const surnames = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '郑', '孙', '马']
    const names = [
      '明',
      '华',
      '强',
      '伟',
      '芳',
      '娜',
      '军',
      '杰',
      '磊',
      '静',
      '敏',
      '燕',
      '晓',
      '涛',
      '勇',
    ]
    return (
      randomUtils.pickOne(surnames) +
      randomUtils.pickOne(names) +
      (Math.random() > 0.6 ? randomUtils.pickOne(names) : '')
    )
  },

  // 随机电话号码
  phone: (): string => {
    const prefixes = ['137', '138', '139', '150', '151', '152', '158', '159', '188', '189']
    const prefix = randomUtils.pickOne(prefixes)
    const suffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
    return prefix + suffix
  },

  // 随机邮箱
  email: (name?: string): string => {
    const names = name
      ? name.toLowerCase().replace(/\s/g, '')
      : ['user', 'admin', 'customer', 'test', 'dev', 'support'][Math.floor(Math.random() * 6)]
    const domains = [
      'gmail.com',
      'qq.com',
      '163.com',
      '126.com',
      'outlook.com',
      'hotmail.com',
      'yahoo.com',
    ]
    return `${names}${randomUtils.int(1, 999)}@${randomUtils.pickOne(domains)}`
  },

  // 随机地址
  address: (): string => {
    const provinces = [
      '北京市',
      '上海市',
      '广东省',
      '江苏省',
      '浙江省',
      '山东省',
      '四川省',
      '湖北省',
      '河南省',
    ]
    const cities = [
      '朝阳区',
      '浦东新区',
      '广州市',
      '南京市',
      '杭州市',
      '济南市',
      '成都市',
      '武汉市',
      '郑州市',
    ]
    const streets = [
      '中山路',
      '人民大道',
      '解放路',
      '建设路',
      '和平街',
      '富强路',
      '幸福大道',
      '新华街',
    ]
    return `${randomUtils.pickOne(provinces)}${randomUtils.pickOne(cities)}${randomUtils.pickOne(streets)}${randomUtils.int(1, 999)}号`
  },

  // 随机日期
  date: (startYear = 2020, endYear = 2024): string => {
    const year = randomUtils.int(startYear, endYear)
    const month = randomUtils.int(1, 12)
    const day = randomUtils.int(1, 28) // 简化处理，避免不同月份天数不同的问题
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  },

  // 随机IP地址
  ip: (): string => {
    return `${randomUtils.int(1, 255)}.${randomUtils.int(1, 255)}.${randomUtils.int(1, 255)}.${randomUtils.int(1, 255)}`
  },

  // 随机状态
  status: (): string => {
    return randomUtils.pickOne(['成功', '失败', '处理中', '待审核', '已完成', '已拒绝', '已过期'])
  },

  // 根据字段名称智能生成数据
  generateByFieldName: (fieldName: string): any => {
    const lowerField = fieldName.toLowerCase()

    // 根据常见字段名称生成对应类型的值
    if (lowerField.includes('name') || lowerField.includes('姓名')) {
      return randomUtils.chineseName()
    } else if (lowerField.includes('age') || lowerField.includes('年龄')) {
      return randomUtils.int(18, 65)
    } else if (
      lowerField.includes('phone') ||
      lowerField.includes('tel') ||
      lowerField.includes('电话')
    ) {
      return randomUtils.phone()
    } else if (lowerField.includes('email') || lowerField.includes('邮箱')) {
      return randomUtils.email()
    } else if (lowerField.includes('address') || lowerField.includes('地址')) {
      return randomUtils.address()
    } else if (
      lowerField.includes('date') ||
      lowerField.includes('time') ||
      lowerField.includes('日期')
    ) {
      return randomUtils.date()
    } else if (lowerField.includes('ip')) {
      return randomUtils.ip()
    } else if (lowerField.includes('status') || lowerField.includes('状态')) {
      return randomUtils.status()
    } else if (lowerField.includes('id') || lowerField.includes('编号')) {
      return String(randomUtils.int(10000, 99999))
    } else if (
      lowerField.includes('price') ||
      lowerField.includes('amount') ||
      lowerField.includes('价格') ||
      lowerField.includes('金额')
    ) {
      return randomUtils.float(10, 10000)
    } else if (
      lowerField.includes('count') ||
      lowerField.includes('num') ||
      lowerField.includes('数量')
    ) {
      return randomUtils.int(1, 1000)
    } else if (
      lowerField.includes('rate') ||
      lowerField.includes('ratio') ||
      lowerField.includes('percent') ||
      lowerField.includes('比率')
    ) {
      return randomUtils.float(0, 100) + '%'
    } else if (
      lowerField.includes('desc') ||
      lowerField.includes('remark') ||
      lowerField.includes('描述') ||
      lowerField.includes('备注')
    ) {
      const phrases = [
        '这是一段示例描述',
        '用于测试的随机文本',
        '模拟数据，仅供参考',
        '这里可以填写详细信息',
        '这是备注内容',
      ]
      return randomUtils.pickOne(phrases)
    }

    // 默认返回随机字符串
    return `值_${randomUtils.int(1, 1000)}`
  },
}

// 模拟API响应数据生成器
export function generateMockData(componentType: string, url: string, extraData?: any): any {
  console.log(`[API模拟] 请求API: ${url}`)

  // 分析URL，尝试从中提取信息
  let apiKey = ''
  try {
    // 尝试从URL中提取关键字
    const urlObj = new URL(url)
    apiKey = urlObj.pathname.split('/').filter(Boolean).pop() || ''
  } catch {
    // URL解析失败，尝试直接从字符串中提取最后一部分
    apiKey = url.split('/').filter(Boolean).pop() || ''
  }

  console.log(`[API模拟] 提取到API关键字: ${apiKey}`)

  // 根据组件类型和API关键字生成不同的模拟数据
  switch (componentType) {
    case 'table': {
      // 尝试从extraData中获取列定义
      const columns = extraData?.columns || [
        { dataIndex: 'name', title: '用户名' },
        { dataIndex: 'age', title: '年龄' },
        { dataIndex: 'address', title: '地址' },
      ]

      // 生成随机行数的数据
      const rowCount = randomUtils.int(5, 15)
      return randomUtils.array(rowCount, (i) => {
        const row: Record<string, any> = { key: i }

        // 根据列定义生成对应的数据
        columns.forEach((col: { dataIndex: string; title: string }) => {
          if (col.dataIndex && col.dataIndex !== 'action') {
            row[col.dataIndex] = randomUtils.generateByFieldName(col.dataIndex || col.title)
          }
        })

        return row
      })
    }

    case 'barChart':
    case 'lineChart': {
      // 随机生成类别数量
      const categoryCount = randomUtils.int(5, 8)
      // 随机生成数据系列数量
      const seriesCount = randomUtils.int(2, 4)

      // 根据API关键字调整类别生成
      let categories
      if (apiKey.includes('month') || apiKey.includes('月份')) {
        categories = [
          '一月',
          '二月',
          '三月',
          '四月',
          '五月',
          '六月',
          '七月',
          '八月',
          '九月',
          '十月',
          '十一月',
          '十二月',
        ].slice(0, categoryCount)
      } else if (apiKey.includes('day') || apiKey.includes('日期')) {
        categories = randomUtils.array(categoryCount, (i) => `${randomUtils.int(1, 30)}日`)
      } else if (apiKey.includes('year') || apiKey.includes('年份')) {
        categories = randomUtils.array(categoryCount, (i) => `${2020 + i}年`)
      } else if (apiKey.includes('quarter') || apiKey.includes('季度')) {
        categories = ['第一季度', '第二季度', '第三季度', '第四季度'].slice(0, categoryCount)
      } else if (apiKey.includes('region') || apiKey.includes('地区')) {
        categories = ['华东', '华南', '华北', '西南', '东北', '西北', '华中', '港澳台'].slice(
          0,
          categoryCount,
        )
      } else if (apiKey.includes('product') || apiKey.includes('产品')) {
        categories = ['产品A', '产品B', '产品C', '产品D', '产品E', '产品F', '产品G', '产品H'].slice(
          0,
          categoryCount,
        )
      } else {
        categories = randomUtils.array(categoryCount, (i) => `类别${i + 1}`)
      }

      // 根据API关键字调整系列生成
      let seriesNames
      if (apiKey.includes('sales') || apiKey.includes('营销') || apiKey.includes('销售')) {
        seriesNames = ['销售额', '利润', '成本', '客户数'].slice(0, seriesCount)
      } else if (apiKey.includes('traffic') || apiKey.includes('流量')) {
        seriesNames = ['访问量', '点击率', '转化率', '停留时间'].slice(0, seriesCount)
      } else if (apiKey.includes('performance') || apiKey.includes('绩效')) {
        seriesNames = ['完成率', '满意度', '效率', '质量评分'].slice(0, seriesCount)
      } else {
        seriesNames = randomUtils.array(seriesCount, (i) => `系列${i + 1}`)
      }

      // 生成数据系列
      const series = seriesNames.map((name) => ({
        name,
        data: randomUtils.array(categories.length, () => randomUtils.int(50, 500)),
        smooth: componentType === 'lineChart' && Math.random() > 0.5,
      }))

      return {
        categories,
        series,
      }
    }

    case 'form': {
      // 创建一个基础的表单数据对象
      const formData: Record<string, any> = {}

      // 尝试从extraData中获取表单字段
      const fields = extraData?.fields || []

      // 根据字段生成数据
      if (fields.length > 0) {
        fields.forEach((field: { name: string; type: string }) => {
          formData[field.name] = randomUtils.generateByFieldName(field.name)
        })
      } else {
        // 默认生成一些常见字段
        formData.name = randomUtils.chineseName()
        formData.age = randomUtils.int(18, 65)
        formData.email = randomUtils.email(formData.name)
        formData.phone = randomUtils.phone()
        formData.address = randomUtils.address()
        formData.createTime = randomUtils.date()
        formData.status = randomUtils.status()
      }

      // 根据API关键字添加特定数据
      if (apiKey.includes('user') || apiKey.includes('用户')) {
        formData.userId = `USER_${randomUtils.int(10000, 99999)}`
        formData.role = randomUtils.pickOne(['管理员', '普通用户', '访客', '编辑者'])
        formData.department = randomUtils.pickOne([
          '技术部',
          '市场部',
          '销售部',
          '人力资源部',
          '财务部',
        ])
      } else if (apiKey.includes('order') || apiKey.includes('订单')) {
        formData.orderId = `ORD_${randomUtils.int(10000, 99999)}`
        formData.orderTime = randomUtils.date()
        formData.amount = randomUtils.float(100, 10000)
        formData.paymentStatus = randomUtils.pickOne(['已付款', '未付款', '部分付款', '已退款'])
        formData.deliveryStatus = randomUtils.pickOne(['已发货', '未发货', '运输中', '已签收'])
      } else if (apiKey.includes('product') || apiKey.includes('产品')) {
        formData.productId = `PRD_${randomUtils.int(10000, 99999)}`
        formData.productName = `产品_${randomUtils.int(1, 100)}`
        formData.price = randomUtils.float(10, 10000)
        formData.stock = randomUtils.int(0, 1000)
        formData.category = randomUtils.pickOne(['电子产品', '服装', '食品', '家居', '图书'])
      }

      return formData
    }

    default:
      return {
        message: '模拟API数据',
        timestamp: new Date().toISOString(),
        data: randomUtils.array(randomUtils.int(3, 10), (i) => ({
          id: i,
          name: `项目${i}`,
          value: randomUtils.int(50, 500),
          date: randomUtils.date(),
        })),
      }
  }
}

// 模拟API请求
export function fetchApiData(
  componentType: string,
  dataSource: DataSource,
  callback: (data: any) => void,
): void {
  const { url, method, params } = dataSource

  console.log(`[API请求] 组件类型: ${componentType}, 请求方法: ${method}, URL: ${url}`)
  console.log(`[API请求] 参数:`, params || '无')

  // 针对表格组件获取列定义
  let extraData = {}
  if (componentType === 'table' && params && 'columns' in params) {
    extraData = { columns: params.columns }
  }

  // 针对表单组件获取字段定义
  if (componentType === 'form' && params && 'fields' in params) {
    extraData = { fields: params.fields }
  }

  // 模拟网络延迟
  setTimeout(
    () => {
      try {
        const mockData = generateMockData(componentType, url, extraData)
        console.log(`[API响应] 成功获取数据:`, mockData)
        callback(mockData)
      } catch (error) {
        console.error(`[API错误] 请求失败:`, error)
        message.error('API请求失败')
      }
    },
    randomUtils.int(300, 800),
  ) // 随机延迟，更真实
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
