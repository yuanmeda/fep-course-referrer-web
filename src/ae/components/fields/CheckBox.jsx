import React from 'react'
import AEComponentField from 'ae/components/Field'
import { Checkbox } from 'fish'

export default class AEComponentFieldCheckBox extends AEComponentField {
  editRender ({ value }) {
    const { field } = this.props
    const options = field.options
    return <Checkbox.Group options={options} defaultValue={value} onChange={this.handleChange} />
  }

  displayRender ({ value }) {
    const { field } = this.props
    var valToLabel = {}
    field.options.forEach(item => {
      valToLabel[item.value] = item.label
    })
    const res = value.map(val => valToLabel[val])
    return <div>{(value && value.length > 0) ? res.join(',') : '-'}</div>
  }
}
