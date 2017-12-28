import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import restify from 'ae/shared/restify-reducers'

const R = {
  Simple: (state, action) => action.payload,
  Extend: (state, action) => ({
    ...state,
    ...action.payload
  })
}

/**
 * 如果存在 source，
 * 则生成对应的 reducers，
 * 合入到自定义的 reducers
 */
export default function (reducers, model, source, schema, actions) {
  if ((!reducers || isString(reducers)) && actions) {
    if (!isArray(actions)) {
      actions = Object.keys(actions)
    }
    if (!reducers) {
      reducers = 'Simple'
    }
    reducers = actions.reduce((obj, key) => Object.assign(obj, {
      [key]: R[reducers] || R.Simple
    }), {})
  }
  // 将 source 转换成 actions
  if (source && !isEmpty(source)) {
    return Object.assign(restify(model, source, schema), reducers)
  }
  return reducers
}
