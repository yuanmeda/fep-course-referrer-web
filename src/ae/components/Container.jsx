import React, { Component, Children, cloneElement } from 'react'
import { propTypes } from 'ae/core/shapes'

/**
 * 透传 children
 * 将 props 往下传
 */
export default class AEComponentContainer extends Component {
  static propTypes = propTypes

  render () {
    const { children, ...restProps } = this.props
    return children ? <div className='ae-container'>{
      Children.map(children, child => cloneElement(child, restProps))
    }</div> : null
  }
}
