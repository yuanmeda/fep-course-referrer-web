/**
 * @function 定义在Dialog.tip({}),消息提示
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-25 21:29:25
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   content: '内容'
 *   duration: 2500  // 显示时长，默认2500ms
 * }
 * 注：params可为string类型，此时，直接为content内容
 */
import React from 'react'
import ReactDOM from 'react-dom'

export default function tip (props) {
  const div = document.createElement('div')
  document.body.appendChild(div)

  let propsConfig = {}
  if (typeof (props) === 'string') {
    propsConfig.content = props
  } else {
    propsConfig = props
  }

  const config = Object.assign({
    content: '',
    duration: 2500
  }, propsConfig)

  function destroy (...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div)
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div)
    }
  }

  function startTimer () {
    if (config.duration > 0) {
      setTimeout(() => {
        destroy()
      }, config.duration)
    }
  }

  function render (props: any) {
    ReactDOM.render(<div className='fep-tip' {...props}>{props.content}</div>, div)
  }

  startTimer()
  render({ ...config })

  return {
    destroy: destroy
  }
}
