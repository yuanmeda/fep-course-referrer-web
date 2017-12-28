import React, { Component, PropTypes } from 'react'
import { Menu } from 'fish'
import menus from 'ae/store/menus'
import { Link, formatPattern } from 'react-router'
const SubMenu = Menu.SubMenu

export default class Aside extends Component {
  constructor (props, context) {
    super(props, context)
    const currentRoute = props.location.pathname
    this.flatLinks = this.flattenLinks(menus)
    this.state = this.getMenuState(menus, currentRoute)
  }

  static propTypes = {
    location: PropTypes.object,
    params: PropTypes.object
  }

  flattenLinks (menus) {
    let result = []
    menus.forEach(item => {
      result.push(item)
      if (item.children && item.children.length) {
        result = result.concat(this.flattenLinks(item.children))
      }
    })
    return result
  }

  getMenuState (menus, current) {
    const openKeys = this.getParentMenus(menus, current)
    return {
      openKeys,
      selectedKeys: openKeys.length
        ? openKeys.slice(openKeys.length - 1)
        : []
    }
  }

  match (path, current) {
    current = current.replace(/\/$/, '')
    if (path.indexOf(':') !== -1) {
      // 路由含有变量，正则匹配
      // /mypage(/:deco(/:id(/:action))) -> /\/mypage(.+(.+(.+)?)?)?/
      const pattern = new RegExp(path.replace(/:[^/()]+/g, '.+').replace(/\)/g, ')?').replace(/\//g, '\\/'))
      return pattern.test(current)
    } else {
      return path === current
    }
  }

  findRoute (items, current) {
    let result
    items.some(({ path }) => {
      if (this.match(path, current)) {
        result = path
        return true
      }
    })
    return result
  }

  /**
   * 查找祖先路由
   * @param {*} menus
   * @param {*} current - 当前路由
   */
  getParentMenus (menus, current) {
    const searchStack = []

    const search = items => {
      for (let i = 0, len = items.length; i < len; i++) {
        const { children, path } = items[i]
        if (this.match(path, current)) {
          searchStack.push(path)
          return true
        }
        if (!children) {
          continue
        }
        searchStack.push(path)
        const found = this.findRoute(children, current)
        if (found) {
          searchStack.push(found)
          return true
        } else {
          if (!search(children)) {
            searchStack.pop()
          } else {
            return true
          }
        }
      }
      return false
    }

    search(menus)
    return searchStack
  }

  formatPattern (path, params) {
    try {
      // formatPattern 可能报错
      return formatPattern(path, params)
    } catch (e) {
      return null
    }
  }

  renderMenuItem ({ title, path }) {
    /* eslint-disable */
    // 过滤掉 deco, id, action
    const { params: { deco, id, action, ...params } } = this.props
    /* eslint-enable */
    const _path = this.formatPattern(path, params)
    return _path === null ? null : (
      <Menu.Item key={path}>
        <Link to={this.formatPattern(path, params)}>
          {this.formatPattern(title, params)}
        </Link>
      </Menu.Item>
    )
  }

  renderMenus (menus) {
    return menus.map(({title, path, children}) => {
      return children && children.length
        ? <SubMenu key={path} title={title} onTitleClick={this.handleSubMenuClick}>
          {this.renderMenus(children)}
        </SubMenu>
        : this.renderMenuItem({ title, path })
    }).filter(i => i)
  }

  handleSubMenuClick = ({key}) => {
    // window.location.hash = `#${this.formatPattern(key)}`
    this.setState({
      selectedKeys: []
    })
  }

  handleClick = (e) => {
    this.setState({
      selectedKeys: [e.key]
    })
  }

  handleOpenChange = openKeys => {
    this.setState({
      openKeys
    })
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      // TODO 每次路由变化都要递归，耗时操作！
      if (this.findRoute(this.flatLinks, nextProps.location.pathname)) {
        // 新路由不在link中，不更新状态
        this.setState(this.getMenuState(menus, nextProps.location.pathname))
      }
    }
  }

  render () {
    const { state } = this
    return (
      <aside className='page-aside-fish'>
        <Menu
          onClick={this.handleClick}
          theme='light'
          // style={{ width: 210 }}
          onOpenChange={this.handleOpenChange}
          openKeys={state.openKeys}
          selectedKeys={state.selectedKeys}
          mode='inline'
        >
          {this.renderMenus(menus)}
        </Menu>
      </aside>
    )
  }
}
