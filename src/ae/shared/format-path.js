import { routeManager } from 'ae/core/route'

export default function formatPath (path, scope = '', model) {
  // 未定义、首页或根 404，直接返回
  if (scope === '') {
    return cleanPath(path)
  }

  // 默认后缀
  let affix = '(/:deco(/:id(/:act)))'
  // Grid 特殊处理
  if (model === 'Grid') {
    affix = `(/_g${affix})`
  } else if (model === 'Form') {
    affix = `(/_f${affix})`
  } else if (model !== 'Unknown') {
    affix = `(/_a${affix})`
  }

  const is404 = path.indexOf('*') !== -1

  // 非 404 且路由里不包含默认后缀，则添加后缀
  if (!is404 && path.indexOf(affix) === -1) {
    path += affix
  }

  if (scope) {
    const sep = '/modules/'
    // 用父级 path 作为前缀
    const parents = scope.split(sep)
    if (parents.length > 1) {
      // 获取父级 scope
      const parentScope = parents.splice(0, parents.length - 1).join(sep)
      // 获取父级路由对象
      const parentRoute = routeManager.get(parentScope)
      // children 嵌套模式下，取不到父
      if (parentRoute) {
        // 获取父级 path 并还原为原始 scope+path 模式
        const parentPath = parentRoute.path.split('(/_')[0].replace(/\/_m\//g, sep)
        // 当父级 scope 替换为父级 path
        scope = scope.replace(parentScope, parentPath)
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`模块 ${scope} 没有找到父模块`)
        }
      }
    }
  }

  // 添加前缀
  scope = `/${scope}`

  if (is404) {
    // 404，截取最后的 modules/xxx
    scope = scope.replace(/\/modules\/[-0-9a-zA-Z_]+$/, '')
  }

  // 非绝对路径，添加 scope
  if (path.charAt(0) !== '/') {
    path = `${scope}/${path}`
  }

  return cleanPath(path)
}

function cleanPath (path) {
  return path
    .replace(/\/modules\//g, '/_m/')
    // `/(/` -> `(/`
    .replace(/\/\(\/+/g, '(/')
    // `//` -> `/`
    .replace(/\/\/+/g, '/')
    .replace(/\/+$/, '')
    .replace(/^\/\*$/, '*')
}
