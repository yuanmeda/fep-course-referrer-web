import React from 'react'
import { contextTypes, propTypes } from 'ae/core/shapes'
import rbac from 'ae/core/rbac'
import inject from 'ae/core/inject'
import { moduleIntl, componentIntl } from 'ae/core/intl'
import AEComponentBase from 'ae/components/Base'
import Container from 'ae/components/Container'
import normalize from 'ae/core/normalize'

/**
 * 结构示意
 * <Inject>
 *  <RBAC>
 *   <ModuleIntl>
 *    <AEbase>
 *     <AEContainer>
 *      <AEChild>
 *       <RBAC>
 *        <componentIntl>
 *         <DecoratedAEComponent>
 */

/**
 * 根据配置生成 Element
 */
export function generateElement (_config, props) {
  const config = normalize(_config, _config.scope)
  const Parent = generateContainer(config)
  const Child = generateComponent(config)
  return <Parent><Child {...props} /></Parent>
}

/**
 * 生成 Container 对应的 ReactComponent，用于 <Route>
 */
export function generateContainer (_config = {}) {
  // 确保 config 经过整理
  const config = normalize(_config, _config.scope)

  // AE 基类，在路由的入口使用
  class AEBase extends AEComponentBase {
    static childContextTypes = contextTypes
    static propTypes = propTypes

    getChildContext () {
      return {
        ae: config,
        source: config.source,
        schema: config.schema,
        route: config.route
      }
    }

    constructor (props, context) {
      super(props, context)

      const { params } = props
      if (params) {
        const { location: { query } } = props
        // 从地址更新路由
        config.route.update(params, query)
      }
    }

    render () {
      const WrappedComponent = config.container || Container
      return <WrappedComponent {...this.props} />
    }
  }

  if (!config.inject) {
    config.inject = []
  }

  // 所有的 BASE 都注入 auth
  config.inject.push('auth')

  let Parent = AEBase
  let displayName = 'AEBase'

  // 国际化
  if (config.i18n) {
    Parent = moduleIntl(config)(Parent)
    displayName = `ModuleIntl(${displayName})`
  }

  // RBAC 被禁用，或模块不需要权限控制
  if (rbac.should(config.permission)) {
    Parent = rbac.wrap(config)(Parent)
    displayName = `RBAC(${displayName})`
  }

  // 注入数据
  Parent = inject(config)(Parent)
  displayName = `Inject(${displayName})`

  Parent.displayName = displayName
  return Parent
}

/**
 * 生成 Component 对应的 ReactElement，用于 <IndexRoute>
 */
export function generateComponent (_config) {
  const config = normalize(_config, _config.scope)

  const Child = Object.entries(config.decorators)
    .reduce((Component, [key, { disabled, permission, decorator }]) => {
      // 不加载 disabled 的装饰器
      if (disabled) {
        return Component
      }
      const DecoratedComponent = decorator(Component)
      try {
        // 设置静态属性
        DecoratedComponent.WrappedComponent = Component
        DecoratedComponent.deco = key
        DecoratedComponent.contextTypes = contextTypes
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(e)
        }
      }
      // 添加 Intl
      Component = componentIntl(`AE.Decorator.${key}`)(DecoratedComponent)
      // 添加 RBAC
      if (rbac.should(permission)) {
        Component = rbac.wrap({ permission, transparent: true })(Component)
      }
      return Component
    }, config.component)

  Child.displayName = `AEComponentChild(${Child.name})`
  return Child
}
