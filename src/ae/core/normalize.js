import Container from 'ae/components/Container'
import Route, { routeManager } from 'ae/core/route'
import formatPath from 'ae/shared/format-path'

import normalizePermission from './normalizers/permission'
import normalizeMenu from './normalizers/menu'
import normalizeBread from './normalizers/bread'
import normalizeComponent from './normalizers/component'
import normalizeDecorators from './normalizers/decorators'
import normalizeButtons from './normalizers/buttons'
import normalizeSchema from './normalizers/schema'
import normalizeSource from './normalizers/source'
import normalizeState from './normalizers/state'
import normalizeActions from './normalizers/actions'
import normalizeReducers from './normalizers/reducers'

/**
 * 对配置进行标准化
 * 将 source 与 schema 转为 action 与 state
 * @param {object} config 配置项
 * @param {string} key    目录名或父级的 scope
 */
export default function normalize (config, scope, mixins) {
  if (config.__normalized) {
    return config
  }

  const {
    __normalized = true,
    i18n = false,
    permission = -1,
    name,
    path = '',
    redirect,
    bread,
    menu,
    model,
    container = Container,
    component,
    componentConfig = {},
    decorators = {},
    buttons,
    state = {},
    actions,
    reducers,
    source,
    schema,
    children,
    ...rest } = config

  const _permission = normalizePermission(permission, scope)
  const _schema = normalizeSchema(model, schema)
  const _source = normalizeSource(source, _schema)
  const _buttons = normalizeButtons(buttons)

  if (process.env.NODE_ENV !== 'production') {
    if (_buttons) {
      console.error('请不要在模块下直接声明 buttons！此项支持也将在未来的版本里移除，请使用装饰器实现。', buttons)
    }

    if (children) {
      console.warn('不推荐使用 `children` 属性，请使用子目录（modules/<xyz>）实现子模块', children)
    }
  }

  const _path = formatPath(path, scope, model)
  const _menu = normalizeMenu(name, _path, _permission, menu)
  const route = new Route(_path)

  const normalized = Object.assign(rest, {
    __normalized,
    // defaults to scope
    key: scope,
    scope,
    i18n,
    permission: _permission,
    name,
    path: _path,
    redirect: redirect === undefined ? undefined : formatPath(redirect, scope, 'Unknown'),
    menu: _menu,
    bread: normalizeBread(name, bread, _menu),
    route,
    model,
    container,
    component: normalizeComponent(component || model || 'Base', componentConfig),
    decorators: normalizeDecorators(decorators, model, scope),
    buttons: _buttons,
    state: normalizeState(state, model, _source, _schema),
    actions: normalizeActions(actions, model, _source, _schema, route),
    reducers: normalizeReducers(reducers, model, _source, _schema, actions),
    source: _source,
    schema: _schema,
    modules: {}
  }, mixins)

  routeManager.add(normalized)

  // 移到 routeManager 之后，确保子模块能够包含父模块的 path
  if (children) {
    normalized.modules = children.reduce((obj, child, i) => {
      const _scope = `${scope}/modules/${i}`
      return Object.assign(obj, {
        [_scope]: normalize(child, _scope, Object.assign({}, mixins, {
          key: _scope,
          is404: false
        }))
      })
    }, {})
  }

  return normalized
}
