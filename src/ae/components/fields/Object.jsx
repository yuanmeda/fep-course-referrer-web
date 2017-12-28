import React from 'react'
import isString from 'lodash/isString'
import AEComponentField from 'ae/components/Field'
import { Input } from 'fish'

// TODO 格式判断

export default class AEComponentFieldObject extends AEComponentField {
  // 父类使用箭头函数，所以子类也必须使用箭头函数
  // @override
  handleChange = value => {
    try {
      value = JSON.parse(value)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(e)
      }
      // value = {}
    }
    this.setState({ value })
    const { onChange } = this.props
    onChange && onChange(value)
  }

  displayRender ({ value }) {
    return (
      <pre>
        {JSON.stringify(value, null, 4)}
      </pre>
    )
  }

  editRender ({ value }) {
    const { field } = this.props
    if (!isString(value)) {
      try {
        value = JSON.stringify(value)
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(e)
        }
        // value = '{}'
      }
    }
    return <Input {...this.config}
      type='textarea'
      rows={6}
      placeholder={field.placeholder}
      value={value}
      onChange={e => this.handleChange(e.target.value)} />
  }
}
