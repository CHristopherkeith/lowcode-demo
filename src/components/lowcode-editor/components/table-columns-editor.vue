<template>
  <div class="table-columns-editor">
    <div class="table-columns-editor__header">
      <h4>表格列配置</h4>
      <a-button type="primary" size="small" @click="handleAddColumn">
        <template #icon><plus-outlined /></template>添加列
      </a-button>
    </div>
    <div class="table-columns-editor__content">
      <a-empty v-if="columns.length === 0" description="暂无数据列" />
      <div v-else class="table-columns-editor__list">
        <div v-for="(column, index) in columns" :key="index" class="table-columns-editor__item">
          <div class="table-columns-editor__item-header">
            <span>列 {{ index + 1 }}: {{ column.title }}</span>
            <a-space>
              <a-button
                size="small"
                type="text"
                @click="handleMoveColumn(index, 'up')"
                :disabled="index === 0"
              >
                <template #icon><arrow-up-outlined /></template>
              </a-button>
              <a-button
                size="small"
                type="text"
                @click="handleMoveColumn(index, 'down')"
                :disabled="index === columns.length - 1"
              >
                <template #icon><arrow-down-outlined /></template>
              </a-button>
              <a-button size="small" type="text" danger @click="handleRemoveColumn(index)">
                <template #icon><delete-outlined /></template>
              </a-button>
            </a-space>
          </div>
          <a-form layout="vertical">
            <a-form-item label="列标题">
              <a-input v-model:value="column.title" @change="handleColumnsChange" />
            </a-form-item>
            <a-form-item label="数据字段">
              <a-input v-model:value="column.dataIndex" @change="handleColumnsChange" />
            </a-form-item>
            <a-form-item label="列宽">
              <a-input-number
                v-model:value="column.width"
                style="width: 100%"
                :min="50"
                :max="500"
                :step="10"
                @change="handleColumnsChange"
              />
            </a-form-item>
            <a-form-item label="对齐方式">
              <a-select
                v-model:value="column.align"
                style="width: 100%"
                @change="handleColumnsChange"
              >
                <a-select-option value="left">左对齐</a-select-option>
                <a-select-option value="center">居中对齐</a-select-option>
                <a-select-option value="right">右对齐</a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons-vue'

interface TableColumn {
  title: string
  dataIndex: string
  key?: string
  width?: number
  align?: 'left' | 'center' | 'right'
}

const props = defineProps<{
  value: TableColumn[]
}>()

const emit = defineEmits<{
  (e: 'update:value', columns: TableColumn[]): void
}>()

const columns = ref<TableColumn[]>([])

// 初始化列数据
watch(
  () => props.value,
  (newVal) => {
    if (newVal) {
      columns.value = JSON.parse(JSON.stringify(newVal))
    }
  },
  { immediate: true, deep: true },
)

// 处理添加列
const handleAddColumn = () => {
  const newColumn: TableColumn = {
    title: `列${columns.value.length + 1}`,
    dataIndex: `col${columns.value.length + 1}`,
    key: `col${columns.value.length + 1}`,
    width: 150,
    align: 'left',
  }
  columns.value.push(newColumn)
  handleColumnsChange()
}

// 处理移除列
const handleRemoveColumn = (index: number) => {
  columns.value.splice(index, 1)
  handleColumnsChange()
}

// 处理移动列
const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index > 0) {
    const temp = columns.value[index]
    columns.value[index] = columns.value[index - 1]
    columns.value[index - 1] = temp
  } else if (direction === 'down' && index < columns.value.length - 1) {
    const temp = columns.value[index]
    columns.value[index] = columns.value[index + 1]
    columns.value[index + 1] = temp
  }
  handleColumnsChange()
}

// 处理列变更
const handleColumnsChange = () => {
  // 确保每列都有key
  columns.value.forEach((col) => {
    if (!col.key) {
      col.key = col.dataIndex
    }
  })
  emit('update:value', JSON.parse(JSON.stringify(columns.value)))
}
</script>

<style lang="scss" scoped>
.table-columns-editor {
  width: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 400px;
    overflow-y: auto;
  }

  &__item {
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 12px;
    background-color: #fafafa;
  }

  &__item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #e0e0e0;
    font-weight: bold;
  }
}
</style>
