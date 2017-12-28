import React from 'react'
import AEComponentField from 'ae/components/Field'
import { TimePicker } from 'fish'

// 没有使用场景，还没有测试, 暂时不启用

export default class AEComponentFieldTimePicker extends AEComponentField {
  render () {
    const { field } = this.props
    return <TimePicker {...this.config} defaultValue={this.state.value} placeholder={field.placeholder} onChange={(d, value) => { this.handleChange(value) }} />
  }
}
