<template>
  <div class="table-columns-editor">
    <a-table
      :dataSource="localColumns"
      :columns="editorColumns"
      size="small"
      :pagination="false"
      bordered
    />
    <div class="table-columns-editor__actions">
      <a-button type="primary" size="small" @click="handleAddColumn">添加列</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import { Form, Input, Button, Popconfirm } from 'ant-design-vue'

const props = defineProps<{
  value: Array<{
    title: string
    dataIndex: string
    key: string
    [key: string]: unknown
  }>
}>()

const emit = defineEmits<{
  (e: 'update:value', columns: Array<Record<string, unknown>>): void
}>()

// 本地列数据
const localColumns = ref<Array<Record<string, unknown>>>([])

// 初始化列数据
watch(
  () => props.value,
  (newVal) => {
    if (newVal) {
      // 过滤掉action列，这是自动添加的
      localColumns.value = newVal
        .filter((col) => col.dataIndex !== 'action')
        .map((col) => ({ ...col }))
    }
  },
  { immediate: true, deep: true },
)

// 单元格变更处理
const handleCellChange = (index: number, key: string, value: string) => {
  localColumns.value[index][key] = value
  // 如果是dataIndex变更，也更新key
  if (key === 'dataIndex') {
    localColumns.value[index].key = value
  }
  emitColumnChange()
}

// 添加列
const handleAddColumn = () => {
  const newColumn = {
    title: `新列${localColumns.value.length + 1}`,
    dataIndex: `col${localColumns.value.length + 1}`,
    key: `col${localColumns.value.length + 1}`,
  }
  localColumns.value.push(newColumn)
  emitColumnChange()
}

// 删除列
const handleDeleteColumn = (index: number) => {
  localColumns.value.splice(index, 1)
  emitColumnChange()
}

// 发送列变更事件
const emitColumnChange = () => {
  emit('update:value', [...localColumns.value])
}

// 编辑器列定义
const editorColumns = [
  {
    title: '列标题',
    dataIndex: 'title',
    key: 'title',
    width: '30%',
    customRender: ({ record, index }: { record: Record<string, unknown>; index: number }) => {
      return h(Form.Item, { style: { margin: 0 } }, [
        h(Input, {
          value: record.title as string,
          onChange: (e: Event) =>
            handleCellChange(index, 'title', (e.target as HTMLInputElement).value),
        }),
      ])
    },
  },
  {
    title: '数据字段',
    dataIndex: 'dataIndex',
    key: 'dataIndex',
    width: '30%',
    customRender: ({ record, index }: { record: Record<string, unknown>; index: number }) => {
      return h(Form.Item, { style: { margin: 0 } }, [
        h(Input, {
          value: record.dataIndex as string,
          onChange: (e: Event) =>
            handleCellChange(index, 'dataIndex', (e.target as HTMLInputElement).value),
        }),
      ])
    },
  },
  {
    title: '宽度',
    dataIndex: 'width',
    key: 'width',
    width: '20%',
    customRender: ({ record, index }: { record: Record<string, unknown>; index: number }) => {
      return h(Form.Item, { style: { margin: 0 } }, [
        h(Input, {
          value: record.width as string,
          onChange: (e: Event) =>
            handleCellChange(index, 'width', (e.target as HTMLInputElement).value),
        }),
      ])
    },
  },
  {
    title: '操作',
    key: 'action',
    width: '20%',
    customRender: ({ index }: { record: Record<string, unknown>; index: number }) => {
      return h(
        Popconfirm,
        {
          title: '确定删除此列?',
          onConfirm: () => handleDeleteColumn(index),
          okText: '确定',
          cancelText: '取消',
        },
        {
          default: () =>
            h(
              Button,
              {
                type: 'link',
                danger: true,
              },
              { default: () => '删除' },
            ),
        },
      )
    },
  },
]
</script>

<style lang="scss" scoped>
.table-columns-editor {
  margin-bottom: 16px;

  &__actions {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
