import normalizeComponent from 'ae/core/normalizers/component'

const DEFAULT_FIELD_DEFINITION = {
  type: 'string',
  // label: '',
  // primary: false,
  // readonly: false,
  // hidden: false,
  // sortable: false,
  // component: 'FieldInput',
  componentConfig: {}
}

export default function normalizeField (field, key) {
  if (typeof field === 'string') {
    field = {
      type: field
    }
  }

  if (field.__normalized) {
    return field
  }

  field.__normalized = true

  if (!key) {
    key = field.name
  }

  const {
    type,
    label,
    hidden = false,
    fields,
    component,
    componentConfig,
    ...rest
  } = { ...DEFAULT_FIELD_DEFINITION, ...field }

  if (fields) {
    // 子 field
    Object.entries(fields).forEach(([_key, _field]) => {
      fields[_key] = normalizeField(_field, _key)
    })
  }

  return Object.assign(rest, {
    type,
    label: label === undefined ? key : label,
    hidden,
    fields,
    key,
    component: normalizeComponent(getDefaultComponent(component, type, hidden), componentConfig)
  })
}

function getDefaultComponent (component, type, hidden) {
  if (component) {
    return component
  }

  if (hidden) {
    return 'FieldHidden'
  }

  switch (type) {
    case 'json':
      return 'FieldJSON'
    case 'object':
      return 'FieldObject'
    case 'array':
      return 'FieldArray'
    default:
      // 'string',
      // 'number',
      // 'boolean',
      // 'method',
      // 'regexp',
      // 'integer',
      // 'float',
      // 'enum',
      // 'date',
      // 'url',
      // 'hex',
      // 'email'
      return 'FieldInput'
  }
}
