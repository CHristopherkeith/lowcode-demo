<template>
  <div class="editor-view">
    <lowcode-editor />
  </div>
</template>

<script setup lang="ts">
import LowcodeEditor from '@/components/lowcode-editor/index.vue'
</script>

<style scoped>
.editor-view {
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}
</style>
