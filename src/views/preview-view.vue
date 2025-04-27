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
        >
          <div class="component-wrapper" :style="component.style">
            <component-renderer :config="component" :is-editor="false" />
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
import ComponentRenderer from '../components/lowcode-editor/components/component-renderer.vue'

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
  padding: 16px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.component-container {
  margin-bottom: 12px;
}

.component-wrapper {
  padding: 8px;
  background-color: #fff;
  min-width: 100px;
  min-height: 30px;
  border: 1px solid transparent;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.empty-tip {
  margin: auto;
}
</style>
