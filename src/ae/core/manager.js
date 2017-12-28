import React, { Component } from 'react'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isPromise from 'ae/shared/is-promise'
import hasOwn from 'ae/shared/has-own'
import { propTypes } from 'ae/core/shapes'

class ComponentManager {
  constructor () {
    this.componentMap = {}
  }

  register ({ type, component }) {
    if (hasOwn(this.componentMap, type)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Component ${type} 已存在，将被覆盖`)
      }
    }
    this.componentMap[type] = component
  }

  getComponent (Type, componentConfig = {}, isHOC) {
    if (isArray(Type)) {
      const children = Type.map(T => this.getComponent(T, componentConfig))
      return params => <div className='ae-components'>{
        children.map((Child, index) => <Child key={index} {...params} />)
      }</div>
    }

    if (isString(Type)) {
      const { componentMap } = this
      if (!hasOwn(componentMap, Type)) {
        Type = 'Base'
      }
      Type = componentMap[Type]
    }

    if (isHOC) {
      return Type
    }

    const {
      displayRender,
      editRender,
      ...restConfig
    } = componentConfig

    if (displayRender) {
      restConfig.displayRender = this.getComponent(displayRender)
    }
    if (editRender) {
      restConfig.editRender = this.getComponent(editRender)
    }

    if (isPromise(Type)) {
      return asyncify(Type, restConfig)
    }

    return params => {
      const { config, ...restParams } = params
      return <Type config={{...restConfig, ...config}} {...restParams} />
    }
  }
}

function asyncify (promise, restConfig) {
  return class AsyncComponent extends Component {
    static propTypes = propTypes

    constructor () {
      super()
      this.state = {
        Comp: null
      }
      promise.then(Comp => {
        this.setState({ Comp })
      })
    }

    render () {
      const { Comp } = this.state
      const { config, ...restProps } = this.props
      return Comp ? <Comp config={{...restConfig, ...config}} {...restProps} /> : null
    }
  }
}

export default new ComponentManager()
