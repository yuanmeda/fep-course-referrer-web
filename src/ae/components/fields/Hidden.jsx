import React from 'react'
import AEComponentField from 'ae/components/Field'
import { Input } from 'fish'

export default class AEComponentFieldHidden extends AEComponentField {
  editRender ({ value }) {
    const { field } = this.props
    return <Input {...this.config} type='hidden' placeholder={field.placeholder} value={value} onChange={e => this.handleChange(e.target.value)} />
  }
}
