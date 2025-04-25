<template>
  <div
    :class="['component-wrapper', { selected: isSelected }]"
    :style="wrapperStyles"
    @click.stop="handleClick"
  >
    <component :is="resolveComponent(config.type)" v-bind="componentProps" />
    <div v-if="isEditor && isSelected" class="component-actions">
      <a-button type="text" size="small" danger @click.stop="handleDelete"> 删除 </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from '@/types/lowcode'
import { Input, Select, DatePicker, Radio, Checkbox, Button, Form, Table } from 'ant-design-vue'
import { useComponentStore } from '@/stores/component'

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
  const componentMap: Record<string, any> = {
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

// 组件容器样式
const wrapperStyles = computed(() => ({
  ...props.config.style,
  cursor: props.isEditor ? 'move' : 'auto',
}))
</script>

<style scoped>
.component-wrapper {
  position: relative;
  border: 1px solid transparent;
}

.component-wrapper.selected {
  border: 1px dashed #1890ff;
}

.component-actions {
  position: absolute;
  top: -30px;
  right: 0;
  background-color: #fff;
  border: 1px solid #eee;
  display: flex;
  z-index: 100;
}
</style>
