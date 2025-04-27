<template>
  <div
    :class="['component-renderer', { 'component-renderer--selected': isSelected }]"
    :style="wrapperStylesObj"
    @click.stop="handleClick"
  >
    <!-- 按钮组件特殊处理 -->
    <template v-if="config.type === 'button'">
      <a-button v-bind="componentProps" @click="handleButtonClick">{{
        config.props.text
      }}</a-button>
    </template>
    <!-- 其他组件正常处理 -->
    <component
      v-else
      :is="resolveComponent(config.type)"
      v-bind="componentProps"
      v-model:value="config.props.value"
      @change="handleInputChange"
    >
      <!-- 特殊处理栅格行容器，只允许拖入列容器 -->
      <template v-if="config.type === 'row'">
        <!-- item-key="id"
        tag="div" -->
        <VueDraggable
          v-model="config.children"
          :group="{ name: 'components', put: validateColOnly }"
          :sort="true"
          item-key="id"
          tag="div"
          class="component-renderer__dropable-area component-renderer__row-container"
          @add="handleChildAdded"
        >
          <component-renderer
            v-for="child in config.children"
            :key="child.id"
            :config="child"
            :is-editor="isEditor"
            @select="handleSelectChild"
            @delete="handleDeleteChild"
          />
          <template #header>
            <div v-if="config.children.length === 0" class="component-renderer__empty-tip">
              只能拖入栅格列容器
            </div>
          </template>
        </VueDraggable>
      </template>
      <!-- 栅格列容器，可以拖入任何除了Row的组件 -->
      <template v-else-if="config.type === 'col'">
        <VueDraggable
          v-model="config.children"
          :group="{ name: 'components', put: validateNotRow }"
          :sort="true"
          item-key="id"
          tag="div"
          class="component-renderer__dropable-area"
          @add="handleChildAdded"
        >
          <component-renderer
            v-for="child in config.children"
            :key="child.id"
            :config="child"
            :is-editor="isEditor"
            @select="handleSelectChild"
            @delete="handleDeleteChild"
          />
          <template #header>
            <div v-if="config.children.length === 0" class="component-renderer__empty-tip">
              拖拽组件到此区域（不能拖入栅格行容器）
            </div>
          </template>
        </VueDraggable>
      </template>
      <!-- 表单容器，只能放置基础表单组件 -->
      <template v-else-if="config.type === 'form'">
        <VueDraggable
          v-model="config.children"
          :group="{ name: 'components', put: validateFormChildren }"
          :sort="true"
          item-key="id"
          tag="div"
          class="component-renderer__dropable-area"
          :class="{
            'component-renderer__inline-form': config.props && config.props.layout === 'inline',
          }"
          @add="handleChildAdded"
        >
          <template v-for="child in config.children" :key="child.id">
            <div
              v-if="config.props && config.props.layout === 'inline'"
              class="inline-form-item-wrapper"
              :style="{
                display: 'inline-block',
                width: (child.style && child.style.width) || 'auto',
                marginRight: '16px',
                marginBottom: '8px',
                verticalAlign: 'top',
              }"
            >
              <a-form-item
                v-if="child.props && child.props.label"
                :label="child.props.label"
                :label-col="getFormItemLabelCol(config.props)"
                class="inline-form-item"
                style="width: 100%"
              >
                <div style="width: 100%">
                  <component-renderer
                    :config="child"
                    :is-editor="isEditor"
                    @select="handleSelectChild"
                    @delete="handleDeleteChild"
                  />
                </div>
              </a-form-item>
              <component-renderer
                v-else
                :config="child"
                :is-editor="isEditor"
                @select="handleSelectChild"
                @delete="handleDeleteChild"
                style="width: 100%"
              />
            </div>
            <template v-else>
              <a-form-item
                v-if="child.props && child.props.label"
                :label="child.props.label"
                :label-col="getFormItemLabelCol(config.props)"
              >
                <component-renderer
                  :config="child"
                  :is-editor="isEditor"
                  @select="handleSelectChild"
                  @delete="handleDeleteChild"
                />
              </a-form-item>
              <component-renderer
                v-else
                :config="child"
                :is-editor="isEditor"
                @select="handleSelectChild"
                @delete="handleDeleteChild"
              />
            </template>
          </template>
          <template #header>
            <div v-if="config.children.length === 0" class="component-renderer__empty-tip">
              只能拖入基础表单组件
            </div>
          </template>
        </VueDraggable>
      </template>
      <!-- 非Col的容器，直接显示子组件 -->
      <template v-else-if="config.children && config.children.length > 0">
        <component-renderer
          v-for="child in config.children"
          :key="child.id"
          :config="child"
          :is-editor="isEditor"
          @select="handleSelectChild"
          @delete="handleDeleteChild"
        />
      </template>
    </component>
    <div v-if="isEditor && isSelected" class="component-renderer__actions">
      <a-button type="text" size="small" danger @click.stop="handleDelete"> 删除 </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { Component } from '@/types/lowcode.d'
import {
  Input,
  Select,
  // DatePicker, // 暂时屏蔽日期选择器
  Radio,
  Checkbox,
  Button,
  Form,
  Table,
  Row,
  Col,
  message,
} from 'ant-design-vue'
import { useComponentStore } from '@/stores/component'
import { VueDraggable } from 'vue-draggable-plus'
import { v4 as uuidv4 } from 'uuid'
import {
  basicComponents,
  advancedComponents,
  containerComponents,
} from '../config/component-config'

// 解决循环引用问题
// const ComponentRenderer = defineAsyncComponent(() => import('./component-renderer.vue'))

const props = defineProps<{
  config: Component
  isEditor?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', component: Component): void
  (e: 'delete', componentId: string): void
}>()

const componentStore = useComponentStore()
const isSelected = computed(() => componentStore.selectedComponentId === props.config.id)

// 验证函数：只允许拖入列容器
const validateColOnly = (to: unknown, from: unknown, dragEl: HTMLElement) => {
  // 获取被拖拽元素的组件类型
  const draggedType = dragEl.getAttribute('data-type')
  // 只允许col类型组件
  return draggedType === 'col'
}

// 验证函数：不允许拖入行容器
const validateNotRow = (to: unknown, from: unknown, dragEl: HTMLElement) => {
  // 获取被拖拽元素的组件类型
  const draggedType = dragEl.getAttribute('data-type')
  // 不允许row类型组件
  return draggedType !== 'row'
}

// 验证函数：表单组件只能放置基础表单组件
const validateFormChildren = (to: unknown, from: unknown, dragEl: HTMLElement) => {
  // 获取被拖拽元素的组件类型
  const draggedType = dragEl.getAttribute('data-type')

  // 基础表单组件类型列表
  const basicFormTypes = basicComponents.map((comp) => comp.type)

  // 只允许基础表单组件类型
  return basicFormTypes.includes(draggedType || '')
}

// 组件点击事件
const handleClick = () => {
  if (props.isEditor) {
    emit('select', props.config)
    componentStore.setSelectedComponentId(props.config.id)
  }
}

// 删除组件
const handleDelete = () => {
  emit('delete', props.config.id)
}

// 处理子组件选中
const handleSelectChild = (component: Component) => {
  emit('select', component)
}

// 处理子组件删除
const handleDeleteChild = (componentId: string) => {
  emit('delete', componentId)
}

// 处理新子组件添加
const handleChildAdded = (event: { newIndex: number; item: HTMLElement }) => {
  // 获取新添加的组件索引
  const newIndex = event.newIndex
  // 获取新添加的组件
  const child = props.config.children[newIndex]

  // 这里处理新拖入的组件，添加必要的属性
  if (!child.id) {
    // 如果是从组件面板拖入的新组件，添加ID和样式属性
    const allComponents = [...containerComponents, ...basicComponents, ...advancedComponents]
    const componentConfig = allComponents.find((item) => item.type === child.type)

    if (componentConfig) {
      // 使用新对象替换原组件
      const newComponent: Component = {
        id: uuidv4(),
        type: child.type,
        props: { ...componentConfig.defaultProps },
        style: {
          width: '100%',
          marginBottom: '10px',
        },
        dataSource: {
          type: 'static',
          data: null,
          url: '',
          method: 'GET',
          params: {},
          refreshInterval: 0,
        },
        children: [],
      }

      // 若当前容器是row，且新拖入的是col，设置宽度为50%
      if (props.config.type === 'row' && child.type === 'col') {
        newComponent.props.span = 12 // 设置为50%宽度
      }

      // 若当前容器是表单，且表单布局是内联
      if (props.config.type === 'form' && props.config.props.layout === 'inline') {
        // 为表单内的组件设置兼容的宽度和样式
        // 如果用户设置了百分比宽度，我们需要确保这个宽度被正确应用到包装器上
        // 同时组件本身应该占据整个包装器的宽度
        newComponent.style.width = '100%' // 组件本身宽度设为100%以占满父容器
      }

      // 为图表组件添加默认数据
      if (child.type === 'barChart' || child.type === 'lineChart') {
        newComponent.dataSource.data = {
          categories: ['类别1', '类别2', '类别3', '类别4', '类别5'],
          series: [
            {
              name: '系列1',
              data: [120, 200, 150, 80, 70],
              smooth: child.type === 'lineChart',
            },
            {
              name: '系列2',
              data: [60, 100, 80, 120, 140],
              smooth: false,
            },
          ],
        }
      }

      // 为表格组件添加默认数据
      if (child.type === 'table') {
        // 定义默认表格数据
        const columns = newComponent.props.columns as Array<{
          title: string
          dataIndex: string
          key: string
        }>
        const dataSource = []

        // 根据列生成示例数据
        for (let i = 1; i <= 5; i++) {
          const row: Record<string, unknown> = { key: i.toString() }
          columns.forEach((column) => {
            row[column.dataIndex] = `${column.title}${i}`
          })
          dataSource.push(row)
        }

        newComponent.dataSource.data = dataSource
      }

      // 替换掉原始拖入的组件
      props.config.children.splice(newIndex, 1, newComponent)

      // 选中新添加的组件
      componentStore.setSelectedComponentId(newComponent.id)
      emit('select', newComponent)
    }
  }
}

// 解析组件类型为对应的组件
const resolveComponent = (type: string) => {
  const componentMap: Record<string, unknown> = {
    input: Input,
    select: Select,
    // datePicker: DatePicker, // 暂时屏蔽日期选择器
    radio: Radio.Group,
    checkbox: Checkbox.Group,
    button: Button,
    form: Form,
    table: Table,
    barChart: defineAsyncComponent(() =>
      import('./chart-component.vue').then((comp) => {
        return {
          ...comp.default,
          props: {
            ...comp.default.props,
            type: { default: 'bar' },
          },
        }
      }),
    ),
    lineChart: defineAsyncComponent(() =>
      import('./chart-component.vue').then((comp) => {
        return {
          ...comp.default,
          props: {
            ...comp.default.props,
            type: { default: 'line' },
          },
        }
      }),
    ),
    row: Row, // 栅格行组件
    col: Col, // 栅格列组件
  }

  return componentMap[type] || 'div'
}

// 添加wrapperStylesObj的计算属性
const wrapperStylesObj = computed(() => {
  return props.config.style || {}
})

// 生成组件所需的props
const componentProps = computed(() => {
  const propValues: Record<string, any> = { ...props.config.props }

  // 特殊处理表单组件
  if (propValues.type === 'form') {
    // 表单组件不需要label
    delete propValues.label
  }

  // 特殊处理按钮组件 - 删除text属性，将通过template中的插槽显示
  if (propValues.type === 'button') {
    // 注意：不再从props中删除text属性
    // delete propValues.text;
  }

  // 特殊处理表格
  if (props.config.type === 'table') {
    if (propValues.columns) {
      // 确保列定义不是字符串而是对象
      try {
        propValues.columns =
          typeof propValues.columns === 'string'
            ? JSON.parse(propValues.columns)
            : propValues.columns
      } catch (e) {
        console.error('Invalid table columns', propValues.columns)
        propValues.columns = []
      }

      // 注释掉自动添加操作列的代码
      /*
      // 为表格添加操作列
      if (Array.isArray(propValues.columns) && propValues.columns.length > 0 && props.isEditor) {
        const hasActionColumn = propValues.columns.some(
          (col: { dataIndex: string }) => col.dataIndex === 'action',
        )
        if (!hasActionColumn) {
          propValues.columns.push({
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
            width: 120,
          })
        }
      }
      */
    }

    // 直接在表格组件上设置数据源
    if (
      props.config.dataSource &&
      typeof props.config.dataSource === 'object' &&
      'data' in props.config.dataSource
    ) {
      propValues.dataSource = props.config.dataSource.data
    }
  }

  // 处理表单的labelCol格式
  if (propValues.type === 'form' && propValues.labelColType && propValues.labelColValue) {
    // 根据类型生成不同格式的labelCol
    if (propValues.labelColType === 'span') {
      propValues.labelCol = { span: propValues.labelColValue }
    } else if (propValues.labelColType === 'px') {
      propValues.labelCol = { style: { width: `${propValues.labelColValue}px` } }
    }
    // 删除辅助属性
    delete propValues.labelColType
    delete propValues.labelColValue
  }

  // 为图表组件提供数据源
  if (props.config.type === 'barChart' || props.config.type === 'lineChart') {
    if (
      props.config.dataSource &&
      typeof props.config.dataSource === 'object' &&
      'data' in props.config.dataSource
    ) {
      // 创建新的数据引用以确保变化能被检测到
      propValues.dataSource = {
        type: props.config.dataSource.type,
        data: JSON.parse(JSON.stringify(props.config.dataSource.data)),
      }
    }
  }

  return propValues
})

// 获取表单项的labelCol
const getFormItemLabelCol = (formProps: Record<string, any>) => {
  if (!formProps) return {}

  // 如果已经有labelCol属性（可能是由componentProps计算生成的）
  if (formProps.labelCol) {
    return formProps.labelCol
  }

  // 处理labelColType和labelColValue
  if (formProps.labelColType === 'span') {
    return { span: formProps.labelColValue }
  } else if (formProps.labelColType === 'px') {
    return { style: { width: `${formProps.labelColValue}px` } }
  }

  return {}
}

// 处理按钮点击事件
const handleButtonClick = () => {
  // 检查是否启用了表单保存功能
  if (props.config.props.formSave) {
    // 使用store查找按钮所在的表单组件
    console.log('=== 按钮点击事件开始 ===')
    console.log('按钮组件配置:', props.config)

    const parentForm = componentStore.findFormComponent(props.config.id)

    // 检查所有组件
    console.log('组件存储中的所有组件:', componentStore.components)

    if (parentForm) {
      console.log('找到了父表单组件:', parentForm)

      // 检查表单字段
      const fields: string[] = []
      const fieldComponents: Component[] = []
      const collectFields = (components: Component[]) => {
        components.forEach((comp) => {
          if (comp.fieldName) {
            fields.push(`${comp.fieldName} (${comp.type})`)
            fieldComponents.push(comp)
          }
          if (comp.children?.length) {
            collectFields(comp.children)
          }
        })
      }

      collectFields(parentForm.children)
      console.log('表单包含的字段:', fields)
      console.log('字段对应的组件:', fieldComponents)

      // 检查表单组件是否配置了数据保存API
      if (parentForm.dataSource?.dataSaveApi?.url) {
        console.log('表单配置了数据保存API:', parentForm.dataSource.dataSaveApi)

        // 检查表单是否有静态数据
        if (parentForm.dataSource.data) {
          console.log('表单有静态数据源:', parentForm.dataSource.data)
        } else {
          console.log('表单没有静态数据源，将从子组件收集数据')
        }

        // 使用store收集表单数据
        const formData = componentStore.collectFormData(parentForm)

        // 打印表单组件和收集的表单数据
        console.log('表单组件配置:', parentForm)
        console.log('收集到的表单字段数据:', formData)

        // 检查数据是否为空
        if (Object.keys(formData).length === 0) {
          console.log('警告: 收集到的表单数据为空!')
          console.log(
            '建议: 在表单组件的"数据绑定"标签中添加静态数据，或确保表单子组件都有设置字段名(fieldName)',
          )

          // 创建一些示例数据，以便演示
          const demoData: Record<string, unknown> = {}
          fieldComponents.forEach((comp) => {
            if (comp.fieldName) {
              demoData[comp.fieldName] =
                comp.type === 'input'
                  ? '示例文本'
                  : comp.type === 'select'
                    ? '选项1'
                    : comp.type === 'datePicker'
                      ? '2023-01-01'
                      : comp.type === 'checkbox'
                        ? ['选项1', '选项2']
                        : '示例值'
            }
          })

          if (Object.keys(demoData).length > 0) {
            console.log('使用生成的示例数据进行演示:')
            console.log(JSON.stringify(demoData, null, 2))

            // 提交示例数据而不是空数据
            submitFormData(
              parentForm.dataSource.dataSaveApi.url,
              demoData,
              parentForm.dataSource.dataSaveApi.method,
              true, // 表单保存后同步更新localStorage
            )
            return
          }
        }

        // 提交表单数据到保存API
        submitFormData(
          parentForm.dataSource.dataSaveApi.url,
          formData,
          parentForm.dataSource.dataSaveApi.method,
          true, // 表单保存后同步更新localStorage
        )
      } else {
        // 提示用户需要先配置表单的数据保存API
        console.log('表单没有配置数据保存API')
        message.warning('请先在表单组件配置数据保存API')
      }
    } else {
      // 提示用户按钮需要放在表单组件内
      console.log('未找到按钮所在的表单组件，请确保按钮是表单的子组件')
      message.warning('表单保存按钮需要放在表单组件内')
    }

    console.log('=== 按钮点击事件结束 ===')
  }
}

// 提交表单数据到API
const submitFormData = (
  url: string,
  data: Record<string, unknown>,
  method: string = 'POST',
  saveToStorage: boolean = false,
) => {
  // 在实际项目中，应使用axios或fetch进行API调用
  // 这里简单模拟API调用
  console.log('==================================')
  console.log(`准备提交表单数据到 ${url}`)
  console.log(`请求方法: ${method}`)
  console.log('表单数据内容:')
  console.log(JSON.stringify(data, null, 2))
  console.log('==================================')

  message.success('表单数据已提交')

  // 模拟API调用
  setTimeout(() => {
    console.log('API调用完成，服务器返回成功')
    message.success('表单数据保存成功')

    // 如果需要，同步保存整个页面配置到localStorage
    if (saveToStorage) {
      // 如果表单提交的数据需要同步到对应表单组件的dataSource.data中，可以在这里实现
      console.log('同步保存表单数据到页面配置...')

      // 查找当前数据对应的表单组件并更新其数据
      const formComponent = componentStore.findFormComponent(props.config.id)
      if (formComponent) {
        // 更新表单组件的静态数据
        formComponent.dataSource = {
          ...formComponent.dataSource,
          data: data, // 更新为当前提交的数据
        }

        // 更新组件存储中的组件
        componentStore.updateComponent(formComponent)
      }

      // 保存整个页面配置到localStorage
      const savedConfig = componentStore.savePageConfig()
      console.log('页面配置已保存到localStorage:', savedConfig)
      message.success('页面配置已保存')
    }
  }, 1000)
}

// 处理输入变化事件
const handleInputChange = (value: unknown) => {
  if (props.config.fieldName && props.config.type !== 'button') {
    console.log(`组件 ${props.config.type}(${props.config.id}) 值变化:`, value)
    // 通过store更新组件，避免直接修改props
    const component = componentStore.components.find((c) => c.id === props.config.id)
    if (component) {
      const updatedComponent = JSON.parse(JSON.stringify(component)) as Component
      updatedComponent.props = { ...updatedComponent.props, value }
      componentStore.updateComponent(updatedComponent)
    }
  }
}
</script>

<style lang="scss" scoped>
.component-renderer {
  position: relative;
  border: 1px solid transparent;

  &--selected {
    border: 1px dashed #1890ff;
  }

  &__actions {
    position: absolute;
    top: -30px;
    right: 0;
    background-color: #fff;
    border: 1px solid #eee;
    display: flex;
    z-index: 100;
  }

  &__dropable-area {
    min-height: 100px;
    width: 100%;
    background-color: #fafafa;
    border: 1px dashed #ddd;
    padding: 8px;
    margin-bottom: 8px;
  }

  &__row-container {
    background-color: rgba(24, 144, 255, 0.05);
    border: 1px dashed #1890ff;
  }

  &__empty-tip {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 14px;
  }

  &__inline-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
  }
}
</style>

<style>
/* 全局样式，解决Ant Design表单内联布局问题 */
.inline-form-item.ant-form-item {
  margin-right: 0;
  margin-bottom: 0;
  flex: 1;
  width: 100%;
}

.inline-form-item-wrapper {
  box-sizing: border-box;
}

.inline-form-item-wrapper .component-renderer {
  width: 100% !important;
}

.component-renderer__inline-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

/* 确保内联表单项正确对齐 */
.inline-form-item.ant-form-item .ant-form-item-label {
  white-space: nowrap;
}

.inline-form-item.ant-form-item .ant-form-item-control {
  flex: 1;
  width: 100%;
}

/* 确保内联表单项中的组件占据100%宽度 */
.inline-form-item-wrapper .component-renderer > * {
  width: 100%;
}
</style>
