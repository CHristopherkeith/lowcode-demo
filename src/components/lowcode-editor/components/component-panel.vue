<template>
  <div class="component-panel">
    <h4>组件库</h4>
    <a-collapse
      v-model:activeKey="activeCollapseKeys"
      :defaultActiveKey="['container', 'basic', 'advanced']"
    >
      <!-- <a-collapse-panel key="container" header="容器组件">
        <a-space direction="vertical" style="width: 100%">
          <VueDraggable
            v-model="containerComponentsData"
            :group="{ name: 'components', pull: 'clone', put: false }"
            :sort="false"
            :clone="cloneComponent"
            item-key="type"
            tag="div"
          >
            <a-card
              v-for="element in containerComponentsData"
              :key="element.type"
              size="small"
              class="component-panel__card"
              :data-type="element.type"
            >
              <div class="component-panel__item">
                <span>{{ element.name }}</span>
                <span class="drag-icon">⋮⋮</span>
              </div>
            </a-card>
          </VueDraggable>
        </a-space>
      </a-collapse-panel> -->

      <a-collapse-panel key="basic" header="基础表单组件">
        <a-space direction="vertical" style="width: 100%">
          <VueDraggable
            v-model="basicComponentsData"
            :group="{ name: 'components', pull: 'clone', put: false }"
            :sort="false"
            :clone="cloneComponent"
            item-key="type"
            tag="div"
          >
            <a-card
              v-for="element in basicComponentsData"
              :key="element.type"
              size="small"
              class="component-panel__card"
              :data-type="element.type"
            >
              <div class="component-panel__item">
                <span>{{ element.name }}</span>
                <span class="drag-icon">⋮⋮</span>
              </div>
            </a-card>
          </VueDraggable>
        </a-space>
      </a-collapse-panel>

      <a-collapse-panel key="advanced" header="高级组件">
        <a-space direction="vertical" style="width: 100%">
          <VueDraggable
            v-model="advancedComponentsData"
            :group="{ name: 'components', pull: 'clone', put: false }"
            :sort="false"
            :clone="cloneComponent"
            item-key="type"
            tag="div"
          >
            <a-card
              v-for="element in advancedComponentsData"
              :key="element.type"
              size="small"
              class="component-panel__card"
              :data-type="element.type"
            >
              <div class="component-panel__item">
                <span>{{ element.name }}</span>
                <span class="drag-icon">⋮⋮</span>
              </div>
            </a-card>
          </VueDraggable>
        </a-space>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import {
  basicComponents,
  advancedComponents,
  containerComponents,
} from '../config/component-config'
import type { ComponentDefinition } from '@/types/lowcode'

// 定义组件名称
defineOptions({
  name: 'ComponentPanel',
})

// Collapse面板的激活键值
const activeCollapseKeys = ref(['container', 'basic', 'advanced'])

// 创建响应式数据以满足v-model需求
const containerComponentsData = ref([...containerComponents])
const basicComponentsData = ref([...basicComponents])
const advancedComponentsData = ref([...advancedComponents])

// 克隆组件以便拖拽出去
const cloneComponent = (component: ComponentDefinition): ComponentDefinition => {
  const cloned = { ...component }
  // 为克隆的组件设置data-type属性，以便验证函数可以识别
  // cloned.dataType = component.type
  return cloned
}
</script>

<style lang="scss" scoped>
.component-panel {
  padding: 12px;
  height: 100%;
  overflow-y: auto;

  &__card {
    cursor: grab;
    transition: all 0.3s;
    margin-bottom: 8px;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-color: #1890ff;
    }

    &:active {
      cursor: grabbing;
    }
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.drag-icon {
  cursor: grab;
  font-size: 16px;
  color: #999;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}
</style>
