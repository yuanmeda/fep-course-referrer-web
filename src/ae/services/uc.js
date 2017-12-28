import request from 'ae/shared/request'
import restify from 'ae/shared/restify-actions'
import hasOwn from 'ae/shared/has-own'

const cache = {}

export default restify(null, {
  // TODO 支持配置 uri
  uri: `${ORIGINS.UC}/v1.0/users`,
  agent (config, iReq, iRes) {
    const { id } = config
    if (hasOwn(cache, id)) {
      return cache[id].then ? cache[id] : Promise.resolve(cache[id])
    }
    const req = request(config, iReq, iRes)
    cache[id] = req
    return req
  },
  normalize (res) {
    return res[0]
  },
  interceptors: {
    response (res) {
      if (res.user_id) {
        return (cache[res.user_id] = res)
      }
      return {}
    }
  }
}, { primaryKey: ['user_id'] })
