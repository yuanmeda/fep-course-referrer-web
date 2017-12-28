import { formatPattern } from 'react-router'
import identity from 'lodash/identity'
import isString from 'lodash/isString'
import buildURL from 'ae/shared/build-url'

// TODO 这个文件的命名应该是大驼峰，因为它返回一个类

// 使用全局变量，保证全局唯一
let timeout = 0

export default class Route {
  constructor (path, params = {}) {
    // 不再私有
    this.path = path
    this.params = params
    this.originalParams = Object.assign({}, params)
    this.queryParams = {}
  }

  update (params, queryParams) {
    if (params) {
      Object.assign(this.params, params)
      /* eslint-disable */
      // 对 deco, id, act 要特殊处理
      const { deco, id, act, ...restParams } = params
      /* eslint-enable */
      Object.assign(this.originalParams, restParams)
    }
    if (queryParams) {
      /* eslint-disable */
      // 对 paginate/search 的参数要特殊处理
      const { $limit, $offset, $count, $filter, $orderby, ...restQueryParams } = queryParams
      /* eslint-enable */
      Object.assign(this.queryParams, restQueryParams)
    }
  }

  getParams () {
    return this.params
  }

  // 用于外部
  format (params, queryParams) {
    return buildURL(
      formatPattern(
        this.path,
        Object.assign({}, this.params, params)),
      Object.assign({}, this.queryParams, queryParams),
      // 因为 formatPattern 已经对 uri 进行 encode 了，
      // 所以 buildURL 不再 encode
      null, identity
    )
  }

  _format (params, queryParams) {
    return buildURL(
      formatPattern(
        this.path,
        params),
      queryParams,
      // 因为 formatPattern 已经对 uri 进行 encode 了，
      // 所以 buildURL 不再 encode
      null, identity
    )
  }

  push (params, queryParams) {
    this.ensure(
      params,
      queryParams)
  }

  query (queryParams) {
    this.ensure(
      this.originalParams,
      queryParams === null ? {} : Object.assign({}, this.queryParams, queryParams))
  }

  ensure (p, q) {
    this.stop()

    timeout = setTimeout(() => {
      // TODO 外部传入 router，调用 router 的 push 或 replace 方法
      window.location.hash = `#${this._format(p, q)}`
    }, 10)
  }

  stop () {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

const routes = {}

export const routeManager = {
  get (scope) {
    if (!isString(scope)) {
      scope = scope.scope
    }
    return routes[scope]
  },

  add ({ scope, route }) {
    routes[scope] = route
  }
}
