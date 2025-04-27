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

  // 查找表单组件
  function findFormComponent(componentId: string): Component | null {
    // 递归查找包含指定组件ID的表单组件
    const findParentForm = (
      components: Component[],
      targetId: string,
      path: Component[] = [],
    ): Component | null => {
      for (const comp of components) {
        // 检查当前组件是否是目标组件
        if (comp.id === targetId) {
          // 如果找到目标组件，在路径中查找最近的表单组件
          for (let i = path.length - 1; i >= 0; i--) {
            if (path[i].type === 'form') {
              return path[i]
            }
          }
          return null // 没有找到表单父组件
        }

        // 将当前组件添加到路径中，递归搜索子组件
        path.push(comp)

        if (comp.children && comp.children.length > 0) {
          // 尝试在子组件中查找
          for (const child of comp.children) {
            const newPath = [...path]
            const result = findParentForm([child], targetId, newPath)
            if (result) {
              return result
            }
          }
        }

        // 从路径中移除当前组件
        path.pop()
      }

      return null
    }

    return findParentForm(components.value, componentId)
  }

  // 收集表单组件中的字段数据
  function collectFormData(formComponent: Component): Record<string, unknown> {
    const formData: Record<string, unknown> = {}
    console.log('开始收集表单数据，表单组件ID:', formComponent.id)

    // 检查表单组件的dataSource是否有数据
    if (formComponent.dataSource && formComponent.dataSource.data) {
      console.log('表单组件的静态数据:')
      console.log(formComponent.dataSource.data)

      // 如果有静态数据并且是对象类型，可以直接使用它
      if (
        typeof formComponent.dataSource.data === 'object' &&
        formComponent.dataSource.data !== null
      ) {
        console.log('使用表单的静态数据')
        return formComponent.dataSource.data as Record<string, unknown>
      }
    }

    // 递归处理组件
    const processComponent = (comp: Component) => {
      console.log('[debug comp]', comp)
      console.log('处理组件:', comp.type, '字段名:', comp.fieldName || '无', 'ID:', comp.id)

      // 如果组件有字段名称，收集其值
      if (comp.props.fieldName) {
        // 根据组件类型获取值
        let value = null

        // 打印组件的完整props内容，用于调试
        console.log(`组件 ${comp.type} 的完整props:`, comp.props)

        // 获取组件值的映射表
        const componentValueMap: Record<string, { defaultValue: unknown; logName: string }> = {
          input: { defaultValue: '', logName: 'input' },
          datePicker: { defaultValue: '', logName: 'datePicker' },
          select: { defaultValue: '', logName: 'select' },
          radio: { defaultValue: '', logName: 'radio' },
          checkbox: { defaultValue: [], logName: 'checkbox' },
        }

        // 获取组件类型的配置，如果没有则使用默认配置
        const componentConfig = componentValueMap[comp.type] || {
          defaultValue: null,
          logName: '默认',
        }

        // 统一获取值逻辑
        value = comp.props.value || comp.props.defaultValue || componentConfig.defaultValue

        // 记录日志
        console.log(`  表单字段 ${comp.fieldName} 值(${componentConfig.logName}):`, value)

        // 保存值到表单数据对象
        formData[comp.props.fieldName] = value
      }

      // 递归处理子组件
      if (comp.children && comp.children.length > 0) {
        console.log(`处理 ${comp.type} 的子组件, 子组件数量:`, comp.children.length)
        comp.children.forEach(processComponent)
      }
    }

    // 处理表单的直接子组件
    console.log('表单子组件数量:', formComponent.children.length)
    formComponent.children.forEach(processComponent)

    // 打印最终收集到的所有表单数据
    console.log('表单数据收集完成:', formData)
    return formData
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
    findFormComponent,
    collectFormData,
  }
})
