import { Component } from 'react'
import { generateElement } from 'ae/core/generator'
import { Form } from 'fish'
import LoginForm from './LoginForm'

export default class Login extends Component {
  constructor (props, context) {
    super(props, context)
    // 保存实例，在 render 里 generateElement 的话，每次都会创建新的组件
    this.instance = generateElement({
      permission: -1, // 不需要登录
      component: Form.create()(LoginForm)
    }, this.props)
  }

  // 避免多次调用 render，使用 shouldComponentUpdate 进行优化？
  shouldComponentUpdate (nextProps, nextState) {
    return false
  }

  render () {
    return this.instance
  }
}
