<template>
  <div class="lowcode-editor">
    <div class="editor-header">
      <a-space>
        <a-button type="primary" @click="handleSave">保存</a-button>
        <a-button @click="handlePreview">预览</a-button>
        <a-button danger @click="handleClear">清空</a-button>
      </a-space>
    </div>
    <div class="editor-content">
      <div class="material-panel">
        <h3>组件物料</h3>
        <a-collapse v-model:activeKey="activeKeys">
          <a-collapse-panel key="1" header="基础表单组件">
            <div
              v-for="component in basicComponents"
              :key="component.type"
              class="component-item"
              draggable="true"
              @dragstart="onDragStart($event, component)"
            >
              {{ component.name }}
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="2" header="高级组件">
            <div
              v-for="component in advancedComponents"
              :key="component.type"
              class="component-item"
              draggable="true"
              @dragstart="onDragStart($event, component)"
            >
              {{ component.name }}
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>
      <div class="render-panel" @dragover.prevent @drop="onDrop">
        <div v-if="pageConfig.components.length === 0" class="empty-tip">拖拽组件到此区域</div>
        <template v-else>
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
            @click.stop="handleSelectComponent(component)"
          >
            <div :class="['component-wrapper', { selected: component.id === selectedComponentId }]">
              <component :is="resolveComponent(component.type)" v-bind="component.props" />
              <div v-if="component.id === selectedComponentId" class="component-actions">
                <a-button
                  type="text"
                  size="small"
                  danger
                  @click.stop="handleDeleteComponent(component.id)"
                >
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="property-panel">
        <h3>属性设置</h3>
        <div v-if="!selectedComponent" class="empty-tip">请选择一个组件进行配置</div>
        <property-editor v-else :component="selectedComponent" @update="handleUpdateComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { v4 as uuidv4 } from 'uuid'
import PropertyEditor from './components/PropertyEditor.vue'
import { basicComponents, advancedComponents } from './config/componentConfig'
import type { PageConfig, Component, ComponentDefinition } from '@/types/lowcode'
import { Input, Select, DatePicker, Radio, Checkbox, Button, Form, Table } from 'ant-design-vue'
import { useComponentStore } from '@/stores/component'

const router = useRouter()
const activeKeys = ref(['1', '2'])
const componentStore = useComponentStore()
const selectedComponentId = computed(() => componentStore.selectedComponentId)
const selectedComponent = computed(() => {
  if (!selectedComponentId.value) return null
  return (
    pageConfig.components.find((item: Component) => item.id === selectedComponentId.value) || null
  )
})

// 页面配置
const pageConfig = reactive<PageConfig>({
  version: '1.0',
  title: '低代码页面',
  layout: {
    type: 'free',
    props: {},
  },
  components: [],
})

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

// 拖拽开始
const onDragStart = (event: DragEvent, component: ComponentDefinition) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('componentType', component.type)
  }
}

// 拖拽放置
const onDrop = (event: DragEvent) => {
  const componentType = event.dataTransfer?.getData('componentType')
  if (!componentType) return

  // 计算放置位置
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 创建新组件
  const allComponents = [...basicComponents, ...advancedComponents]
  const componentConfig = allComponents.find((item) => item.type === componentType)

  if (componentConfig) {
    const newComponent: Component = {
      id: uuidv4(),
      type: componentType,
      props: { ...componentConfig.defaultProps },
      style: {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: '200px',
        height: 'auto',
        zIndex: pageConfig.components.length + 1,
      },
      dataSource: {
        type: 'static',
        data: null,
        url: '',
        method: 'GET',
        params: {},
        refreshInterval: 0,
      },
      children: [],
    }

    pageConfig.components.push(newComponent)
    componentStore.setSelectedComponentId(newComponent.id)
  }
}

// 选择组件
const handleSelectComponent = (component: Component) => {
  componentStore.setSelectedComponentId(component.id)
}

// 删除组件
const handleDeleteComponent = (componentId: string) => {
  const index = pageConfig.components.findIndex((item: Component) => item.id === componentId)
  if (index !== -1) {
    pageConfig.components.splice(index, 1)
    componentStore.setSelectedComponentId(null)
  }
}

// 更新组件
const handleUpdateComponent = (updatedComponent: Component) => {
  const index = pageConfig.components.findIndex(
    (item: Component) => item.id === updatedComponent.id,
  )
  if (index !== -1) {
    pageConfig.components[index] = updatedComponent
  }
}

// 保存配置
const handleSave = () => {
  localStorage.setItem('lowcodePageConfig', JSON.stringify(pageConfig))
  message.success('保存成功')
}

// 预览
const handlePreview = () => {
  localStorage.setItem('lowcodePageConfig', JSON.stringify(pageConfig))
  router.push('/preview')
}

// 清空画布
const handleClear = () => {
  pageConfig.components = []
  componentStore.setSelectedComponentId(null)
  message.success('已清空')
}
</script>

<style scoped>
.lowcode-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-header {
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 50px);
}

.material-panel {
  width: 250px;
  padding: 16px;
  border-right: 1px solid #eee;
  overflow-y: auto;
  flex-shrink: 0;
  background-color: #fff;
}

.render-panel {
  flex: 1;
  position: relative;
  background-color: #f5f5f5;
  overflow: auto;
  min-height: 100%;
}

.property-panel {
  width: 300px;
  padding: 16px;
  border-left: 1px solid #eee;
  overflow-y: auto;
  flex-shrink: 0;
  background-color: #fff;
}

.component-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px dashed #ccc;
  cursor: move;
  background-color: #fff;
  border-radius: 4px;
}

.component-item:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.component-container {
  position: absolute;
  cursor: move;
}

.component-wrapper {
  padding: 2px;
  background-color: #fff;
  border: 1px solid transparent;
  min-width: 100px;
  min-height: 30px;
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

.empty-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #aaa;
  font-size: 14px;
}
</style>
