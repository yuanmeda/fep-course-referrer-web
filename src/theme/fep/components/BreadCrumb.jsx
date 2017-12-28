import React, { Component, PropTypes } from 'react'
import { Link, formatPattern } from 'react-router'
import { Icon } from 'fish'

class BreadCrumbItem extends Component {
  static propTypes = {
    separator: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]),
    last: PropTypes.bool,
    children: PropTypes.element
  }

  static defaultProps = {
    separator: '/',
    last: false
  }

  render () {
    const { last, separator, children, ...restProps } = this.props
    if (children) {
      return (
        <span>
          <span className='ae-layout-breadcrumb-link' {...restProps}>{children}</span>
          { last ? null : <span className='ae-layout-breadcrumb-separator'>{separator}</span> }
        </span>
      )
    }
    return null
  }
}

export default class BreadCrumb extends Component {
  static propTypes = {
    separator: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]),
    routes: PropTypes.any.isRequired,
    params: PropTypes.any,
    itemRender: PropTypes.func
  }

  static defaultProps = {
    separator: '/',
    params: {},
    itemRender: defaultItemRender
  }

  render () {
    let crumbs
    const {
      separator, routes, params,
      itemRender
    } = this.props

    if (routes && routes.length > 0) {
      const length = routes.length
      crumbs = routes.map((route, index) => {
        const path = formatPattern(route.path || '', params)
        const last = index === length - 1
        return (
          <BreadCrumbItem last={last} separator={separator} key={path}>
            {itemRender(route, params, path, last)}
          </BreadCrumbItem>
        )
      })
    }
    return (
      <div className='ae-layout-breadcrumb'>
        { crumbs }
      </div>
    )
  }
}

function defaultItemRender (route, params, path, last) {
  const name = getBreadCrumbName(route, params)
  const icon = getBreadCrumbIcon(route)
  return last || (route.menu.children && route.menu.children.length > 0)
    ? <span>{icon}{name}</span>
    : <Link to={path.replace(/grid[\s\S]*/g, 'grid/')}>{icon}{name}</Link>
}

function getBreadCrumbName (route, params) {
  const title = route.bread.title || route.menu.title
  return title ? formatPattern(title, params) : null
}

function getBreadCrumbIcon (route) {
  const icon = route.bread.icon || route.menu.icon
  return icon ? <Icon type={icon} /> : null
}
