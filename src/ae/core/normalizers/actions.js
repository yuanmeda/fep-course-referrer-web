import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import identity from 'lodash/identity'
import restify from 'ae/shared/restify-actions'

/**
 * 如果存在 source，
 * 则生成对应的 actions，
 * 合入到自定义的 actions
 */
export default function (actions, model, source, schema, route) {
  if (isArray(actions)) {
    // 只提供 action key 时，转成简单 action
    actions = actions.reduce((obj, key) => Object.assign(obj, {
      [key]: identity
    }), {})
  }
  // 将 source 转换成 actions
  if (source && !isEmpty(source)) {
    return Object.assign(restify(model, source, schema, route), actions)
  }
  return actions
}
