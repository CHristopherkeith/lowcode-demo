<template>
  <div class="preview-container">
    <div class="preview-header">
      <h2>{{ pageConfig.title }}</h2>
      <a-button type="primary" @click="backToEditor">返回编辑器</a-button>
    </div>
    <div class="preview-content">
      <template v-if="pageConfig.components.length > 0">
        <div
          v-for="component in pageConfig.components"
          :key="component.id"
          class="component-container"
          :style="{
            position: 'absolute',
            left: component.style.left,
            top: component.style.top,
            zIndex: component.style.zIndex,
          }"
        >
          <div class="component-wrapper">
            <component :is="resolveComponent(component.type)" v-bind="component.props" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="empty-tip">
          <a-empty description="暂无内容" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { PageConfig } from '@/types/lowcode'
import { Input, Select, DatePicker, Radio, Checkbox, Button, Form, Table } from 'ant-design-vue'

const router = useRouter()

// 默认页面配置
const defaultPageConfig: PageConfig = {
  version: '1.0',
  title: '低代码页面',
  layout: {
    type: 'free',
    props: {},
  },
  components: [],
}

const pageConfig = ref<PageConfig>(defaultPageConfig)

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

// 加载页面配置
onMounted(() => {
  const configJson = localStorage.getItem('lowcodePageConfig')
  if (configJson) {
    try {
      pageConfig.value = JSON.parse(configJson)
    } catch (error: unknown) {
      console.error('解析页面配置失败:', error)
      message.error('页面配置解析失败')
    }
  } else {
    message.warning('没有找到页面配置')
  }
})

// 返回编辑器
const backToEditor = () => {
  router.push('/')
}
</script>

<style scoped>
.preview-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.preview-content {
  flex: 1;
  position: relative;
  padding: 16px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  overflow: auto;
}

.component-container {
  position: absolute;
}

.component-wrapper {
  padding: 2px;
  background-color: #fff;
  min-width: 100px;
  min-height: 30px;
  border: 1px solid transparent;
}

.empty-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
