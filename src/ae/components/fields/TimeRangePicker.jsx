import React from 'react'
import AEComponentField from 'ae/components/Field'
import { TimePicker } from 'fish'
import moment from 'moment'

import { DEFAULT_TIME_FORMAT } from 'ae/shared/constants'

const { TimeRangePicker } = TimePicker

// 需要升级 Fish
export default class AEComponentFieldTimeRangePicker extends AEComponentField {
  handleChange = (d, value) => {
    const { onChange } = this.props
    this.setState({ value })
    onChange && onChange(value)
  }

  isValidTime = (time) => time !== 0 && time !== '' && time !== null && time !== undefined

  isValidTimeRange = (range) => Array.isArray(range) && range.length === 2 && range.every(time => this.isValidTime(time))

  isValidPlaceholder = (placeholder) => Array.isArray(placeholder) && placeholder.length === 2 && placeholder.every(str => str)

  editRender ({ value }) {
    const { format = DEFAULT_TIME_FORMAT } = this.config
    const { placeholder } = this.props.field
    const range = this.isValidTimeRange(value) ? value.map(val => val ? (isNaN(val) ? moment(val, format) : moment(+val)) : null) : [null, null]
    const config = { ...this.config, format, value: range }
    if (placeholder) {
      if (this.isValidPlaceholder(placeholder)) {
        config.placeholder = placeholder
      } else {
        console.warn('placeholder 不合法, 请参考 http://fish-docs.dev.web.nd/components/time-picker-cn/#TimePicker.TimeRangePicker')
      }
    }
    return (<TimeRangePicker {...config} onChange={this.handleChange} />)
  }

  displayRender ({ value }) {
    if (!this.isValidTimeRange(value)) {
      return <div>-</div>
    }

    const { format, sep = '~' } = this.config

    // 插入分隔符
    value.splice(1, 0, sep)
    return (
      <div>{value.map((time, index) => (
        <span key={index}>{time === sep ? sep : moment(time).format(format || DEFAULT_TIME_FORMAT)}</span>
      ))}
      </div>)
  }
}
