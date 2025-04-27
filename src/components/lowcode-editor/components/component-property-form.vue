<template>
  <div class="component-property-form">
    <template v-if="propConfigs.length > 0">
      <a-form layout="vertical">
        <template v-for="(config, index) in propConfigs" :key="index">
          <!-- 字符串类型 -->
          <a-form-item :label="config.label" v-if="config.type === 'string'">
            <a-input v-model:value="propValues[config.name]" @change="handlePropChange" />
          </a-form-item>

          <!-- 数字类型 -->
          <a-form-item :label="config.label" v-else-if="config.type === 'number'">
            <a-input-number
              v-model:value="propValues[config.name]"
              style="width: 100%"
              @change="handlePropChange"
            />
          </a-form-item>

          <!-- 布尔类型 -->
          <a-form-item :label="config.label" v-else-if="config.type === 'boolean'">
            <a-switch v-model:checked="propValues[config.name]" @change="handlePropChange" />
          </a-form-item>

          <!-- 选择类型 -->
          <a-form-item
            :label="config.label"
            v-else-if="config.type === 'select' && config.name !== 'columns'"
          >
            <a-select
              v-model:value="propValues[config.name]"
              style="width: 100%"
              @change="handlePropChange"
            >
              <a-select-option
                v-for="(option, optIndex) in config.options"
                :key="optIndex"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <!-- 表格列配置 -->
          <a-form-item
            :label="config.label"
            v-else-if="config.type === 'select' && config.name === 'columns'"
          >
            <table-columns-editor
              v-model:value="propValues[config.name]"
              @update:value="handlePropChange"
            />
          </a-form-item>

          <!-- 颜色类型 -->
          <a-form-item :label="config.label" v-else-if="config.type === 'color'">
            <a-input v-model:value="propValues[config.name]" @change="handlePropChange">
              <template #prefix>
                <div
                  class="component-property-form__color-block"
                  :style="{ backgroundColor: String(propValues[config.name] || '#ffffff') }"
                ></div>
              </template>
            </a-input>
          </a-form-item>
        </template>
      </a-form>
    </template>
    <template v-else>
      <div class="component-property-form__empty-tip">该组件没有可配置的属性</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { Component, PropConfig } from '@/types/lowcode.d'
import {
  basicComponents,
  advancedComponents,
  containerComponents,
} from '../config/component-config'
import TableColumnsEditor from './table-columns-editor.vue'

const props = defineProps<{
  component: Component
}>()

const emit = defineEmits<{
  (e: 'update', newProps: Record<string, unknown>): void
}>()

// 组件属性值
const propValues = reactive<Record<string, unknown>>({})

// 获取组件的属性配置
const propConfigs = computed<PropConfig[]>(() => {
  const allComponents = [...containerComponents, ...basicComponents, ...advancedComponents]
  const componentConfig = allComponents.find((item) => item.type === props.component.type)
  return componentConfig?.propConfig || []
})

// 初始化属性值
watch(
  () => props.component,
  (newVal) => {
    if (newVal && newVal.props) {
      // 重置属性值
      Object.keys(propValues).forEach((key) => {
        delete propValues[key]
      })

      // 设置新属性值
      Object.keys(newVal.props).forEach((key) => {
        propValues[key] = newVal.props[key]
      })

      // 特殊处理表单的labelCol属性，转换为labelColType和labelColValue
      if (newVal.type === 'form' && newVal.props.labelCol) {
        const labelCol = newVal.props.labelCol as {
          span?: number
          style?: { width?: string }
        }

        // 处理span方式
        if (labelCol.span !== undefined) {
          propValues.labelColType = 'span'
          propValues.labelColValue = labelCol.span
        }
        // 处理px方式
        else if (labelCol.style && labelCol.style.width) {
          const widthStr = labelCol.style.width
          const pxMatch = widthStr.match(/(\d+)px/)
          if (pxMatch) {
            propValues.labelColType = 'px'
            propValues.labelColValue = parseInt(pxMatch[1])
          }
        }
      }
    }
  },
  { immediate: true, deep: true },
)

// 处理属性变更
const handlePropChange = () => {
  // 特殊处理表单的labelCol属性
  if (props.component.type === 'form') {
    // 确保使用默认值
    const type = propValues.labelColType !== undefined ? propValues.labelColType : 'span'
    const value = propValues.labelColValue !== undefined ? propValues.labelColValue : 6

    if (type === 'span') {
      propValues.labelCol = { span: value }
    } else if (type === 'px') {
      propValues.labelCol = { style: { width: `${value}px` } }
    }
  }

  // 特殊处理表格列更改，同步更新数据
  if (
    props.component.type === 'table' &&
    props.component.dataSource &&
    props.component.dataSource.data
  ) {
    // 检查是否有列变更
    const oldColumns = props.component.props.columns || []
    const newColumns = propValues.columns || []

    if (JSON.stringify(oldColumns) !== JSON.stringify(newColumns)) {
      // 列配置已更改，同步更新数据源以匹配新的列
      const dataSource = props.component.dataSource.data

      if (Array.isArray(dataSource) && dataSource.length > 0) {
        // 对每行数据，添加缺失的列
        dataSource.forEach((row: Record<string, unknown>) => {
          newColumns.forEach((col: { dataIndex: string; title: string }) => {
            if (col.dataIndex !== 'action' && !(col.dataIndex in row)) {
              // 为新列添加默认数据
              row[col.dataIndex] = `${col.title}数据`
            }
          })
        })
      }
    }
  }

  // 特殊处理表单组件 - 提供默认数据
  if (props.component.type === 'form') {
    // 在控制台打印表单的所有字段和相关信息
    console.log('表单组件属性更新:', propValues)

    // 收集表单字段信息
    const fieldInfo: Record<string, { type: string; defaultValue: any }> = {}
    const collectFields = (components: Component[]) => {
      components.forEach((comp) => {
        if (comp.fieldName) {
          fieldInfo[comp.fieldName] = {
            type: comp.type,
            defaultValue: comp.props.defaultValue || comp.props.value || null,
          }
        }
        if (comp.children?.length) {
          collectFields(comp.children)
        }
      })
    }

    if (props.component.children?.length) {
      collectFields(props.component.children)
      console.log('表单字段信息:', fieldInfo)

      // 创建默认的表单数据对象 - 这个可以在控制台中使用
      const defaultData = Object.entries(fieldInfo).reduce(
        (acc, [field, info]) => {
          acc[field] =
            info.defaultValue ||
            (info.type === 'checkbox'
              ? []
              : info.type === 'input'
                ? '默认文本'
                : info.type === 'datePicker'
                  ? '2023-01-01'
                  : null)
          return acc
        },
        {} as Record<string, any>,
      )

      console.log('表单默认数据JSON:')
      console.log(JSON.stringify(defaultData, null, 2))

      // 如果表单组件没有数据源中的静态数据，可以打印建议使用这个数据
      if (!props.component.dataSource?.data) {
        console.log(
          '提示: 可以在表单的"数据绑定"标签中的"静态数据"文本框中粘贴上面的JSON，为表单组件提供默认数据',
        )
      }
    }
  }

  emit('update', { ...propValues })
}
</script>

<style lang="scss" scoped>
.component-property-form {
  width: 100%;

  &__empty-tip {
    color: #aaa;
    text-align: center;
    padding: 20px 0;
  }

  &__color-block {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 6px;
    border: 1px solid #ddd;
  }
}
</style>
