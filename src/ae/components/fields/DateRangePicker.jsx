import React from 'react'
import AEComponentField from 'ae/components/Field'
import { DatePicker } from 'fish'
import moment from 'moment'

import { DEFAULT_TIME_FORMAT, DEFAULT_DATE_FORMAT } from 'ae/shared/constants'

const { RangePicker } = DatePicker

export default class AEComponentFieldDateRangePicker extends AEComponentField {
  constructor (props) {
    super(props)
    if (this.config.format === DEFAULT_TIME_FORMAT) {
      console.warn('请直接使用 FieldTimeRangePicker')
    }
  }

  handleChange = (d, value) => {
    const { onChange } = this.props
    this.setState({ value })
    onChange && onChange(value)
  }

  isValidDate = (date) => date !== 0 && date !== '' && date !== null && date !== undefined

  isValidDateRange = (range) => Array.isArray(range) && range.length === 2 && range.every(date => this.isValidDate(date))

  isValidPlaceholder = (placeholder) => Array.isArray(placeholder) && placeholder.length === 2 && placeholder.every(str => str)

  editRender ({ value }) {
    const { format = DEFAULT_DATE_FORMAT } = this.config
    const { placeholder } = this.props.field
    const showTime = /[hmsH]/.test(format)
    const range = this.isValidDateRange(value) ? value.map(val => val ? (isNaN(val) ? moment(val, format) : moment(+val)) : null) : [null, null]

    const config = { ...this.config, format, value: range, showTime }
    if (placeholder) {
      if (this.isValidPlaceholder(placeholder)) {
        config.placeholder = placeholder
      } else {
        console.warn('placeholder 不合法, 请参考 http://fish-docs.dev.web.nd/components/date-picker-cn/#RangePicker')
      }
    }
    return (<RangePicker {...config} onChange={this.handleChange} />)
  }

  displayRender ({ value }) {
    if (!this.isValidDateRange(value)) {
      return <div>-</div>
    }

    const { format, sep = '~' } = this.config

    // 插入分隔符
    value.splice(1, 0, sep)
    return (
      <div>{value.map((date, index) => (
        <span key={index}>{date === sep ? sep : moment(date).format(format || DEFAULT_DATE_FORMAT)}</span>
      ))}
      </div>)
  }
}
