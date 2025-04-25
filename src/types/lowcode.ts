// 组件通用样式
export interface ComponentStyle {
  position?: string
  left?: string
  top?: string
  width?: string
  height?: string
  zIndex?: number
  color?: string
  backgroundColor?: string
  fontSize?: string
  fontWeight?: string
  border?: string
  borderRadius?: string
  padding?: string
  margin?: string
  [key: string]: any
}

// 数据源配置
export interface DataSource {
  type: 'static' | 'api'
  data: any
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params: Record<string, any>
  refreshInterval: number // 刷新间隔，单位秒，0表示不自动刷新
}

// 组件配置
export interface Component {
  id: string
  type: string
  props: Record<string, any>
  style: ComponentStyle
  dataSource: DataSource
  children: Component[]
}

// 布局类型
export type LayoutType = 'flex' | 'grid' | 'free'

// 布局配置
export interface LayoutConfig {
  type: LayoutType
  props: Record<string, any>
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
  defaultProps: Record<string, any>
  propConfig: PropConfig[]
}

// 属性配置
export interface PropConfig {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'datePicker'
  defaultValue?: any
  options?: Array<{ label: string; value: any }> // 用于select类型
}
