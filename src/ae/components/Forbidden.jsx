import React, { Component, PropTypes } from 'react'
import { contextTypes } from 'ae/core/shapes'

export default class Forbidden extends Component {
  static contextTypes = contextTypes
  static propTypes = {
    code: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired
  }

  render () {
    const { code, message } = this.props
    return (
      <div className='ae-component-forbidden'>
        <h3>{code}</h3>
        <p>{message}</p>
      </div>
    )
  }
}
