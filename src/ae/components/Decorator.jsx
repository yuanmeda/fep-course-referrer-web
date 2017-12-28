import React from 'react'
import isArray from 'lodash/isArray'
import AEComponentBase from 'ae/components/Base'
import normalizeButtons from 'ae/core/normalizers/buttons'
import hasOwn from 'ae/shared/has-own'

// TODO 合并配置项里的 Schema

/**
 * 装饰器基类
 */
export default class AEDecorator extends AEComponentBase {
  constructor (props, context) {
    super(props, context)

    const { deco = '', defaultConfig } = this.constructor

    // TODO 对于那些不在地址上表现的 deco，怎么 active？
    this.state = {
      active: props.params ? deco === props.params.deco : false
    }

    // 装饰器的配置项
    this.config = Object.assign({}, defaultConfig, context.ae.decorators[deco])
    // 自动翻译
    ;['label', 'title', 'content'].forEach(key => {
      if (hasOwn(this.config, key)) {
        const value = this.config[key]
        // 如果值不为空（允许外部设置为空）
        if (value) {
          // 直接拿 key 去翻译
          this.config[key] = this.__(key, {}, value)
        }
      }
    })
    this.initialize()
  }

  initialize () {
    if (process.env.NODE_ENV !== 'production') {
      const { name } = this.constructor
      console.warn(`装饰器 ${name} 应提供 initialize 方法`)
    }
  }

  componentWillReceiveProps (nextProps) {
    const { deco = '' } = this.constructor
    this.setState({
      active: nextProps.params ? deco === nextProps.params.deco : false
    })
  }

  render () {
    if (this.state.active) {
      return this.decoRender()
    } else {
      return this.hookRender()
    }
  }

  /**
   * 用于往页面加钩子，默认不加
   * 默认不再往下传递 decorator 的 this.config，以避免污染
   */
  hookRender (props = {}) {
    const { WrappedComponent } = this.constructor
    const { config, ...restProps } = this.props
    if (!hasOwn(props, 'config')) {
      if (config) {
        props.config = config
      }
    } else {
      props.config = { ...config, ...props.config }
    }
    return <WrappedComponent {...restProps} {...props} />
  }

  decoRender () {
    if (process.env.NODE_ENV !== 'production') {
      const { name } = this.constructor
      console.warn(`装饰器 ${name} 应提供 decoRender 方法`)
    }
  }

  /**
   * 后台最常见的场景就是各种操作按钮
   * 为了让各个装饰器添加的按钮可以聚集在同一个地方
   * 通过此方法将按钮注册到全局，然后模式的主组件可以直接获取
   *
   * @param {object | object[]} button 按钮（们）
   */
  pushButton (button) {
    if (isArray(button)) {
      return button.forEach(b => this.pushButton(b))
    }
    // label 和 component 二者选其一
    if (!button.label && !button.component) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('button 必须提供 label 或者自定义 component')
      }
      return
    }
    const { ae } = this.context
    if (!ae.buttons) {
      ae.buttons = []
    }
    // 防止重复注册
    const foundIndex = this.findButton(button)
    if (foundIndex !== -1) {
      // TODO 如何优化 re-render 导致的重复插入？
      // 替换当前 button，否则会有问题
      ae.buttons.splice(foundIndex, 1, normalizeButtons([button])[0])
    } else {
      ae.buttons.push(normalizeButtons([button])[0])
    }

    // 对 button 排序, offset 越小越靠前
    ae.buttons.sort(({ offset: a = 0 }, { offset: b = 0 }) => a - b)
  }

  findButton ({ label, scope, component }) {
    const { ae } = this.context
    if (!ae.buttons) {
      return false
    }
    return ae.buttons.findIndex(item => ((item.label === label || item.component === component) && item.scope === scope))
  }
}
