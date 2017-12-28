import React, { PropTypes } from 'react'
import AEDecorator from 'ae/components/Decorator'
import { Modal } from 'fish'

export default function del (WrappedComponent) {
  return class AEComponentDecoratorDel extends AEDecorator {
    static propTypes = {
      params: PropTypes.object,
      entities: PropTypes.object
    }

    static defaultConfig = {
      label: '删除',
      title: '请确认',
      content: '确认删除？',
      disabled: false,
      shouldHookItem: () => true
    }

    initialize () {
      const { label, shouldHookItem } = this.config

      this.pushButton({
        label,
        scope: 'item',
        component: (id, entity, index) =>
          shouldHookItem(id, entity, index)
            // 插入链接
            ? <a key='del' href='javascript:;' onClick={() => {
              this._showConfirm(id, this.context.source.makeParams(entity))
            }}>{label}</a>
            : null
      })
    }

    _showConfirm (id, params) {
      const { title, content } = this.config
      Modal.confirm({
        title,
        content,
        onOk: () => this._doDelete(id, params)
      })
    }

    _doDelete (id, params) {
      const { onResponse } = this.config
      let ok
      let ko
      if (onResponse) {
        ko = ok = (...args) => {
          onResponse.apply(this, args)
        }
      }
      this.props.delete(id, { params }, ok, ko)
    }

    // @override
    // hookRender () {
    //   return super.hookRender()
    // }

    decoRender () {
      // 因为这个地址不会被激活，所以不会执行到这里
      // 此装饰器不存在 deco 的情况
    }
  }
}
