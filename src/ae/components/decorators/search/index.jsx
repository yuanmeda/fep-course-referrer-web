import React from 'react'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import identity from 'lodash/identity'
import normalizeButtons from 'ae/core/normalizers/buttons'
import AEDecorator from 'ae/components/Decorator'
import Form from 'ae/components/Form'
import filterString from 'filter-string'

// TODO 路由刷新时，搜索表单应该根据路由上的参数重置
export default function search (WrappedComponent) {
  return class AEComponentDecoratorSearch extends AEDecorator {
    static defaultConfig = {
      label: '搜索',
      formConfig: {
        layout: 'inline'
      },
      formItemLayout: {
        labelCol: null,
        wrapperCol: null
      },
      component: Form,
      transformer: identity,
      disabled: false
    }

    initialize () {
      const { label, buttons, fields, transformer } = this.config
      const { schema } = this.context

      if (!buttons) {
        this.config.buttons = normalizeButtons([{
          action () {
            this.handleSubmit()
          },
          label
        }])
      }

      if (!fields) {
        this.config.fields = schema.keys
          .filter(key => !schema.getField(key).hidden)
          .map(key => [key, { description: null }])
      } else if (isArray(fields)) { // fields 可能为字符串数组
        this.config.fields = fields.map(field => {
          if (!isArray(field)) {
            return [field, { description: null }]
          } else {
            return field
          }
        })
      } else {
        throw new TypeError('Invalid fields from search')
      }

      this.query = {}

      // 将当前的过滤选项回填到表单中
      const { $filter } = this.props.location.query
      const filters = transformer(filterString.parse($filter), 'IN')
      this.config.fields.forEach(field => {
        const [ key, fieldConfig = {} ] = field
        const { op = 'eq' } = fieldConfig
        const filter = filters.find(filter => filter.key === key && filter.op === op)
        if (filter && filter.value !== undefined && filter.value !== null) {
          const rawField = schema.getField(key)
          let value = filter.value
          // 对 array 特殊处理，因为来自 $filter 的值是字符串
          if (rawField.type === 'array') {
            value = value.split(',')
          }
          fieldConfig.defaultValue = value
        }
        field[1] = fieldConfig
      })
    }

    // @override
    componentWillReceiveProps (nextProps) {
      const { $filter } = nextProps.location.query
      if (!$filter) {
        this.query = {}
      }
    }

    onSubmit (entity) {
      const { fields, transformer } = this.config
      const { schema } = this.context
      // 过滤空的搜索条件以及支持外部自定义配置操作符
      const filters = Object.entries(entity)
        .filter(([key, value]) => value)
        .map(([key, value]) => {
          const field = fields.find(([k]) => k === key)
          const op = (field && field[1].op) || 'eq'
          const rawField = schema.getField(key)
          // 对 array 特殊处理，空数据移除
          // 否则会报类型错误，因为在这里会被字符串化
          if (rawField.type === 'array' && isArray(value) && value.every(isEmpty)) {
            value = ''
          }
          return { key, op, value }
        })
        .filter(item => !isEmpty(item))

      const $filter = filterString.stringify(transformer(filters, 'OUT'))
      // 为空时，必须使用 undefined
      // 因为空会多一次跳转，而移除则会不刷新
      this.query.$filter = $filter || undefined

      const { $orderby } = this.props.location.query
      if ($orderby) {
        this.query.$orderby = $orderby
      }
      this.forceUpdate()
    }

    // @override
    hookRender () {
      const { component: Comp, ...restConfig } = this.config
      const query = { ...this.query }

      return (
        <div className='ae-grid-search'>
          <div className='ae-grid-search-content'>
            <Comp {...this.props} config={restConfig}
              onSubmit={entity => { this.onSubmit(entity) }} />
          </div>
          {super.hookRender({ query })}
        </div>
      )
    }
  }
}
