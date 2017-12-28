import React, { PropTypes } from 'react'
import { locationShape } from 'react-router'
import isEqual from 'lodash/isEqual'
import { componentIntl } from 'ae/core/intl'
import AEComponentBase from 'ae/components/Base'
import { RENDER_STATE } from 'ae/components/Field'
import { contextTypes } from 'ae/core/shapes'
import { Table } from 'fish'

@componentIntl('AE.Grid')
export default class AEComponentGrid extends AEComponentBase {
  static contextTypes = contextTypes

  static propTypes = {
    location: locationShape,
    params: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    defaultQuery: PropTypes.object
  }

  static defaultProps = {
    config: {},
    defaultQuery: {}
  }

  constructor (props, context) {
    super(props, context)

    this.state = {
      selectedRowKeys: []
    }

    this._query = {}
    this._buttons = this._getButtons('list')
    this._columns = this._getColumns()
  }

  _getColumns () {
    const { schema } = this.context
    // config 来自 list
    const { config } = this.props
    const fields = schema.getFields(config.fields, field => !field.hidden)
      .map(field => {
        const { label: title, key, sortable, component, ...restConfig } = field
        // 混入更多配置项
        return Object.assign(restConfig, {
          title,
          key,
          dataIndex: key,
          render: (text, entity, index) => component({
            entity,
            index,
            field,
            renderState: RENDER_STATE.DISPLAY,
            __isFromGrid: true
          }),
          sorter: !!sortable
        })
      })

    // 只取 scope 为 item 的 button
    const buttons = this._getButtons('item')
    if (buttons.length) {
      fields.push({
        title: this.__('operate', {}, '操作'),
        key: `action-${schema.primary}`,
        dataIndex: schema.primary,
        className: 'ae-grid-item-buttons',
        render: (...args) => buttons.map(button => button.component.apply(this, args))
      })
    }
    return fields
  }

  _getButtons (scope) {
    const { buttons = [] } = this.context.ae
    return buttons.filter(button => button.scope === scope)
  }

  // TODO 是不是应该放到 list？
  _getRowSelection () {
    const { checkable } = this.props.config
    return checkable ? {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({
          selectedRowKeys
        })
      }
    } : null
  }

  _getList (q = {}) {
    const { location: { query }, defaultQuery } = this.props
    const _query = { ...defaultQuery, ...query, ...q }
    const params = Object.keys(_query)
      // 空字符串不参与查询
      .filter(key => _query[key] !== null)
      .reduce((obj, key) => {
        obj[key] = _query[key]
        return obj
      }, {})
    // 存储用于下次比较
    this._query = q
    if (this.props.list) {
      // 获取列表数据
      this.props.list({ params })
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('你是不是忘记配置 source 了？')
      }
    }
  }

  // TODO componentWillMount？
  componentDidMount () {
    if (!this.props.params.deco) {
      this._getList(this.props.location.query)
    }
  }

  componentWillReceiveProps (nextProps) {
    const { location: { query = {} } } = nextProps
    if (this._query && !isEqual(this._query, query)) {
      // 延迟执行，否则 location.query 不刷新
      setTimeout(() => {
        this._getList(query)
        this.setState({
          selectedRowKeys: []
        })
      }, 0)
    } else {
      if (this.props.result !== nextProps.result) {
        const selectedRowKeys = []
        nextProps.result.forEach(id => {
          if (this.state.selectedRowKeys.includes(id)) {
            selectedRowKeys.push(id)
          }
        })
        this.setState({
          selectedRowKeys
        })
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props.result, nextProps.result) ||
      !isEqual(this.props.entities, nextProps.entities) ||
      !isEqual(this.state, nextState)
  }

  onChange (sorter) {
    const { field, order } = sorter
    if (field) {
      this.context.route.query({
        ...this.props.location.query,
        $orderby: `${field} ${order === 'descend' ? 'desc' : 'asc'}`
      })
    }
  }

  _getRowKey = item => {
    const { schema } = this.context
    return schema.primaryKey.length > 1
      ? schema.primaryKey.map(key => item[key]).join('#')
      : item[schema.primaryKey[0]]
  }

  render () {
    const { result = [], entities = {}, config } = this.props

    return (
      <div className='ae-grid'>
        <div className='ae-grid-buttons'>
          {this._buttons.map(button => button.component.call(this, this.state, this.props))}
        </div>
        <Table
          {...config}
          rowSelection={this._getRowSelection()}
          columns={this._columns}
          rowKey={this._getRowKey}
          dataSource={result.map(key => entities[key])}
          pagination={false}
          onChange={(pagination, filters, sorter) => this.onChange(sorter)} />
      </div>
    )
  }
}
