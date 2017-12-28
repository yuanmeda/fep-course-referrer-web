import React, { Component, PropTypes } from 'react'
import AEComponentBase from 'ae/components/Base'
import { generateElement } from 'ae/core/generator'
import { Form, Input, Button, Row, Col, Icon, message } from 'fish'
class LoginForm extends AEComponentBase {
  constructor () {
    super()
    this.retryCnt = 0
  }
  static propTypes = {
    form: PropTypes.object,
    session: PropTypes.object,
    code: PropTypes.string,
    getSession: PropTypes.func,
    getCode: PropTypes.func,
    post: PropTypes.func
  }
  getVerificationCode (refresh = true) {
    // 每次获取新的session
    this.props.getSession(refresh, session => {
      if (session && session.is_normal === false) {
        this.props.getCode(session.session_id)
      }
    })
  }

  componentDidMount () {
    this.getVerificationCode()
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      localStorage.user_id = values.name
      this.props.post({ data: values }, this.handleLoginOk, this.handleLoginKo)
    })
  }

  handleLoginOk = () => {
    // 获取用户信息
    this.props.detail()
  }

  handleLoginKo = () => {
    this.getVerificationCode()
  }

  handleVerifyCodeError = () => {
    // 只重试五次
    this.retryCnt += 1
    if (this.retryCnt <= 5) {
      this.getVerificationCode()
    } else {
      message.error('无法获取验证码，请刷新重试')
    }
  }

  render () {
    const { session, code, form: { getFieldDecorator } } = this.props
    return (
      <div className='page-login'>
        <div className='form-login'>
          <h1>任务编排系统</h1>
          <div className='input-set'>
            <form>
              <Form.Item>
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: '请输入用户名' }
                  ]
                })(<Input size='large' onPressEnter={this.handleOk} placeholder='用户名' />)}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('pass', {
                  rules: [
                    { required: true, message: '请输入密码' }
                  ]
                })(<Input size='large' type='password' onPressEnter={this.handleOk} placeholder='密码' />)}
              </Form.Item>
              {
                session.is_normal === false && code
                  ? <Form.Item>
                    {getFieldDecorator('code', {
                      rules: [
                        { required: true, message: '请输入验证码' }
                      ]
                    })(<VerificationCode code={code} onCodeError={this.handleVerifyCodeError} />)}
                  </Form.Item>
                  : null
              }
              <Row className='btn-login-set'>
                <Button type='primary' size='large' onClick={this.handleOk}>
                  登录
                </Button>
              </Row>
            </form>
          </div>
        </div>

      </div>
    )
  }
}

class VerificationCode extends Component {
  static propTypes = {
    value: React.PropTypes.string,
    code: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onCodeError: React.PropTypes.func
  }

  constructor () {
    super()
    this.state = {
      key: 0
    }
  }

  handleRefresh = () => {
    this.setState({
      key: this.state.key + 1
    })
  }

  handleImageError = () => {
    this.props.onCodeError()
  }

  render () {
    const codeUrl = `${this.props.code}?_=${this.state.key}`
    return (
      <Row gutter={16} className='verify-code'>
        <Col span={8}>
          <Input
            size='large'
            type='text'
            value={this.props.value}
            onChange={this.props.onChange}
            placeholder='验证码' />
        </Col>
        <Col span={10}>
          <img src={codeUrl} onError={this.handleImageError} />
        </Col>
        <Col span={6}>
          <Icon type='reload' title='看不清，换一张' onClick={this.handleRefresh} />
        </Col>
      </Row>
    )
  }
}

export default class Login extends Component {
  constructor (props) {
    super(props)
    // 保存实例，在 render 里 generateElement 的话，每次都会创建新的组件
    this.instance = generateElement({
      permission: -1, // 不需要登录
      component: Form.create()(LoginForm)
    })
  }
  render () {
    return this.instance
  }
}
