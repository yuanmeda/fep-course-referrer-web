import isPlainObject from 'lodash/isPlainObject'
import isString from 'lodash/isString'

class Source {
  constructor (source) {
    Object.assign(this, source)
  }

  makeKey (id, params = {}) {
    return [id, ...this.queryKeys.map(k => params[k])].filter(v => !!v).join('#')
  }

  makeParams (entity = {}) {
    return this.queryKeys.reduce((obj, param) =>
      Object.assign(obj, { [param]: entity[param] }), {})
  }
}

/**
 * 将 source 标准化
 */
export default function (source, schema) {
  if (!source) {
    source = {}
  }

  if (isString(source)) {
    source = {
      uri: source
    }
  }

  if (!isPlainObject(source)) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('source must be a string or plain object')
    }

    source = {}
  }

  // 从 primaryKey 中直接生成 identity
  const [id = 'id', ...queryKeys] = schema.primaryKey
  const { identity, ...restSource } = source

  return new Source(Object.assign({
    id, queryKeys
  }, identity, restSource))
}
