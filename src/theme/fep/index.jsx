import React, { Component, PropTypes } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import BreadCrumb from './components/BreadCrumb'
import Main from './components/Main'
import Aside from './components/Aside'
import Loading from './components/Loading'
import Footer from './components/footer'
import { message } from 'fish'

import './styles/index.css'

export default class Layout extends Component {
  static propTypes = {
    routes: PropTypes.any,
    params: PropTypes.any,
    children: PropTypes.element,
    globalMessage: PropTypes.object,
    authorized: PropTypes.any,
    get: PropTypes.func.isRequired,
    history: PropTypes.object,
    location: PropTypes.object,
    valid: PropTypes.func.isRequired
  }
  static defaultProps = {
    globalMessage: {}
  }
  getMessage (msg) {
    let msgObj = {}
    try {
      msgObj = JSON.parse(msg)
    } catch (e) {}
    return msgObj.message ? msgObj.message : msg
  }
  componentWillReceiveProps (nextProps) {
    const { globalMessage } = nextProps
    if (globalMessage && globalMessage.message && globalMessage !== this.props.globalMessage) {
      message.error(this.getMessage(globalMessage.message), 2)
    }
  }

  componentWillMount () {
    this.props.get() // 检查登录
    const { location, history } = this.props
    if (location.pathname === '/') {
      history.push('/tenant/list')
    }
  }
  componentDidUpdate () {
    const { location, history } = this.props
    if (location.pathname === '/') {
      history.push('/tenant/')
    }
  }
  render () {
    const { authorized, location, routes, params } = this.props
    if (authorized === undefined) {
      return <Loading />
    }
    if (!authorized) {
      return <Login {...this.props} />
    }
    return (location.pathname.indexOf('/project/grid') > -1) ? (
      <div className='page-container-fish'>
        <Header {...this.props} />
        <BreadCrumb routes={routes.filter(route => !!route.menu)} params={params} />
        <div className='main-container-fish main-container-home'>
          <Main>{this.props.children}</Main>
        </div>
        <Footer />
      </div>
    ) : (
      <div className='page-container-fish'>
        <Header {...this.props} />
        <BreadCrumb routes={routes.filter(route => !!route.menu)} params={params} />
        <div className='wrap-container-fish'>
          <div className='aside-container-fish'>
            <Aside {...this.props} />
          </div>
          <div className='main-container-fish'>
            {/* breadcrumb */}
            <Main>{this.props.children}</Main>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}
