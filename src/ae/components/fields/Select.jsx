import React from 'react'
import AEComponentField from 'ae/components/Field'
import { Select } from 'fish'

export default class AEComponentFieldSelect extends AEComponentField {
  editRender ({ value }) {
    const { placeholder, options = [] } = this.props.field
    return <Select {...this.config} placeholder={placeholder} value={value}
      onChange={this.handleChange}>
      {options.map(({value, label}) =>
        <Select.Option value={value} key={value}>{label}</Select.Option>)}
    </Select>
  }

  displayRender ({ value }) {
    const { options = [] } = this.props.field
    const result = options.find(option => option.value === value)
    return <div> {result && result.label ? result.label : '-' }</div>
  }
}
