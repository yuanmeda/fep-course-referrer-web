import { routeManager } from 'ae/core/route'

/**
 * 模块间跳转
 * @param {string} module 模块路径
 * @param {object} [params] 地址参数
 * @param {object} [queryParams] 查询参数
 */
export default function redirect (module, params = {}, queryParams = {}) {
  const route = routeManager.get(module)
  if (route) {
    route.push(params, queryParams)
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`模块 ${module} 不存在`)
    }
  }
}
