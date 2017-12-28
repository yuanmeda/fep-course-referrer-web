import React, { PropTypes } from 'react'
import { Component } from 'ae'
import isEqual from 'lodash/isEqual'

export default class Progress extends Component {
  static propTypes = {
    show: PropTypes.bool
  }

  state = {
    size: 0,
    disappearDelayHide: false, // when dispappear, first transition then display none
    percent: 0,
    appearDelayWidth: 0 // when appear, first display block then transition width
  }

  componentWillReceiveProps (nextProps) {
    const { show } = nextProps

    if (show) {
      this.show()
    } else {
      this.hide()
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(nextState, this.state)
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  show () {
    let { size, percent } = this.state

    const appearDelayWidth = size === 0
    percent = this.calculatePercent(percent)

    this.setState({
      size: ++size,
      appearDelayWidth,
      percent
    })

    if (appearDelayWidth) {
      setTimeout(() => {
        // 增加加载判断，避免在已卸载的组件中执行 setState
        this._isMounted && this.setState({
          appearDelayWidth: false
        })
      }, 0) // TODO 之前为什么缺少延迟毫秒数？
    }
  }

  hide () {
    let { size } = this.state

    if (--size < 0) {
      this.setState({ size: 0 })
      return
    }

    this.setState({
      size: 0,
      disappearDelayHide: true,
      percent: 1
    })

    setTimeout(() => {
      this._isMounted && this.setState({
        disappearDelayHide: false,
        percent: 0
      })
    }, 500)
  }

  getBarStyle () {
    const { disappearDelayHide, appearDelayWidth, percent } = this.state

    return {
      width: appearDelayWidth ? 0 : `${percent * 100}%`,
      display: disappearDelayHide || percent > 0 ? 'block' : 'none'
    }
  }

  calculatePercent (percent = 0) {
    let random = 0

    if (percent < 0.25) {
      random = (Math.random() * (5 - 3 + 1) + 10) / 100
    } else if (percent < 0.65) {
      random = (Math.random() * 3) / 100
    } else if (percent < 0.9) {
      random = (Math.random() * 2) / 100
    } else if (percent < 0.99) {
      random = 0.005
    } else {
      random = 0
    }

    return percent + random
  }

  render () {
    return (
      <div className='loading-bar'>
        <div className='loading'>
          <div
            className='bar'
            style={this.getBarStyle()}>
            <div className='peg' />
          </div>
        </div>
      </div>
    )
  }
}
