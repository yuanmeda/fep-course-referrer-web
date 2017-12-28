import React, { PropTypes } from 'react'
import ComponentBase from 'ae/components/Base'
import buildField from 'ae/shared/build-field'
import { Button, Row, message } from 'fish'
import Captcha from './Captcha'
import logo from '../images/logo.png'

export default class LoginForm extends ComponentBase {
  constructor () {
    super()
    this.retryCnt = 0
  }

  static propTypes = {
    form: PropTypes.object,
    authSession: PropTypes.object,
    authCode: PropTypes.string,
    getSession: PropTypes.func,
    getCode: PropTypes.func,
    post: PropTypes.func,
    detail: PropTypes.func
  }

  getCaptcha (refresh = true) {
    // 每次获取新的 authSession
    this.props.getSession(refresh, session => {
      if (session && session.is_normal === false) {
        this.props.getCode(session.session_id)
      }
    })
  }

  // TODO componentWillMount？
  componentDidMount () {
    this.getCaptcha()
  }

  handleSubmit = e => {
    e && e.preventDefault && e.preventDefault()
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      this.props.post({ data: values }, this.handleLoginOk, this.handleLoginKo)
    })
  }

  handleLoginOk = () => {
    // 获取用户信息
    this.props.detail()
  }

  handleLoginKo = () => {
    // 登录失败，刷新验证码
    this.getCaptcha()
  }

  handleCaptchaError = () => {
    // 只重试五次
    this.retryCnt += 1
    if (this.retryCnt <= 5) {
      this.getCaptcha()
    } else {
      message.error(this.__('login.captcha.error'))
    }
  }

  render () {
    const { authSession, authCode, form } = this.props
    form.formItemLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 }
    }
    return (
      <div className='login-container'>
        <div className='logo'>
          {/* TODO 使用配置的logo和名称 */}
          <img alt={'logo'} src={logo} />
          {this.__('system.name')}
        </div>
        <form onSubmit={this.handleSubmit}>
          {
            buildField({
              name: 'name',
              label: null,
              placeholder: this.__('login.name'),
              required: this.__('login.please.name'),
              componentConfig: {
                size: 'large'
              }
            }, {}, form)
          }
          {
            buildField({
              name: 'pass',
              label: null,
              placeholder: this.__('login.pass'),
              required: this.__('login.please.pass'),
              component: 'FieldPassword',
              componentConfig: {
                size: 'large'
              }
            }, {}, form)
          }
          {
            authSession.is_normal === false && authCode
              ? buildField({
                name: 'code',
                label: null,
                required: this.__('login.please.code'),
                // 因为：https://github.com/react-component/form/issues/103
                // 所以：通过 componentConfig 将参数传入
                // TODO 基于 Field？移动到 components/Fields/Captcha？
                component: Captcha,
                componentConfig: {
                  title: this.__('login.captcha.reload'),
                  placeholder: this.__('login.captcha'),
                  size: 'large',
                  authCode,
                  onCodeError: this.handleCaptchaError
                }
              }, {}, form)
              : null
          }
          <Row>
            <Button type='primary' htmlType='submit' size='large'>
              {this.__('login')}
            </Button>
          </Row>
        </form>
      </div>
    )
  }
}
