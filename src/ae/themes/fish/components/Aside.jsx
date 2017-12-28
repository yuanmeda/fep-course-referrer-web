import React, { PropTypes } from 'react'
import ComponentBase from 'ae/components/Base'
import { Menu, Icon } from 'fish'
import rbac from 'ae/core/rbac'
import menus from 'ae/store/menus'
import { IndexLink, Link, formatPattern } from 'react-router'
import logo from '../images/logo.png'

// TODO 将 menus 独立一个文件

export default class Aside extends ComponentBase {
  static propTypes = {
    location: PropTypes.object,
    params: PropTypes.object
  }

  constructor (props, context) {
    super(props, context)
    this.state = this.getMenuState(props)
    // 不要在 render 里获取国际化
    this.i18ns = {
      system_name: this.__('system.name'),
      back_2_home: this.__('back_2_home')
    }
  }

  getMenuState (props) {
    const openKeys = this.getParentMenus(props)
    return {
      openKeys,
      selectedKeys: openKeys.length
        ? openKeys.slice(openKeys.length - 1)
        : []
    }
  }

  /**
   * 查找祖先路由
   */
  getParentMenus (props) {
    const current = props.location.pathname
    const searchStack = []
    const search = items => {
      for (let i = 0, len = items.length; i < len; i++) {
        const { children, path } = items[i]
        // 如果被当前路径所包含，说明需要展开
        if (this.contains(path, current, props.params)) {
          searchStack.push(path)
          if (children) {
            search(children)
          }
          return true
        }
        // 如果儿子被包含，则父亲也应该被包含
        if (children) {
          if (search(children)) {
            searchStack.push(path)
            return true
          }
        }
      }
      return false
    }

    search(menus)
    return searchStack
  }

  contains (path, current, params) {
    path = this.formatPattern(path, params)
    if (path) {
      const re = /\/_m\/|\/_[afg]\//g
      current = current.replace(re, '/')
      path = path.replace(re, '/')
      return current.indexOf(path) === 0
    }
    return false
  }

  formatPattern (pattern, params) {
    try {
      // formatPattern 可能报错
      return formatPattern(pattern, this.getRestParams(params || this.props.params))
    } catch (e) {
      return null
    }
  }

  formatTitleWithIcon (title, icon) {
    if (!icon) {
      return title
    }

    return <span><Icon type={icon} /><span>{title}</span></span>
  }

  renderSubMenu (title, path, icon, children) {
    const _path = this.formatPattern(path)
    const _title = this.formatPattern(title)
    return (_path === null || _title === null) ? null : (
      <Menu.SubMenu key={path} title={this.formatTitleWithIcon(_title, icon)}
        onTitleClick={this.handleSubMenuClick}>
        {this.renderMenus(children)}
      </Menu.SubMenu>
    )
  }

  renderMenuItem (title, path, icon) {
    const _path = this.formatPattern(path)
    const _title = this.formatPattern(title)
    return (_path === null || _title === null) ? null : (
      <Menu.Item key={path}>
        <Link to={_path}>{this.formatTitleWithIcon(_title, icon)}</Link>
      </Menu.Item>
    )
  }

  renderMenus (menus) {
    return menus
      .filter(({ permission }) => rbac.checkAuth(this.props, permission) === 0)
      .map(({title, path, icon, children}) => {
        return children && children.length
          ? this.renderSubMenu(title, path, icon, children)
          : this.renderMenuItem(title, path, icon)
      }).filter(i => !!i)
  }

  getRestParams (params) {
    /* eslint-disable */
    // 过滤掉 deco, id, act
    const { deco, id, act, ...restParams } = params
    /* eslint-enable */
    return restParams
  }

  handleSubMenuClick = ({ key }) => {
    window.location.hash = `#${this.formatPattern(key)}`
    this.setState({
      selectedKeys: []
    })
  }

  handleClick = e => {
    this.setState({
      openKeys: e.keyPath,
      selectedKeys: [e.key]
    })
  }

  handleOpenChange = openKeys => {
    this.setState({ openKeys })
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      // TODO 每次路由变化都要递归，耗时操作！
      this.setState(this.getMenuState(nextProps))
    }
  }

  render () {
    const { openKeys, selectedKeys } = this.state
    const { system_name, back_2_home } = this.i18ns
    return (
      <aside className='ae-layout-aside'>
        <div className='logo'>
          <IndexLink to='/' title={back_2_home}>
            <img alt='' src={logo} />
            <span>{system_name}</span>
          </IndexLink>
        </div>
        <Menu
          onClick={this.handleClick}
          theme='dark'
          onOpenChange={this.handleOpenChange}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          mode='inline'>
          {this.renderMenus(menus)}
        </Menu>
      </aside>
    )
  }
}
