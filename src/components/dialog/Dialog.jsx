/**
 * @function 封装fish Modal（自定义页脚）
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-21 11:26:44
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   同 http://fish-docs.dev.web.nd/components/modal-cn/
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import { Modal, Button } from 'fish'

@componentIntl('Dialog')
class Dialog extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    this.state = {
      config: Object.assign({
        wrapClassName: 'slp-ndui-modal',
        maskClosable: false,
        width: 920,
        style: {top: '8%'}
      }, props)
    }
  }

  componentWillReceiveProps (nextProps) {
    const { config } = this.state
    this.state = {
      config: Object.assign(config, nextProps)
    }
  }

  render () {
    const { config } = this.state
    const footer = []
    const buttonEnum = ['okText', 'cancelText']
    const buttonData = {
      'okText': <Button key='ok' type='primary' size='large' loading={config.confirmLoading} onClick={config.onOk}>{config.okText}</Button>,
      'cancelText': <Button key='cancel' size='large' onClick={config.onCancel}>{config.cancelText}</Button>
    }

    buttonEnum.forEach(item => {
      if (config[item]) {
        footer.push(buttonData[item])
      }
    })

    return <Modal {...config} footer={footer} />
  }
}

export default Dialog
