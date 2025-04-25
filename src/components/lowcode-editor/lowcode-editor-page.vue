<template>
  <div class="lowcode-editor">
    <div class="lowcode-editor__header">
      <a-space>
        <a-button type="primary" @click="handleSave">保存</a-button>
        <a-button @click="handlePreview">预览</a-button>
        <a-button danger @click="handleClear">清空</a-button>
      </a-space>
    </div>
    <div class="lowcode-editor__content">
      <div class="lowcode-editor__material-panel">
        <component-panel />
      </div>
      <div class="lowcode-editor__render-panel" @dragover.prevent @drop="onDrop">
        <div v-if="pageConfig.components.length === 0" class="lowcode-editor__empty-tip">
          拖拽组件到此区域
        </div>
        <template v-else>
          <div
            v-for="component in pageConfig.components"
            :key="component.id"
            class="lowcode-editor__component-container"
            :style="{
              position: 'absolute',
              left: component.style.left,
              top: component.style.top,
              zIndex: component.style.zIndex,
            }"
            @click.stop="handleSelectComponent(component)"
          >
            <div
              :class="[
                'lowcode-editor__component-wrapper',
                {
                  'lowcode-editor__component-wrapper--selected':
                    component.id === selectedComponentId,
                },
              ]"
            >
              <component :is="resolveComponent(component.type)" v-bind="component.props" />
              <div
                v-if="component.id === selectedComponentId"
                class="lowcode-editor__component-actions"
              >
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
      <div class="lowcode-editor__property-panel">
        <h3>属性设置</h3>
        <div v-if="!selectedComponent" class="lowcode-editor__empty-tip">
          请选择一个组件进行配置
        </div>
        <property-editor v-else :component="selectedComponent" @update="handleUpdateComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { v4 as uuidv4 } from 'uuid'
import PropertyEditor from './components/property-editor.vue'
import ComponentPanel from './components/ComponentPanel.vue'
import type { PageConfig, Component } from '@/types/lowcode.d'
import { Input, Select, DatePicker, Radio, Checkbox, Button, Form, Table } from 'ant-design-vue'
import { useComponentStore } from '@/stores/component'
import { basicComponents, advancedComponents } from './config/component-config'

const router = useRouter()
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

// 拖拽放置
const onDrop = (event: DragEvent | string) => {
  let componentType = ''

  if (typeof event === 'string') {
    componentType = event
  } else {
    componentType = event.dataTransfer?.getData('componentType') || ''
    if (!componentType) return

    // 阻止默认行为
    event.preventDefault()
  }

  // 创建新组件
  const allComponents = [...basicComponents, ...advancedComponents]
  const componentConfig = allComponents.find((item) => item.type === componentType)

  if (componentConfig) {
    // 计算放置位置，只有在拖放时才获取位置
    let x = 100
    let y = 100

    if (typeof event !== 'string') {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      x = event.clientX - rect.left
      y = event.clientY - rect.top
    }

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
  message.success('配置已保存')
}

// 预览
const handlePreview = () => {
  localStorage.setItem('lowcodePageConfig', JSON.stringify(pageConfig))
  router.push('/preview')
}

// 清空
const handleClear = () => {
  pageConfig.components = []
  componentStore.setSelectedComponentId(null)
  message.success('已清空')
}
</script>

<style lang="scss" scoped>
.lowcode-editor {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__header {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
  }

  &__content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  &__material-panel {
    width: 250px;
    padding: 16px;
    border-right: 1px solid #eee;
    overflow-y: auto;
  }

  &__render-panel {
    flex: 1;
    position: relative;
    background-color: #f5f5f5;
    overflow: auto;
  }

  &__property-panel {
    width: 300px;
    padding: 16px;
    border-left: 1px solid #eee;
    overflow-y: auto;
  }

  &__component-item {
    padding: 8px 12px;
    margin-bottom: 8px;
    border: 1px solid #eee;
    background-color: #fff;
    cursor: pointer;
    user-select: none;
  }

  &__component-container {
    position: absolute;
  }

  &__component-wrapper {
    padding: 2px;
    background-color: #fff;
    min-width: 100px;
    min-height: 30px;
    border: 1px solid transparent;

    &--selected {
      border: 1px solid #1890ff;
    }
  }

  &__component-actions {
    position: absolute;
    right: 0;
    top: -30px;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  &__empty-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #999;
  }
}
</style>
