import React from 'react'
// import { componentIntl } from 'ae/core/intl'
import AEComponentField from 'ae/components/Field'
import { Radio } from 'fish'
const RadioGroup = Radio.Group

// @componentIntl(`AE.Field.Radio`)
export default class AEComponentFieldRadio extends AEComponentField {
  editRender ({ value }) {
    const { field } = this.props
    const options = field.options
    return (
      <RadioGroup {...this.config} value={value} onChange={e => this.handleChange(e.target.value)} >
        {options.map((option, index) => <Radio value={option.value} key={index}>{option.label}</Radio>)}
      </RadioGroup>
    )
  }

  displayRender ({ value }) {
    const { field } = this.props
    const result = field.options.filter(option => option.value === value)
    return <div> { result[0] ? result[0].label : '-' }</div>
  }
}
