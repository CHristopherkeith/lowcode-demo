import type { ComponentDefinition } from '@/types/lowcode.d'

// 容器组件
export const containerComponents: ComponentDefinition[] = [
  {
    type: 'row',
    name: '栅格行容器',
    icon: 'layout',
    defaultProps: {
      gutter: 16,
      justify: 'start',
      align: 'top',
      wrap: true,
    },
    propConfig: [
      {
        name: 'gutter',
        label: '列间距',
        type: 'number',
        defaultValue: 16,
      },
      {
        name: 'justify',
        label: '水平排列方式',
        type: 'select',
        defaultValue: 'start',
        options: [
          { label: '左对齐', value: 'start' },
          { label: '居中对齐', value: 'center' },
          { label: '右对齐', value: 'end' },
          { label: '两端对齐', value: 'space-between' },
          { label: '分散对齐', value: 'space-around' },
        ],
      },
      {
        name: 'align',
        label: '垂直对齐方式',
        type: 'select',
        defaultValue: 'top',
        options: [
          { label: '顶部对齐', value: 'top' },
          { label: '居中对齐', value: 'middle' },
          { label: '底部对齐', value: 'bottom' },
        ],
      },
      {
        name: 'wrap',
        label: '自动换行',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
  {
    type: 'col',
    name: '栅格列容器',
    icon: 'column-width',
    defaultProps: {
      span: 12,
      offset: 0,
    },
    propConfig: [
      {
        name: 'span',
        label: '列宽',
        type: 'number',
        defaultValue: 12,
      },
      {
        name: 'offset',
        label: '列偏移',
        type: 'number',
        defaultValue: 0,
      },
      {
        name: 'flex',
        label: '弹性布局',
        type: 'string',
        defaultValue: '',
      },
    ],
  },
]

// 基础表单组件
export const basicComponents: ComponentDefinition[] = [
  {
    type: 'input',
    name: '输入框',
    icon: 'form',
    defaultProps: {
      placeholder: '请输入内容',
      allowClear: true,
    },
    propConfig: [
      {
        name: 'placeholder',
        label: '占位提示',
        type: 'string',
        defaultValue: '请输入内容',
      },
      {
        name: 'allowClear',
        label: '允许清除',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
  {
    type: 'select',
    name: '下拉选择框',
    icon: 'select',
    defaultProps: {
      placeholder: '请选择',
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
      ],
      allowClear: true,
    },
    propConfig: [
      {
        name: 'placeholder',
        label: '占位提示',
        type: 'string',
        defaultValue: '请选择',
      },
      {
        name: 'allowClear',
        label: '允许清除',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
  {
    type: 'datePicker',
    name: '日期选择器',
    icon: 'calendar',
    defaultProps: {
      placeholder: '请选择日期',
      format: 'YYYY-MM-DD',
    },
    propConfig: [
      {
        name: 'placeholder',
        label: '占位提示',
        type: 'string',
        defaultValue: '请选择日期',
      },
      {
        name: 'format',
        label: '日期格式',
        type: 'string',
        defaultValue: 'YYYY-MM-DD',
      },
    ],
  },
  {
    type: 'radio',
    name: '单选框',
    icon: 'radio',
    defaultProps: {
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
      ],
    },
    propConfig: [
      {
        name: 'options',
        label: '选项列表',
        type: 'select',
        defaultValue: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
        ],
      },
    ],
  },
  {
    type: 'checkbox',
    name: '复选框',
    icon: 'check-square',
    defaultProps: {
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
      ],
    },
    propConfig: [
      {
        name: 'options',
        label: '选项列表',
        type: 'select',
        defaultValue: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
        ],
      },
    ],
  },
  {
    type: 'button',
    name: '按钮',
    icon: 'button',
    defaultProps: {
      text: '按钮',
      type: 'primary',
    },
    propConfig: [
      {
        name: 'text',
        label: '按钮文本',
        type: 'string',
        defaultValue: '按钮',
      },
      {
        name: 'type',
        label: '按钮类型',
        type: 'select',
        defaultValue: 'primary',
        options: [
          { label: '主按钮', value: 'primary' },
          { label: '次按钮', value: 'default' },
          { label: '虚线按钮', value: 'dashed' },
          { label: '文本按钮', value: 'text' },
          { label: '链接按钮', value: 'link' },
        ],
      },
    ],
  },
]

// 高级组件
export const advancedComponents: ComponentDefinition[] = [
  {
    type: 'form',
    name: '表单',
    icon: 'form',
    defaultProps: {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    },
    propConfig: [
      {
        name: 'labelCol',
        label: '标签列宽',
        type: 'number',
        defaultValue: 6,
      },
      {
        name: 'wrapperCol',
        label: '控件列宽',
        type: 'number',
        defaultValue: 18,
      },
    ],
  },
  {
    type: 'table',
    name: '表格',
    icon: 'table',
    defaultProps: {
      columns: [
        { title: '列1', dataIndex: 'col1', key: 'col1' },
        { title: '列2', dataIndex: 'col2', key: 'col2' },
      ],
      pagination: { pageSize: 10 },
    },
    propConfig: [
      {
        name: 'columns',
        label: '表格列',
        type: 'select',
        defaultValue: [
          { title: '列1', dataIndex: 'col1', key: 'col1' },
          { title: '列2', dataIndex: 'col2', key: 'col2' },
        ],
      },
      {
        name: 'pagination',
        label: '分页设置',
        type: 'select',
        defaultValue: { pageSize: 10 },
      },
    ],
  },
  {
    type: 'chart',
    name: '图表',
    icon: 'bar-chart',
    defaultProps: {
      chartType: 'bar',
      height: 400,
      legendVisible: true,
    },
    propConfig: [
      {
        name: 'chartType',
        label: '图表类型',
        type: 'select',
        defaultValue: 'bar',
        options: [
          { label: '柱状图', value: 'bar' },
          { label: '折线图', value: 'line' },
          { label: '饼图', value: 'pie' },
        ],
      },
      {
        name: 'height',
        label: '图表高度',
        type: 'number',
        defaultValue: 400,
      },
      {
        name: 'legendVisible',
        label: '显示图例',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
]
