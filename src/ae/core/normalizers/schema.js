import isArray from 'lodash/isArray'
import normalizeField from 'ae/core/normalizers/field'

class Schema {
  constructor (model, schema) {
    let raw = schema || {}
    if (isArray(raw)) {
      raw = raw.reduce((obj, name) => Object.assign(obj, { [name]: 'string' }), {})
    }

    this.primaryKey = []

    Object.entries(raw).forEach(([key, value]) => {
      value = raw[key] = normalizeField(value, key)
      if (value.primary) {
        this.primaryKey.push(key)
      }
    })

    if (!this.primaryKey.length) {
      this.primaryKey = ['id']
    }
    // 只取第一个主键？
    this.primary = this.primaryKey[0]

    // 纯净的 schema
    this.raw = raw
    this.keys = Object.keys(this.raw)
  }

  getFields (filteredKeys, filterFunc) {
    if (!filteredKeys) {
      filteredKeys = this.keys
    }

    // 重新过滤并合并 fields
    const fields = filteredKeys.map(key => {
      if (isArray(key)) {
        const [k, config] = key
        return { ...this.getField(k), ...config }
      }
      return this.getField(key)
    })

    return filterFunc
      ? fields.filter(filterFunc)
      : fields
  }

  getField (key) {
    return this.raw[key]
  }

  getSortable (key) {
    return this.getField(key).sortable
  }

  getType (key) {
    return this.getField(key).type
  }

  getDefault (key) {
    return this.getField(key).default
  }

  getLabel (key) {
    return this.getField(key).label || key
  }

  getDescription (key) {
    return this.getField(key).description
  }
}

export default function (...args) {
  return new Schema(...args)
}
