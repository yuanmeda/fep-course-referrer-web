import isFunction from 'lodash/isFunction'
import normalize from './normalize'
import parseState from './parsers/state'
import parseActions from './parsers/actions'
import parseReducers from './parsers/reducers'
import parseRoutes from './parsers/routes'
import parseMenu from './parsers/menu'
import i18n from 'ae/services/i18n'

/**
 * 自动模块处理
 */
export default async allModules => {
  let found = []
  // 查找首页
  const foundIndex = allModules.findIndex(([ key ]) => key.indexOf('./index.js') === 0)
  if (foundIndex !== -1) {
    found = allModules.splice(foundIndex, 1)
  }
  // 查找 404 页
  let found404 = []
  let n = allModules.length
  while (n--) {
    const m = allModules[n]
    if (m[0].indexOf('/404.js') !== -1) {
      // 反向 concat，保证业务的模块覆盖内置的模块
      found404 = allModules.splice(n, 1).concat(found404)
    }
  }
  // 将首页移到最前，将 404 页移到最后
  return handleModules(found.concat(allModules).concat(found404))
}

/**
 * @return Promise
 */
function handleModules (modules) {
  let hasRootModule = false
  // 并行加载
  return Promise.all(
    modules.map(initialize)
    // 串行范化
  ).then(arr => arr.map(([...args]) => normalize(...args))
    // 转换成对象树
  ).then(arr => arr.reduce((obj, config) => {
    /**
     * 将模块转换成如下结构
     * {
     *   [scope]: {
     *     ...,
     *     modules: {
     *       [scope]: {
     *         ...,
     *         modules: {
     *           ...
     *         }
     *       }
     *     }
     *   }
     * }
     */
    const { scope, is404 } = config

    // 404 特殊处理
    // 需要优化
    if (is404) {
      // config.scope = config.scope || '404'
      // 默认 404 页
      if (scope === '') {
        if (hasRootModule) {
          const ascent = obj[scope]
          if (!ascent.modules) {
            ascent.modules = {}
          }
          Object.assign(ascent.modules, {
            '*': config
          })
        } else {
          Object.assign(obj, {
            '*': config
          })
        }
        return obj
      }
    }

    // 默认首页，则设置为顶级模块，将包含其它所有模块
    if (scope === '') {
      hasRootModule = true
      return {
        [scope]: config
      }
    }

    let dirname = scope
    // 对象 key 索引
    // from: x/modules/y/modules/z
    // to: [x, y, z]
    const arr = scope.split('/modules/')
    if (arr.length > (is404 ? 1 : 0)) {
      // to: [x, y]
      // dirname 为最后一个
      dirname = arr.pop()
    }

    // 如果有自定义的首页
    if (hasRootModule) {
      // to: ['', x, y]
      arr.unshift('')
    }

    // 递归查找父模块
    const target = arr.reduce((obj, key) => {
      if (!obj) {
        return null
      }
      const ascent = obj[key]
      if (ascent) {
        if (!ascent.modules) {
          ascent.modules = {}
        }
        return ascent.modules
      } else {
        // 父模块不存在，可能是被 RBAC 过滤掉了
        return null
      }
    }, obj)

    if (target) {
      Object.assign(target, {
        // 404 统一使用 *
        [is404 ? '*' : dirname]: config
      })
    }

    return obj
  }, {})).then(obj => {
    Object.values(obj).forEach(applyParsers)
    return obj
  })
}

// 清除首尾
const re0 = /^\.\/|(\/|\b)index\.jsx?$/g
// 清除前导排序
const re1 = /^\d+-/g
// 测试是否 404
const re2 = /(\/|\b)404\.jsx?$/

/**
 * 获取模块信息
 * @return Promise[]
 */
async function initialize ([key, req]) {
  const creator = req(key)
  if (!isFunction(creator)) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('模块必须是函数')
    }
    return {}
  }

  key = key.replace(re0, '')

  // 取目录名，同时前置的用于排序的数字（001-）会被替换掉
  let scope = key.split('modules/').map(str => str.replace(re1, '')).join('modules/')
  let is404 = false
  if (re2.test(scope)) {
    scope = scope.replace(re2, '')
    is404 = true
  }

  const args = [scope]
  const shouldI18n = creator.length === 2
  if (shouldI18n) {
    const translations = await i18n.getTranslations(key)
    const __ = (key, values, defaultMessage) => i18n.translate(key, values, defaultMessage === undefined ? key : defaultMessage, translations)
    args.push(__)
  }

  const config = await creator.apply(null, args)
  if (is404) {
    config.path = '*'
  }

  return [
    config, scope, {
      i18n: shouldI18n,
      key,
      is404
    }
  ]
}

function applyParsers (config) {
  parseState(config)
  parseActions(config)
  parseReducers(config)
  // 生成 <Route>
  parseRoutes(config)
  // 生成菜单
  parseMenu(config)
}
