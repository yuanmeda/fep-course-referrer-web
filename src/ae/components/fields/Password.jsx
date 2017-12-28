import React from 'react'
import repeat from 'lodash/repeat'
import AEComponentField from 'ae/components/Field'
import { Input } from 'fish'

export default class AEComponentFieldPassword extends AEComponentField {
  // @override
  // static defaultConfig = {}

  displayRender ({ value }) {
    // 显示为星号
    // TODO 支持配置显示密码
    return <div>{ value != null ? repeat('*', value.length || 6) : '-' }</div>
  }

  editRender ({ value }) {
    const { field } = this.props
    return <Input {...this.config} type='password' placeholder={field.placeholder} value={value} onChange={e => this.handleChange(e.target.value)} />
  }
}
