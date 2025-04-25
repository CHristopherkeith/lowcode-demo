<template>
  <lowcode-editor-page />
</template>

<script setup lang="ts">
import LowcodeEditorPage from './lowcode-editor-page.vue'

// 定义组件名称避免警告
defineOptions({
  name: 'LowcodeEditorIndex',
})
</script>

<style scoped>
.lowcode-editor {
  height: 100%;
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
}

.material-panel {
  width: 250px;
  padding: 16px;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.render-panel {
  flex: 1;
  position: relative;
  background-color: #f5f5f5;
  overflow: auto;
}

.property-panel {
  width: 300px;
  padding: 16px;
  border-left: 1px solid #eee;
  overflow-y: auto;
}

.component-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid #eee;
  background-color: #fff;
  cursor: pointer;
  user-select: none;
}

.component-container {
  position: absolute;
}

.component-wrapper {
  padding: 2px;
  background-color: #fff;
  min-width: 100px;
  min-height: 30px;
  border: 1px solid transparent;
}

.component-wrapper.selected {
  border: 1px solid #1890ff;
}

.component-actions {
  position: absolute;
  right: 0;
  top: -30px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.empty-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
}
</style>
