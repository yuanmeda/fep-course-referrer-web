import React, { Component, PropTypes } from 'react'

export default class Main extends Component {
  static propTypes = {
    children: PropTypes.element
  }

  render () {
    return <main className='ae-layout-main'>{this.props.children}</main>
  }
}
