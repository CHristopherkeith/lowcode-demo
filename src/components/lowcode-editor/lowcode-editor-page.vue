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
          :group="{ name: 'components', put: validateMainDrop }"
          :sort="true"
          item-key="id"
          tag="div"
          class="lowcode-editor__droppable-area"
          @add="handleComponentAdded"
        >
          <div
            v-for="component in pageConfig.components"
            :key="component.id"
            class="lowcode-editor__component-container"
          >
            <component-renderer
              :config="component"
              :is-editor="true"
              @select="handleSelectComponent"
              @delete="handleDeleteComponent"
            />
          </div>
          <template #header>
            <div v-if="pageConfig.components.length === 0" class="lowcode-editor__empty-tip">
              拖拽组件到此区域（栅格列只能放在栅格行中，基础表单组件只能放在表单中）
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
import ComponentRenderer from './components/component-renderer.vue'
import type { PageConfig, Component } from '@/types/lowcode.d'
import { Row, Col } from 'ant-design-vue'
import { useComponentStore } from '@/stores/component'
import { basicComponents, advancedComponents, containerComponents } from './config/component-config'

const router = useRouter()
const componentStore = useComponentStore()
const selectedComponentId = computed(() => componentStore.selectedComponentId)
const selectedComponent = computed(() => {
  if (!selectedComponentId.value) return null

  // 递归搜索选中的组件
  const findComponentById = (components: Component[], id: string): Component | null => {
    for (const component of components) {
      if (component.id === id) {
        return component
      }

      if (component.children && component.children.length > 0) {
        const found = findComponentById(component.children, id)
        if (found) {
          return found
        }
      }
    }

    return null
  }

  return findComponentById(pageConfig.components, selectedComponentId.value)
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

// 验证函数：不允许将Col直接拖到顶层，基础表单组件只能放在表单组件内
const validateMainDrop = (to: unknown, from: unknown, dragEl: HTMLElement, event: unknown) => {
  // 获取被拖拽元素的组件类型
  const draggedType = dragEl.getAttribute('data-type')

  // 基础表单组件类型列表
  const basicFormTypes = basicComponents.map((comp) => comp.type)

  // 不允许col类型组件直接拖到顶层，col只能作为row的子组件
  // 不允许基础表单组件直接拖到顶层，基础表单组件只能放在表单组件内
  return draggedType !== 'col' && !basicFormTypes.includes(draggedType || '')
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
    const allComponents = [...containerComponents, ...basicComponents, ...advancedComponents]
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

      // 对于行容器，默认添加两个列
      if (component.type === 'row') {
        // 获取列组件配置
        const colConfig = containerComponents.find((item) => item.type === 'col')
        if (colConfig) {
          for (let i = 0; i < 2; i++) {
            const colComponent: Component = {
              id: uuidv4(),
              type: 'col',
              props: {
                ...colConfig.defaultProps,
                span: 12, // 两列各占50%
              },
              style: {},
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
            newComponent.children.push(colComponent)
          }
        }
      }

      // 为图表组件添加默认数据
      if (component.type === 'barChart' || component.type === 'lineChart') {
        newComponent.dataSource.data = {
          categories: ['类别1', '类别2', '类别3', '类别4', '类别5'],
          series: [
            {
              name: '系列1',
              data: [120, 200, 150, 80, 70],
              smooth: component.type === 'lineChart',
            },
            {
              name: '系列2',
              data: [60, 100, 80, 120, 140],
              smooth: false,
            },
          ],
        }
      }
    }
  }
}

// 选择组件
const handleSelectComponent = (component: Component) => {
  componentStore.setSelectedComponentId(component.id)
}

// 删除组件
const handleDeleteComponent = (componentId: string) => {
  const deleteComponentById = (components: Component[], id: string): boolean => {
    const index = components.findIndex((item) => item.id === id)
    if (index !== -1) {
      components.splice(index, 1)
      return true
    }

    // 递归处理子组件
    for (const component of components) {
      if (component.children && component.children.length > 0) {
        if (deleteComponentById(component.children, id)) {
          return true
        }
      }
    }

    return false
  }

  deleteComponentById(pageConfig.components, componentId)
  componentStore.setSelectedComponentId(null)
}

// 更新组件
const handleUpdateComponent = (updatedComponent: Component) => {
  const updateComponentById = (components: Component[], component: Component): boolean => {
    const index = components.findIndex((item) => item.id === component.id)
    if (index !== -1) {
      components[index] = component
      return true
    }

    // 递归处理子组件
    for (const item of components) {
      if (item.children && item.children.length > 0) {
        if (updateComponentById(item.children, component)) {
          return true
        }
      }
    }

    return false
  }

  updateComponentById(pageConfig.components, updatedComponent)
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
