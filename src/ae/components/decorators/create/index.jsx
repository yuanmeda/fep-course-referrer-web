import React, { PropTypes } from 'react'
import isError from 'lodash/isError'
import AEDecorator from 'ae/components/Decorator'
import Form from 'ae/components/Form'
import { Modal } from 'fish'

export default function create (WrappedComponent) {
  return class AEComponentDecoratorCreate extends AEDecorator {
    static propTypes = {
      params: PropTypes.object
    }

    static defaultConfig = {
      label: '新建',
      component: Form,
      disabled: false
    }

    initialize () {
      const { label, modal, onResponse } = this.config
      this.pushButton({
        action: () => this.handleAction(),
        label,
        scope: 'list'
      })

      if (onResponse === undefined) {
        this.config.onResponse = modal ? payload => {
          if (!isError(payload)) {
            this.setState({ visible: false })
            // 回到首页
            this.redirect()
          }
        } : payload => {
          if (!isError(payload)) {
            // 回到首页
            this.redirect()
          }
        }
      }
    }

    handleAction () {
      const { modal } = this.config
      if (modal) {
        this.setState({
          visible: true
        })
      } else {
        this.context.route.push(Object.assign({}, this.props.params, {
          deco: 'create'
        }))
      }
    }

    // @override
    hookRender () {
      const { label } = this.config
      const { visible } = this.state
      // 关闭弹窗，自动销毁
      return (
        <div className='ae-grid-create'>
          {visible && <Modal wrapClassName='ae-grid-create-dialog'
            visible
            title={label}
            footer={null}
            onCancel={() => this.setState({ visible: false })}>
            {this.decoRender()}
          </Modal>}
          {super.hookRender()}
        </div>
      )
    }

    // @override
    decoRender () {
      // 大写开头！
      const { component: Comp, modal, ...restConfig } = this.config

      return (
        <Comp {...this.props}
          config={restConfig} />
      )
    }
  }
}
