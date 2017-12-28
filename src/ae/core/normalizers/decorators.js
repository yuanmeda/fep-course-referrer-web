import isBoolean from 'lodash/isBoolean'
import isPlainObject from 'lodash/isPlainObject'
import upperFirst from 'lodash/upperFirst'
import normalizePermission from 'ae/core/normalizers/permission'
import normalizeButtons from 'ae/core/normalizers/buttons'
import manager from 'ae/core/manager'
import merge from 'ae/shared/shallow-merge'

export default function (decorators, model, scope) {
  if (!isPlainObject(decorators)) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('decorators must be a plain object')
    }
    return {}
  }

  if (model === 'Grid') {
    decorators = merge({
      config: {
        enforce: 'pre',
        model
      },
      list: {
        enforce: 'pre'
      },
      paginate: {},
      search: {},
      edit: {},
      del: {},
      create: {},
      detail: {}
    }, decorators)
  } else if (model === 'Form') {
    decorators = merge({
      config: {
        enforce: 'pre',
        model
      }
    }, decorators)
  }

  const pre = {}
  const post = {}
  const normal = {}

  // 排序
  Object.entries(decorators).forEach(([key, value]) => {
    if (isBoolean(value)) {
      value = {
        disabled: !value
      }
    }

    // 默认不做权限控制
    if (value.permission === undefined) {
      value.permission = -1
    }

    value.permission = normalizePermission(value.permission, scope, key)

    // 对 decorator 进行处理
    if (!value.decorator) {
      // 装饰器需要特殊处理，所以增加 isHOC 参数
      value.decorator = manager.getComponent(`Decorator${upperFirst(key)}`, undefined, true)
    }

    if (value.buttons) {
      value.buttons = normalizeButtons(value.buttons)
    }

    switch (value.enforce) {
      case 'pre':
        pre[key] = value
        break
      case 'post':
        post[key] = value
        break
      default:
        normal[key] = value
    }
  })

  return Object.assign(pre, normal, post)
}
