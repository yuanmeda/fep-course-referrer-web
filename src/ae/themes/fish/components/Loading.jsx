import React, { Component } from 'react'
import { Spin } from 'fish'

export default class Loading extends Component {
  render () {
    return (
      <div className='ae-layout-global-loading'>
        <Spin size='large' />
      </div>
    )
  }
}
