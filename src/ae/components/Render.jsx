import React, { Component } from 'react'

export default class AEComponentRender extends Component {
  static propTypes = {
    value: React.PropTypes.any
  }

  // TODO componentWillMount？
  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  render () {
    const { value } = this.props

    return <div>{value}</div>
  }
}
