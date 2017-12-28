import isEmpty from 'lodash/isEmpty'
import hasOwn from 'ae/shared/has-own'

/**
 * 将 schema 转换成 state
 */
export default function (state, model, source, schema) {
  function extractSchema () {
    return Object.keys(schema.raw).reduce((obj, key) => Object.assign(obj, { [key]: getValue(schema.raw[key]) }), {})
  }

  if (model === 'Grid') {
    return Object.assign({
      total: 0,
      result: [],
      entities: {}
    }, state)
  } else if (model === 'Form') {
    return Object.assign({
      entity: extractSchema()
    }, state)
  } else {
    if (schema && schema.raw && !isEmpty(schema.raw)) {
      return Object.assign(extractSchema(), state)
    }
    return state
  }
}

function getValue (field) {
  if (hasOwn(field, 'defaultValue')) {
    return field.defaultValue
  }

  // TODO 支持更多类型
  return field.type === 'string' ? '' : field.type === 'number' ? 0 : null
}
