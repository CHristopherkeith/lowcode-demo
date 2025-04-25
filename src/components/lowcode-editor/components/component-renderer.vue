<template>
  <div
    :class="['component-renderer', { 'component-renderer--selected': isSelected }]"
    :style="wrapperStylesObj"
    @click.stop="handleClick"
  >
    <component :is="resolveComponent(config.type)" v-bind="componentProps" />
    <div v-if="isEditor && isSelected" class="component-renderer__actions">
      <a-button type="text" size="small" danger @click.stop="handleDelete"> 删除 </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from '@/types/lowcode.d'
import { Input, Select, DatePicker, Radio, Checkbox, Button, Form, Table } from 'ant-design-vue'
import { useComponentStore } from '@/stores/component'
import type { CSSProperties } from 'vue'

const props = defineProps<{
  config: Component
  isEditor?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', component: Component): void
  (e: 'delete', componentId: string): void
}>()

const componentStore = useComponentStore()
const isSelected = computed(() => componentStore.selectedComponentId === props.config.id)

// 组件点击事件
const handleClick = () => {
  if (props.isEditor) {
    emit('select', props.config)
    componentStore.setSelectedComponentId(props.config.id)
  }
}

// 删除组件
const handleDelete = () => {
  emit('delete', props.config.id)
}

// 解析组件类型为对应的组件
const resolveComponent = (type: string) => {
  const componentMap: Record<string, unknown> = {
    input: Input,
    select: Select,
    datePicker: DatePicker,
    radio: Radio.Group,
    checkbox: Checkbox.Group,
    button: Button,
    form: Form,
    table: Table,
    chart: 'div', // 图表组件需要特殊处理
  }

  return componentMap[type] || 'div'
}

// 生成组件所需的props
const componentProps = computed(() => {
  const { type, props: customProps } = props.config
  const result = { ...customProps }

  // 针对不同组件类型做特殊处理
  if (type === 'button' && result.text) {
    result.children = result.text
    delete result.text
  }

  return result
})

// 有效的 CSS position 类型
type CSSPositionType = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'

// 组件容器样式 - 转换为 CSSProperties 类型
const wrapperStylesObj = computed<CSSProperties>(() => {
  const baseStyle: CSSProperties = {
    cursor: props.isEditor ? 'move' : 'auto',
  }

  // 添加其他样式属性
  if (props.config.style.position) {
    baseStyle.position = props.config.style.position as CSSPositionType
  }
  if (props.config.style.left) baseStyle.left = props.config.style.left
  if (props.config.style.top) baseStyle.top = props.config.style.top
  if (props.config.style.width) baseStyle.width = props.config.style.width
  if (props.config.style.height) baseStyle.height = props.config.style.height
  if (props.config.style.zIndex) baseStyle.zIndex = props.config.style.zIndex
  if (props.config.style.backgroundColor)
    baseStyle.backgroundColor = props.config.style.backgroundColor
  if (props.config.style.border) baseStyle.border = props.config.style.border
  if (props.config.style.borderRadius) baseStyle.borderRadius = props.config.style.borderRadius

  return baseStyle
})
</script>

<style lang="scss" scoped>
.component-renderer {
  position: relative;
  border: 1px solid transparent;

  &--selected {
    border: 1px dashed #1890ff;
  }

  &__actions {
    position: absolute;
    top: -30px;
    right: 0;
    background-color: #fff;
    border: 1px solid #eee;
    display: flex;
    z-index: 100;
  }
}
</style>
