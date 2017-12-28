/**
 * @function 定义Dialog.xx(Object)方法
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-22 11:03:25
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   ...同Dialog,
 *   content: 内容
 * }
 * 注：一般只用在./index中定义Dialog方法，模态弹窗请右转使用Dialog
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import Dialog from './Dialog'

const BaseDialog = props => {
  const config = Object.assign({
    width: 460,
    style: {top: '32%'}
  }, props)

  return <IntlProvider locale='en'>
    <Dialog {...config}>
      <span className='slp-ui-popup__icon slp-ui-popup__icon--warning' />
      <span className='slp-ui-popup__text'>{config.content}</span>
    </Dialog>
  </IntlProvider>
}

export default function base (config) {
  const div = document.createElement('div')
  document.body.appendChild(div)

  function destroy (...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div)
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div)
    }
  }

  function onCancel (...args: any[]) {
    destroy(...args)
    if (config.onCancel) {
      config.onCancel(...args)
    }
  }

  function onOk (...args: any[]) {
    destroy(...args)
    if (config.onOk) {
      config.onOk(...args)
    }
  }

  function render (props: any) {
    ReactDOM.render(<BaseDialog {...props} />, div)
  }

  render({ ...config, visible: true, onCancel: onCancel, onOk: onOk })

  return {
    destroy: destroy
  }
}
