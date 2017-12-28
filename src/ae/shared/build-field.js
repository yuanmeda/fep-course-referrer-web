import React from 'react'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import normalizeField from 'ae/core/normalizers/field'
import { RENDER_STATE } from 'ae/components/Field'
import i18n from 'ae/services/i18n'
import { Form } from 'fish'
import hasOwn from 'ae/shared/has-own'

const RULE_KEYS = [
  'range',
  'len',
  'max',
  'min',
  'required',
  'whitespace',
  'pattern',
  'validator'
]

const RULE_TYPES = [
  'string',
  'number',
  'boolean',
  'method',
  'regexp',
  'integer',
  'float',
  'array',
  'object',
  // 'enum',
  'date',
  'url',
  'hex',
  'email'
]

// 默认布局
export const defaultFormItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 19 }
}

export default function buildField (_field, entity, form, isChild) {
  const field = normalizeField(_field)
  const params = {
    entity,
    field,
    form,
    renderState: field.readonly ? RENDER_STATE.DISPLAY : RENDER_STATE.EDIT
  }

  if (field.onChange) {
    params.onChange = field.onChange
  }

  const Comp = field.component(params)

  // 生成规则
  let rules = []

  // 取类型
  if (RULE_TYPES.indexOf(field.type) !== -1) {
    rules.push({
      type: field.type
    })
  }

  function bindForm (rule) {
    return isFunction(rule) ? rule.bind(form) : rule
  }

  // 取其它
  RULE_KEYS.forEach(key => {
    if (hasOwn(field, key)) {
      const rule = field[key]
      if (key === 'range') {
        const temp = {
          type: field.type // 必须带类型，否则默认为 string
        }
        if (rule) {
          if (isArray(rule)) {
            temp.min = Math.min(...rule)
            temp.max = Math.max(...rule)
          } else {
            temp.min = rule.min
            temp.max = rule.max
            temp.message = rule.message
          }

          rules.push(temp)
        }
      } else if (isPlainObject(rule)) {
        rules.push({ [key]: bindForm(rule.value), message: rule.message, type: rule.type })
      } else if (isBoolean(rule)) {
        // required, whitespace
        rules.push({ [key]: rule, type: field.type })
      } else {
        if (key === 'required' || key === 'whitespace') {
          rules.push({ [key]: true, message: rule, type: field.type })
        } else {
          rules.push({ [key]: bindForm(rule), type: field.type })
        }
      }
    }
  })

  // 校验规则适配国际化数据
  if (rules.length && field.i18n) {
    const language = i18n.language || i18n.detectLanguage()
    rules = [{
      type: 'object',
      required: true,
      fields: {
        [language]: rules
      }
    }]
  }

  function getValue (obj, [key, ...rest]) {
    if (!key) {
      return obj
    }
    if (isPlainObject(obj) && hasOwn(obj, key)) {
      return getValue(obj[key], rest)
    } else {
      return undefined
    }
  }

  let initialValue
  if (isChild) {
    initialValue = getValue(entity, field.key.split('.'))
  } else {
    // 设置默认值，好多三元
    initialValue = hasOwn(entity, field.key)
      ? entity[field.key]
      : hasOwn(field, 'defaultValue')
        ? field.defaultValue
        : undefined
  }

  // 初始数据如果是非国际化结构，在国际化场景下，需要转为国际化对象
  // 因为rules已经改为国际化结构，如果初始值还是普通数据，进入表单后，校验不通过
  if (field.i18n && !i18n.isI18nObj(initialValue)) {
    initialValue = i18n.normalize(initialValue)
  }

  // 隐藏字段，特殊处理
  if (field.hidden) {
    return (
      <div key={field.key}>
        { form.getFieldDecorator(field.key, { rules, initialValue })(Comp) }
      </div>
    )
  }

  // 组合字段，特殊处理
  if (field.fields) {
    return Object.keys(field.fields)
      .map(key => Object.assign(field.fields[key], {
        key: `${field.key}.${key}`
      }))
      .map(field => buildField(field, entity, form, true))
  }

  const layout = form.formItemLayout || defaultFormItemLayout

  return (
    <Form.Item key={field.key} label={field.label}
      extra={field.description}
      {...layout}>
      { form.getFieldDecorator(field.key, { rules, initialValue })(Comp) }
    </Form.Item>
  )
}
