import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import isError from 'lodash/isError'
import normalizeButtons from 'ae/core/normalizers/buttons'
import AEDecorator from 'ae/components/Decorator'
import Form from 'ae/components/Form'
import hasOwn from 'ae/shared/has-own'
import { Modal } from 'fish'

function getDefaultButtons (reset, submit) {
  return normalizeButtons([{
    style: 'ghost',
    type: 'reset',
    action: 'reset',
    label: reset
  }, {
    style: 'primary',
    type: 'submit',
    action: 'patch',
    label: submit
  }])
}

export default function edit (WrappedComponent) {
  return class AEComponentDecoratorEdit extends AEDecorator {
    static propTypes = {
      params: PropTypes.object,
      entities: PropTypes.object
    }

    static defaultConfig = {
      label: '编辑',
      component: Form,
      disabled: false,
      modal: false,
      // 是否采用乐观的数据策略，即仅在当前无数据时查询，否则总是查询
      optimistic: false,
      shouldHookItem: () => true
    }

    initialize () {
      const { label, modal, buttons, shouldHookItem, onResponse } = this.config

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

      if (!buttons) {
        this.config.buttons = getDefaultButtons(
          this.__('reset', {}, '重置'),
          this.__('submit', {}, '提交')
        )
      }

      if (onResponse === undefined) {
        this.config.onResponse = modal
          // 弹窗
          ? payload => {
            if (!isError(payload)) {
              this.setState({ key: '' })
            }
          }
          // 新页面
          : payload => {
            if (!isError(payload)) {
              // 编辑成功跳转到上一级页面，带查询串
              this.redirect(JSON.parse(this.props.location.query._e))
            }
          }
      }
    }

    makeLink (id, entity) {
      const { label, modal } = this.config
      // 查询参数
      const params = this.context.source.makeParams(entity)
      // _e 为回退用到的参数
      return modal
        // 弹窗
        ? <a key='edit' href='javascript:;' onClick={() => { this._doQuery(id, params, this.props) }}>{label}</a>
        // 跳址
        : <Link key='edit' to={this.context.route.format({ id, deco: 'edit' }, Object.assign(params, { _e: JSON.stringify(this.props.location.query) }))}>{label}</Link>
    }

    componentWillMount () {
      if (this.state.active) {
        // 用于不经过列表直接进入编辑页面
        this._doQuery(this.props.params.id, this.props.location.query, this.props)
      } else {
        // 仅在激活状态下生成 key
        // this._updateKey(this.props.params.id, this.props.location.query)
      }
    }

    componentWillUpdate (nextProps, nextState) {
      if (!this.state.active && nextState.active) {
        this._doQuery(nextProps.params.id, nextProps.location.query, nextProps)
      }
    }

    // 更新当前 entity 对应的 key
    _updateKey (id, params, onResponse) {
      this.setState({
        key: this.context.source.makeKey(id, params)
      }, onResponse)
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
      const { key } = this.state
      // 关闭弹窗，自动销毁
      return (
        <div className='ae-grid-edit'>
          {modal && key && <Modal wrapClassName='ae-grid-edit-dialog'
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
      const { component: Comp, modal, ...restConfig } = this.config
      const { key } = this.state

      return (
        key ? <Comp {...this.props}
          config={restConfig}
          entity={this._getEntity(this.props) || {}} /> : null
      )
    }
  }
}
