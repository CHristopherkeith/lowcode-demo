<template>
  <div class="property-editor">
    <a-tabs v-model:activeKey="activeTabKey">
      <a-tab-pane key="basic" tab="基本属性">
        <a-form layout="vertical">
          <a-form-item label="ID">
            <a-input :value="component.id" disabled />
          </a-form-item>

          <a-collapse v-model:activeKey="basicActiveKeys">
            <a-collapse-panel key="style" header="样式设置">
              <a-form-item label="宽度">
                <a-input-number
                  v-model:value="styleForm.width"
                  :min="0"
                  :max="2000"
                  :addonAfter="styleForm.widthUnit"
                  style="width: 150px"
                  @change="updateStyle('width', `${styleForm.width}${styleForm.widthUnit}`)"
                />
                <a-select
                  v-model:value="styleForm.widthUnit"
                  style="width: 70px; margin-left: 8px"
                  @change="updateStyle('width', `${styleForm.width}${styleForm.widthUnit}`)"
                >
                  <a-select-option value="px">px</a-select-option>
                  <a-select-option value="%">%</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="高度">
                <a-input-number
                  v-model:value="styleForm.height"
                  :min="0"
                  :max="2000"
                  :addonAfter="styleForm.heightUnit"
                  style="width: 150px"
                  @change="updateStyle('height', `${styleForm.height}${styleForm.heightUnit}`)"
                />
                <a-select
                  v-model:value="styleForm.heightUnit"
                  style="width: 70px; margin-left: 8px"
                  @change="updateStyle('height', `${styleForm.height}${styleForm.heightUnit}`)"
                >
                  <a-select-option value="px">px</a-select-option>
                  <a-select-option value="%">%</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="背景颜色">
                <a-input
                  v-model:value="styleForm.backgroundColor"
                  @change="updateStyle('backgroundColor', styleForm.backgroundColor)"
                >
                  <template #prefix>
                    <div
                      class="property-editor__color-block"
                      :style="{ backgroundColor: styleForm.backgroundColor || '#ffffff' }"
                    ></div>
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item label="边框">
                <a-input
                  v-model:value="styleForm.border"
                  placeholder="1px solid #ddd"
                  @change="updateStyle('border', styleForm.border)"
                />
              </a-form-item>

              <a-form-item label="边框圆角">
                <a-input-number
                  v-model:value="styleForm.borderRadius"
                  :min="0"
                  :max="50"
                  :addonAfter="'px'"
                  style="width: 150px"
                  @change="updateStyle('borderRadius', `${styleForm.borderRadius}px`)"
                />
              </a-form-item>

              <a-form-item label="下边距">
                <a-input-number
                  v-model:value="styleForm.marginBottom"
                  :min="0"
                  :max="100"
                  :addonAfter="'px'"
                  style="width: 150px"
                  @change="updateStyle('marginBottom', `${styleForm.marginBottom}px`)"
                />
              </a-form-item>
            </a-collapse-panel>
          </a-collapse>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="props" tab="组件属性">
        <component-property-form :component="component" @update="handleUpdateProps" />
      </a-tab-pane>

      <a-tab-pane key="data" tab="数据绑定">
        <a-form layout="vertical">
          <a-form-item label="数据源类型">
            <a-radio-group v-model:value="dataForm.type">
              <a-radio value="static">静态数据</a-radio>
              <a-radio value="api">API数据</a-radio>
            </a-radio-group>
          </a-form-item>

          <template v-if="dataForm.type === 'api'">
            <a-form-item label="API地址">
              <a-input
                v-model:value="dataForm.url"
                placeholder="https://api.example.com/data"
                @change="updateDataSource('url', dataForm.url)"
              />
            </a-form-item>

            <a-form-item label="请求方法">
              <a-select
                v-model:value="dataForm.method"
                style="width: 100%"
                @change="updateDataSource('method', dataForm.method)"
              >
                <a-select-option value="GET">GET</a-select-option>
                <a-select-option value="POST">POST</a-select-option>
                <a-select-option value="PUT">PUT</a-select-option>
                <a-select-option value="DELETE">DELETE</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="刷新间隔(秒)">
              <a-input-number
                v-model:value="dataForm.refreshInterval"
                :min="0"
                style="width: 100%"
                @change="updateDataSource('refreshInterval', dataForm.refreshInterval)"
              />
              <span class="property-editor__form-help">0表示不自动刷新</span>
            </a-form-item>
          </template>

          <template v-else>
            <a-form-item label="静态数据">
              <a-textarea
                v-model:value="staticDataJson"
                :rows="6"
                placeholder="输入JSON格式的静态数据"
                @blur="handleStaticDataUpdate"
              />
            </a-form-item>
          </template>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { Component } from '@/types/lowcode'
import ComponentPropertyForm from './component-property-form.vue'

const props = defineProps<{
  component: Component
}>()

const emit = defineEmits<{
  (e: 'update', component: Component): void
}>()

const activeTabKey = ref('basic')
const basicActiveKeys = ref(['style'])

// 解析样式数据
const parseStyleValue = (
  value: string | undefined,
  unit: string,
): { value: number; unit: string } => {
  if (!value) return { value: 0, unit }

  if (value.endsWith('px')) {
    return { value: parseFloat(value), unit: 'px' }
  }

  if (value.endsWith('%')) {
    return { value: parseFloat(value), unit: '%' }
  }

  return { value: parseFloat(value), unit }
}

// 样式表单
const styleForm = reactive({
  width: 0,
  widthUnit: 'px',
  height: 0,
  heightUnit: 'px',
  backgroundColor: '',
  border: '',
  borderRadius: 0,
  marginBottom: 0,
})

// 数据表单
const dataForm = reactive({
  type: 'static',
  url: '',
  method: 'GET',
  refreshInterval: 0,
})

// 静态数据JSON
const staticDataJson = ref('')

// 初始化表单数据
watch(
  () => props.component,
  (newVal) => {
    if (newVal) {
      // 解析宽度
      const widthData = parseStyleValue(newVal.style.width, 'px')
      styleForm.width = widthData.value
      styleForm.widthUnit = widthData.unit

      // 解析高度
      const heightData = parseStyleValue(newVal.style.height, 'px')
      styleForm.height = heightData.value
      styleForm.heightUnit = heightData.unit

      // 其他样式
      styleForm.backgroundColor = newVal.style.backgroundColor || ''
      styleForm.border = newVal.style.border || ''
      styleForm.borderRadius = parseFloat(newVal.style.borderRadius || '0')
      styleForm.marginBottom = parseFloat(newVal.style.marginBottom || '10')

      // 数据源
      dataForm.type = newVal.dataSource?.type || 'static'
      dataForm.url = newVal.dataSource?.url || ''
      dataForm.method = newVal.dataSource?.method || 'GET'
      dataForm.refreshInterval = newVal.dataSource?.refreshInterval || 0

      // 静态数据
      if (newVal.dataSource?.data) {
        try {
          staticDataJson.value = JSON.stringify(newVal.dataSource.data, null, 2)
        } catch {
          staticDataJson.value = ''
        }
      } else {
        staticDataJson.value = ''
      }
    }
  },
  { immediate: true, deep: true },
)

// 更新样式
const updateStyle = (key: string, value: string | number) => {
  const updatedComponent = { ...props.component }
  updatedComponent.style = { ...updatedComponent.style, [key]: value }
  emit('update', updatedComponent)
}

// 更新组件属性
const handleUpdateProps = (newProps: Record<string, unknown>) => {
  const updatedComponent = { ...props.component }
  updatedComponent.props = newProps
  emit('update', updatedComponent)
}

// 更新数据源
const updateDataSource = (key: string, value: unknown) => {
  const updatedComponent = { ...props.component }
  if (!updatedComponent.dataSource) {
    updatedComponent.dataSource = {
      type: 'static',
      data: null,
      url: '',
      method: 'GET',
      params: {},
      refreshInterval: 0,
    }
  }

  updatedComponent.dataSource = {
    ...updatedComponent.dataSource,
    [key]: value,
  }

  emit('update', updatedComponent)
}

// 处理静态数据更新
const handleStaticDataUpdate = () => {
  try {
    const data = staticDataJson.value ? JSON.parse(staticDataJson.value) : null
    const updatedComponent = { ...props.component }
    if (!updatedComponent.dataSource) {
      updatedComponent.dataSource = {
        type: 'static',
        data: null,
        url: '',
        method: 'GET',
        params: {},
        refreshInterval: 0,
      }
    }

    updatedComponent.dataSource = {
      ...updatedComponent.dataSource,
      data,
    }

    emit('update', updatedComponent)
  } catch (error) {
    console.error('JSON解析错误', error)
  }
}
</script>

<style lang="scss" scoped>
.property-editor {
  width: 100%;

  &__color-block {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 6px;
    border: 1px solid #ddd;
  }

  &__form-help {
    color: #888;
    font-size: 12px;
  }
}
</style>
