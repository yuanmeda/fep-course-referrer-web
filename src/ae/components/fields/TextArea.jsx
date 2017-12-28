import React from 'react'
import AEComponentField from 'ae/components/Field'
import { Input } from 'fish'

export default class AEComponentFieldTextArea extends AEComponentField {
  editRender ({ value }) {
    const { field } = this.props
    return <Input {...this.config} type='textarea' rows={6} placeholder={field.placeholder} value={value} onChange={e => this.handleChange(e.target.value)} />
  }
}
