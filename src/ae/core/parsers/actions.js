import { createActions } from 'redux-actions'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import camelCase from 'ae/shared/camel-case'
import storeActions from 'ae/store/actions'

export default function parseActions (config) {
  const { scope, actions, modules } = config
  if (!isEmpty(actions)) {
    const _scope = camelCase(scope)
    const _actions = Object.keys(actions).reduce((_obj, key) => Object.assign(_obj, {
      [key]: transformAction(actions[key])
    }), {})
    // redux-actions 支持 recursive structure
    // see: https://redux-actions.js.org/docs/api/createAction.html#createactionsactionmap
    Object.assign(storeActions, createActions({
      [_scope]: _actions
    }))
  }
  if (!isEmpty(modules)) {
    // TODO 避免覆盖？
    Object.values(modules).forEach(parseActions)
  }
}

function transformAction (action) {
  if (isArray(action)) {
    return action
  }
  return [
    action,
    // 生成默认的 metaCreator
    (...args) => {
      const [ok, ko] = args.filter(isFunction)
      const finalProcess = {}
      if (ok) {
        finalProcess.success = {
          handler: ok
        }
      }
      if (ko) {
        finalProcess.error = {
          handler: ko
        }
      }
      return { finalProcess }
    }
  ]
}
