import React, { PropTypes } from 'react'
import { locationShape } from 'react-router'
import isObject from 'lodash/isObject'
import ComponentBase from 'ae/components/Base'
import AuthLogin from './components/AuthLogin'
import Login from './components/Login'
import Progress from './components/Progress'
import Header from './components/Header'
import BreadCrumb from './components/BreadCrumb'
import Main from './components/Main'
import Aside from './components/Aside'
import Loading from './components/Loading'
import { message } from 'fish'

import './styles/index.css'

export default class Layout extends ComponentBase {
  static propTypes = {
    location: locationShape.isRequired,
    routes: PropTypes.any,
    params: PropTypes.any,
    children: PropTypes.element,
    globalLoading: PropTypes.bool.isRequired,
    globalMessage: PropTypes.object,
    authorized: PropTypes.any,
    get: PropTypes.func.isRequired,
    valid: PropTypes.func.isRequired
  }

  static defaultProps = {
    globalMessage: {}
  }

  getMessage (msg) {
    let msgObj = {}

    if (isObject(msg)) {
      msgObj = msg
    } else {
      try {
        msgObj = JSON.parse(msg)
      } catch (e) { }
    }

    // 使用 react-intl
    if (msgObj.code) {
      return this.__(msgObj.code, {}, msgObj.message)
    }

    return msgObj.message || msg
  }

  componentWillReceiveProps (nextProps) {
    const { globalMessage } = nextProps

    if (globalMessage && globalMessage.message && globalMessage !== this.props.globalMessage) {
      message.error(this.getMessage((globalMessage.response && globalMessage.response.data) || globalMessage.message), 2)
    }
  }

  componentWillMount () {
    this.props.get() // 检查登录
  }

  render () {
    const { location: { query }, valid, thirdLoginSso } = this.props
    if (query.auth) {
      return <AuthLogin query={query} valid={valid} thirdLoginSso={thirdLoginSso} />
    }

    const { authorized } = this.props
    if (authorized === undefined) {
      return <Loading />
    } else if (this.props.authorized === false) {
      return <Login {...this.props} />
    }

    const { routes, params } = this.props
    const className = top === self
      ? 'ae-layout'
      : 'ae-layout embed'

    return (
      <div className={className}>
        <Progress show={this.props.globalLoading} />
        <div className='ae-layout-aside-wrapper'>
          <Aside {...this.props} />
        </div>
        <div className='ae-layout-main-wrapper'>
          <Header {...this.props} />
          <BreadCrumb routes={routes.filter(route => !!route.menu || !!route.bread)} params={params} />
          <Main>{this.props.children}</Main>
        </div>
      </div>
    )
  }
}
