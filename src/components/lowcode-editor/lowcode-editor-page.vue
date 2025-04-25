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
      <div class="lowcode-editor__render-panel">
        <VueDraggable
          v-model="pageConfig.components"
          group="components"
          :sort="true"
          item-key="id"
          tag="div"
          class="lowcode-editor__droppable-area"
          @add="handleComponentAdded"
        >
          <!-- <template #item="{ element: component }"> -->
          <div
            v-for="component in pageConfig.components"
            :key="component.id"
            class="lowcode-editor__component-container"
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
          <!-- </template> -->
          <template #header>
            <div v-if="pageConfig.components.length === 0" class="lowcode-editor__empty-tip">
              拖拽组件到此区域
            </div>
          </template>
        </VueDraggable>
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
import { VueDraggable } from 'vue-draggable-plus'
import PropertyEditor from './components/property-editor.vue'
import ComponentPanel from './components/component-panel.vue'
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

// 处理新组件添加
const handleComponentAdded = (event: { newIndex: number; item: HTMLElement }) => {
  // 获取新添加的组件索引
  const newIndex = event.newIndex
  // 获取新添加的组件
  const component = pageConfig.components[newIndex]

  // 这里处理新拖入的组件，添加必要的属性
  if (!component.id) {
    // 如果是从组件面板拖入的新组件，添加ID和样式属性
    const allComponents = [...basicComponents, ...advancedComponents]
    const componentConfig = allComponents.find((item) => item.type === component.type)

    if (componentConfig) {
      // 使用新对象替换原组件
      const newComponent: Component = {
        id: uuidv4(),
        type: component.type,
        props: { ...componentConfig.defaultProps },
        style: {
          width: '100%',
          marginBottom: '10px',
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

      // 替换掉原始拖入的组件
      pageConfig.components.splice(newIndex, 1, newComponent)
      componentStore.setSelectedComponentId(newComponent.id)
    }
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
    background-color: #f5f5f5;
    overflow: auto;
  }

  &__droppable-area {
    min-height: 100%;
    width: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  &__property-panel {
    width: 300px;
    padding: 16px;
    border-left: 1px solid #eee;
    overflow-y: auto;
  }

  &__empty-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #999;
    font-size: 16px;
  }

  &__component-container {
    margin-bottom: 12px;
    min-height: 40px;
  }

  &__component-wrapper {
    border: 1px solid transparent;
    padding: 8px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

    &--selected {
      border: 1px dashed #1890ff;
      background-color: rgba(24, 144, 255, 0.05);
    }
  }

  &__component-actions {
    position: absolute;
    top: -30px;
    right: 0;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 2px;
    display: flex;
    gap: 4px;
  }
}
</style>
