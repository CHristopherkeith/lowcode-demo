<template>
  <div class="component-panel">
    <h4>组件库</h4>
    <a-collapse v-model:activeKey="activeCollapseKeys">
      <a-collapse-panel key="basic" header="基础表单组件">
        <a-space direction="vertical" style="width: 100%">
          <a-card
            v-for="component in basicComponents"
            :key="component.type"
            size="small"
            class="component-panel__card"
            draggable
            @dragstart="handleDragStart($event, component.type)"
          >
            <div class="component-panel__item">
              <span>{{ component.name }}</span>
              <span class="drag-icon">⋮⋮</span>
            </div>
          </a-card>
        </a-space>
      </a-collapse-panel>

      <a-collapse-panel key="advanced" header="高级组件">
        <a-space direction="vertical" style="width: 100%">
          <a-card
            v-for="component in advancedComponents"
            :key="component.type"
            size="small"
            class="component-panel__card"
            draggable
            @dragstart="handleDragStart($event, component.type)"
          >
            <div class="component-panel__item">
              <span>{{ component.name }}</span>
              <span class="drag-icon">⋮⋮</span>
            </div>
          </a-card>
        </a-space>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { basicComponents, advancedComponents } from '../config/component-config'

// 定义组件名称
defineOptions({
  name: 'ComponentPanel',
})

// Collapse面板的激活键值
const activeCollapseKeys = ref(['basic', 'advanced'])

const handleDragStart = (e: DragEvent, componentType: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('componentType', componentType)

    // 设置拖拽时的效果
    const dragImage = document.createElement('div')
    dragImage.textContent = '组件'
    dragImage.className = 'component-panel__drag-image'
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)

    // 设置完拖拽效果后移除临时元素
    setTimeout(() => {
      document.body.removeChild(dragImage)
    }, 0)
  }
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

  &__drag-image {
    padding: 8px 12px;
    background-color: #f0f2f5;
    border: 1px dashed #1890ff;
    border-radius: 4px;
    position: absolute;
    top: -9999px;
    left: -9999px;
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
