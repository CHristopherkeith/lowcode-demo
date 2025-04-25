<template>
  <div class="component-property-form">
    <template v-if="propConfigs.length > 0">
      <a-form layout="vertical">
        <template v-for="(config, index) in propConfigs" :key="index">
          <!-- 字符串类型 -->
          <a-form-item :label="config.label" v-if="config.type === 'string'">
            <a-input v-model:value="propValues[config.name]" @change="handlePropChange" />
          </a-form-item>

          <!-- 数字类型 -->
          <a-form-item :label="config.label" v-else-if="config.type === 'number'">
            <a-input-number
              v-model:value="propValues[config.name]"
              style="width: 100%"
              @change="handlePropChange"
            />
          </a-form-item>

          <!-- 布尔类型 -->
          <a-form-item :label="config.label" v-else-if="config.type === 'boolean'">
            <a-switch v-model:checked="propValues[config.name]" @change="handlePropChange" />
          </a-form-item>

          <!-- 选择类型 -->
          <a-form-item :label="config.label" v-else-if="config.type === 'select'">
            <a-select
              v-model:value="propValues[config.name]"
              style="width: 100%"
              @change="handlePropChange"
            >
              <a-select-option
                v-for="(option, optIndex) in config.options"
                :key="optIndex"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <!-- 颜色类型 -->
          <a-form-item :label="config.label" v-else-if="config.type === 'color'">
            <a-input v-model:value="propValues[config.name]" @change="handlePropChange">
              <template #prefix>
                <div
                  class="color-block"
                  :style="{ backgroundColor: String(propValues[config.name] || '#ffffff') }"
                ></div>
              </template>
            </a-input>
          </a-form-item>
        </template>
      </a-form>
    </template>
    <template v-else>
      <div class="empty-tip">该组件没有可配置的属性</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { Component, PropConfig } from '@/types/lowcode'
import { basicComponents, advancedComponents } from '../config/component-config'

const props = defineProps<{
  component: Component
}>()

const emit = defineEmits<{
  (e: 'update', newProps: Record<string, unknown>): void
}>()

// 组件属性值
const propValues = reactive<Record<string, unknown>>({})

// 获取组件的属性配置
const propConfigs = computed<PropConfig[]>(() => {
  const allComponents = [...basicComponents, ...advancedComponents]
  const componentConfig = allComponents.find((item) => item.type === props.component.type)
  return componentConfig?.propConfig || []
})

// 初始化属性值
watch(
  () => props.component,
  (newVal) => {
    if (newVal && newVal.props) {
      // 重置属性值
      Object.keys(propValues).forEach((key) => {
        delete propValues[key]
      })

      // 设置新属性值
      Object.keys(newVal.props).forEach((key) => {
        propValues[key] = newVal.props[key]
      })
    }
  },
  { immediate: true, deep: true },
)

// 处理属性变更
const handlePropChange = () => {
  emit('update', { ...propValues })
}
</script>

<style scoped>
.component-property-form {
  width: 100%;
}

.empty-tip {
  color: #aaa;
  text-align: center;
  padding: 20px 0;
}

.color-block {
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 6px;
  border: 1px solid #ddd;
}
</style>
