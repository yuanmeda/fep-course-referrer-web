import React from 'react'
import AEComponentField from 'ae/components/Field'
import { DatePicker } from 'fish'
import moment from 'moment'
import { DEFAULT_FORMAT, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from 'ae/shared/constants'

export default class AEComponentFieldDatePicker extends AEComponentField {
  // @override
  handleChange = (d, value) => {
    const { onChange, field } = this.props
    // 如果是数字类型的时间，则需要转成数字
    if (field.type === 'number') {
      // 时间被清空时 d 为 null
      value = d ? d.valueOf() : 0
    }
    this.setState({ value })
    onChange && onChange(value)
  }

  editRender ({ value }) {
    // moment 并不能识别数字字符串
    const { format = DEFAULT_FORMAT } = this.config
    const { placeholder } = this.props.field
    const showTime = /[hmsH]/.test(format)
    return <DatePicker {...this.config}
      placeholder={placeholder}
      format={format}
      value={value ? (isNaN(value) ? moment(value, format) : moment(+value)) : null}
      showTime={showTime}
      onChange={this.handleChange} />
  }

  displayRender ({ value }) {
    if (value === 0 || value === '' || value === null || value === undefined) {
      return <div>-</div>
    }

    const { type = 'datetime', format } = this.config
    switch (type) {
      case 'date':
        return <div>{moment(value).format(format || DEFAULT_DATE_FORMAT)}</div>
      case 'time':
        return <div>{moment(value).format(format || DEFAULT_TIME_FORMAT)}</div>
      case 'datetime':
        return <div>{moment(value).format(format || DEFAULT_FORMAT)}</div>
      default:
        return <div>{value}</div>
    }
  }
}
