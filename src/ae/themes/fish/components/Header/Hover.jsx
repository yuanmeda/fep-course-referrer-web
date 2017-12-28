import React, { Component, PropTypes } from 'react'

export default class Hover extends Component {
  state = {
    hover: false
  }

  static propTypes = {
    className: PropTypes.string,
    overlay: PropTypes.element,
    children: PropTypes.element
  }

  handleMouseEnter = () => {
    this.setState({
      hover: true
    })
  }

  handleMouseLeave = () => {
    this.setState({
      hover: false
    })
  }

  render () {
    const { className, overlay, children } = this.props
    return (
      <div
        className={className}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        { this.state.hover ? overlay : children }
      </div>
    )
  }
}
