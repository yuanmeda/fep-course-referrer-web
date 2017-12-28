let index = Date.now()

/**
 * 创建数据存储器
 *
 * @method createStorage
 * @param  {object}      [param]                            配置项
 * @param  {string}      [param.namespace]                  命名空间，用于数据隔离
 * @param  {object}      [param.initialState={}]            默认数据
 * @param  {object}      [param.provider=localStorage]      基础存储器，必须拥有 getItem 与 setItem 方法
 * @param  {function}    [param.serialize=JSON.stringify]   序列化方法
 * @param  {function}    [param.deserialize=JSON.parse]     反序列化方法
 * @param  {number}      [param.expires=0]                  过期时间，以毫秒为单位
 * @param  {function}    [param.merge]                      用于数据合并的方法
 * @return {object}                                         数据存储器
 * @example
 * const storage = createStorage()
 * storage.set({ x: 1 })
 * storage.get() // return { x: 1 }
 * storage.set('my-key', { x: 1 })
 * storage.get('my-key') // return { x: 1 }
 */
export default function createStorage ({
  namespace,
  initialState = {},
  provider = localStorage,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
  expires = 0, // never expires
  merge = defaultMerge
} = {}) {
  if (!namespace) {
    namespace = `ae-${++index}`
  }

  return {
    /**
     * Get the value of the provided key
     *
     * @method get
     * @param  {string} [key='default'] key
     * @return {object}                 A plainobject value
     */
    get (key = 'default') {
      let state

      try {
        const { value, expires } = deserialize(provider.getItem(`${namespace}-${key}`))
        if (expires === 0 || expires > Date.now()) {
          // always a plain object
          state = deserialize(value)
        }
      } catch (e) {
        // console.log(e)
      }

      return merge(key === 'default' ? initialState : initialState[key], state)
    },

    /**
     * Add or update a key with a plainobject value
     *
     * @method set
     * @param  {string} [key='default'] key
     * @param  {object} value           A plainobject value
     */
    set (key, value) {
      if (arguments.length === 1) {
        value = key
        key = 'default'
      }
      try {
        provider.setItem(`${namespace}-${key}`, serialize({
          value: serialize(value),
          expires: expires ? expires + Date.now() : expires
        }))
      } catch (e) {
        // console.log(e)
      }
    }
  }
}

function defaultMerge (...args) {
  return Object.assign({}, ...args)
}
