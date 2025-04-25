// 组件通用样式
export interface ComponentStyle {
  width?: string
  height?: string
  color?: string
  backgroundColor?: string
  fontSize?: string
  fontWeight?: string
  border?: string
  borderRadius?: string
  padding?: string
  margin?: string
  marginBottom?: string
  [key: string]: unknown
}

// 数据源配置
export interface DataSource {
  type: 'static' | 'api'
  data: unknown
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params: Record<string, unknown>
  refreshInterval: number // 刷新间隔，单位秒，0表示不自动刷新
}

// 组件配置
export interface Component {
  id: string
  type: string
  props: Record<string, unknown>
  style: ComponentStyle
  dataSource: DataSource
  children: Component[]
}

// 布局类型
export type LayoutType = 'flex' | 'grid' | 'free'

// 布局配置
export interface LayoutConfig {
  type: LayoutType
  props: Record<string, unknown>
}

// 页面配置
export interface PageConfig {
  version: string
  title: string
  layout: LayoutConfig
  components: Component[]
}

// 组件定义
export interface ComponentDefinition {
  type: string
  name: string
  icon?: string
  defaultProps: Record<string, unknown>
  propConfig: PropConfig[]
}

// 属性配置
export interface PropConfig {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'datePicker'
  defaultValue?: unknown
  options?: Array<{ label: string; value: unknown }> // 用于select类型
}
