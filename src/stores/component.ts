import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Component } from '@/types/lowcode'

export const useComponentStore = defineStore('component', () => {
  // 当前选中的组件ID
  const selectedComponentId = ref<string | null>(null)

  // 页面所有组件
  const components = ref<Component[]>([])

  // 设置选中组件
  function setSelectedComponentId(id: string | null) {
    selectedComponentId.value = id
  }

  // 添加组件
  function addComponent(component: Component) {
    components.value.push(component)
  }

  // 更新组件
  function updateComponent(updatedComponent: Component) {
    const index = components.value.findIndex((c) => c.id === updatedComponent.id)
    if (index !== -1) {
      components.value[index] = updatedComponent
    }
  }

  // 删除组件
  function removeComponent(id: string) {
    const index = components.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      components.value.splice(index, 1)
    }
    // 如果删除的是当前选中的组件，清空选中状态
    if (selectedComponentId.value === id) {
      selectedComponentId.value = null
    }
  }

  // 清空所有组件
  function clearComponents() {
    components.value = []
    selectedComponentId.value = null
  }

  // 保存页面配置
  function savePageConfig() {
    const pageConfig = {
      version: '1.0',
      title: '低代码页面',
      layout: {
        type: 'free',
        props: {},
      },
      components: components.value,
    }

    localStorage.setItem('lowcodePageConfig', JSON.stringify(pageConfig))
    return pageConfig
  }

  // 加载页面配置
  function loadPageConfig() {
    const configJson = localStorage.getItem('lowcodePageConfig')
    if (configJson) {
      try {
        const config = JSON.parse(configJson)
        components.value = config.components || []
        return config
      } catch (error) {
        console.error('解析页面配置出错:', error)
      }
    }
    return null
  }

  return {
    selectedComponentId,
    components,
    setSelectedComponentId,
    addComponent,
    updateComponent,
    removeComponent,
    clearComponents,
    savePageConfig,
    loadPageConfig,
  }
})
