import React from 'react'
import AEComponentField from 'ae/components/Field'
import { Input, InputNumber } from 'fish'

export default class AEComponentFieldInput extends AEComponentField {
  // @override
  // static defaultConfig = {}

  editRender ({ value }) {
    const { field } = this.props
    return field.type === 'number'
      ? <InputNumber {...this.config} placeholder={field.placeholder} value={value} onChange={value => this.handleChange(value)} />
      : <Input {...this.config} placeholder={field.placeholder} value={value} onChange={e => this.handleChange(e.target.value)} />
  }
}
