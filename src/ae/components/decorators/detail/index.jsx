import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import normalizeButtons from 'ae/core/normalizers/buttons'
import AEDecorator from 'ae/components/Decorator'
import Form from 'ae/components/Form'
import hasOwn from 'ae/shared/has-own'
import { Modal } from 'fish'

function getDefaultButtons (back) {
  return normalizeButtons([{
    action () {
      this.redirect(JSON.parse(this.props.location.query._e))
    },
    label: back
  }])
}

// 不能使用 shouldComponentUpdate
// 如果要用，要考虑对其它装饰器的影响

export default function detail (WrappedComponent) {
  return class AEComponentDecoratorDetail extends AEDecorator {
    static propTypes = {
      params: PropTypes.object,
      entities: PropTypes.object
    }

    static defaultConfig = {
      label: '详情',
      component: Form,
      disabled: false,
      modal: false,
      // 是否采用乐观的数据策略，即仅在当前无数据时查询，否则总是查询
      optimistic: false,
      shouldHookItem: () => true,
      // 是否采用 button 形式
      useBtn: false
    }

    initialize () {
      const { entry, label, modal, buttons, useBtn, shouldHookItem, fields } = this.config
      const { source: { id: idKey }, schema } = this.context

      const field = schema.getField(entry || idKey)
      if (useBtn) {
        this.pushButton({
          label,
          scope: 'item',
          // id, entity, index
          component: (id, entity, index) =>
            shouldHookItem(id, entity, index)
              // 插入链接
              ? this.makeLink(id, entity)
              : null
        })
      } else if (field) {
        // 因为 field.component 是引用，所以要避免重复 wrapping
        if (!field.__component) {
          field.__component = field.component
          field.component = _params => {
            const _label = _params.field.__component(_params)
            const { entity, index, __isFromGrid } = _params
            const { id = entity[idKey] } = _params
            if (__isFromGrid && shouldHookItem(id, entity, index)) {
              return this.makeLink(id, entity, _label)
            } else {
              return _label
            }
          }
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`装饰器 detail 缺少入口字段，或者 useBtn 为 false`)
        }
      }

      if (!buttons) {
        this.config.buttons = modal ? [] : getDefaultButtons(
          this.__('back', {}, '返回')
        )
      }

      if (!fields) {
        this.config.fields = schema.keys
          .filter(key => !schema.getField(key).hidden)
          .map(key => [key, { readonly: true, description: null }])
      }
    }

    makeLink (id, entity, _label) {
      const { source } = this.context
      const { label, modal } = this.config
      // 查询参数
      const params = source.makeParams(entity)
      // _e 为回退用到的参数
      return modal
        // 弹窗
        ? <a key='detail' href='javascript:;' onClick={() => { this._doQuery(id, params, this.props) }}>{_label || label}</a>
        // 跳址
        : <Link key='detail' to={this.context.route.format({ id, deco: 'detail' }, Object.assign(params, { _e: JSON.stringify(this.props.location.query) }))}>{_label || label}</Link>
    }

    componentWillMount () {
      // 仅在激活状态下生成 key
      if (this.state.active) {
        // 用于不经过列表直接进入编辑页面
        this._doQuery(this.props.params.id, this.props.location.query, this.props)
      }
    }

    componentWillUpdate (nextProps, nextState) {
      if (!this.state.active && nextState.active) {
        this._doQuery(nextProps.params.id, nextProps.location.query, nextProps)
      }
    }

    // 更新当前 entity 对应的 key
    _updateKey (id, params, callback) {
      this.setState({
        key: this.context.source.makeKey(id, params)
      }, callback)
    }

    // TODO 是否要移到表单里？
    _doQuery (id, params, props) {
      this._updateKey(id, params, () => {
        // 放到回调里，保证 state 是最新的
        const { optimistic } = this.config
        // 非乐观策略或者没有数据时，获取数据
        if (!optimistic || !this._getEntity(props)) {
          this.props.get(id, { params })
        }
      })
    }

    _getEntity (props) {
      const { key } = this.state
      const { entities } = props
      if (key && hasOwn(entities, key)) {
        return entities[key]
      }
      return null
    }

    // @override
    hookRender () {
      const { label, modal } = this.config
      // modal 模式下，使用 key 来判断当前是否激活
      const { key } = this.state
      return (
        <div className='ae-grid-detail'>
          {modal && key && <Modal wrapClassName='ae-grid-detail-dialog'
            visible
            title={label}
            footer={null}
            onCancel={() => this.setState({ key: '' })}>
            {this.decoRender()}
          </Modal>}
          {super.hookRender()}
        </div>
      )
    }

    // @override
    decoRender () {
      const { component: Comp, modal, ...config } = this.config
      const { key } = this.state

      return (
        key ? <Comp {...this.props}
          config={config}
          entity={this._getEntity(this.props) || {}} /> : null
      )
    }
  }
}
