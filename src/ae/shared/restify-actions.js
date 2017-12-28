import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import identity from 'lodash/identity'
import request from 'ae/shared/request'

/**
 * Simple Normalizer
 */
class Normalizer {
  constructor (config = {}) {
    Object.assign(this, config)
  }

  // 获取实体对应的 ID
  key (item) {
    return item.id
  }

  // 获取实体的值
  value (item) {
    return item
  }

  // 对实体进行必要的处理
  transform (entity, key) {
    return entity
  }

  // 标准化
  normalize (items = []) {
    if (!isArray(items)) {
      items = [items]
    }

    const result = []
    const entities = {}

    items.filter(i => i).forEach(item => {
      const key = this.key(item)
      result.push(key)
      entities[key] = this.transform(this.value(item), key)
    })

    return { result, entities }
  }
}

export default function rest (model, {
  uri,
  params,
  actions,
  agent = request,
  normalize,
  interceptors = {}
}, schema, route) {
  const normalizer = new Normalizer({
    key: item => {
      // 若只有唯一主键，保持主键类型不变；
      // 若有多个主键，则键值类型为string
      return schema.primaryKey.length > 1
        ? schema.primaryKey.map(key => item[key]).join('#')
        : item[schema.primaryKey[0]]
    },
    transform (entity, key) {
      // 如果有多个主键，则需要为 entity 设置 id
      if (schema.primaryKey.length > 1) {
        entity.id = entity[schema.primary]
      }
      return entity
    }
  })

  if (normalize) {
    normalizer.normalize = normalize
  }

  function handleList ({ count: total, items }) {
    return Object.assign({ total }, normalizer.normalize(items))
  }

  function handleItem (data) {
    return model === 'Form'
      ? { entity: data || {} }
      : normalizer.normalize(data ? [data] : [])
  }

  function getInterceptorsByMethod (method) {
    const methodInterceptors = interceptors[method] || {}

    const iReq = methodInterceptors.request || interceptors.request || identity

    const iRes = methodInterceptors.response || interceptors.response || identity

    return {
      iReq,
      iRes
    }
  }

  function generateConfig (config) {
    // 合入默认的参数，将作为查询串
    config.params = Object.assign({}, params, config.params)

    // 将 id 拼入 url
    // 同时将 id 保留在 config 上
    config.url = config.id ? `${uri}/${config.id}` : uri

    // 使用路由上的数据替换 URI 中的参数
    if (route) {
      config.uriParams = Object.assign({}, route.getParams(), config.uriParams)
    }

    return config
  }

  function createRest (method) {
    return function (id, config = {}) {
      if (isPlainObject(id)) {
        config = id
        id = null
      }
      if (!isPlainObject(config)) {
        config = {}
      }
      if (id) {
        config.id = id
      }
      config.method = method === 'list' ? 'get' : method
      const methodInterceptors = getInterceptorsByMethod(method)
      return agent(generateConfig(config), methodInterceptors.iReq, methodInterceptors.iRes)
        .then(res => {
          if (model === 'Grid') {
            if (method === 'list') {
              return handleList(res)
            }
            if (method === 'delete') {
              res = handleItem(res)
              // 处理服务端删除接口不返回 entity 的情况
              if (res.result.length === 0) {
                res.result[0] = id
              }
              return res
            }
          }
          return handleItem(res)
        })
    }
  }

  const lastActions = {
    get: createRest('get'),
    put: createRest('put'),
    patch: createRest('patch'),
    delete: createRest('delete'),
    post: createRest('post'),
    ...actions
  }

  if (model === 'Grid') {
    lastActions.list = createRest('list')
  }

  return lastActions
}
