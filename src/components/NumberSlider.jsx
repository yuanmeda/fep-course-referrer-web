/**
 * @function 根据fish定制滑动条
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-13 20:11:38
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   config:{}  // fish滑动静态配置（http://fish-docs.dev.web.nd/components/slider-cn/）
 *   value  // 当前取值
 *   onChange  // 滑动回调，传入改变后值
 *   prefixText  // 前缀文字，空时不显示
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import { Slider } from 'fish'

@componentIntl('NumberSlider')
export default class NumberSlider extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    this.sliderConfig = Object.assign({
      max: 10,
      min: 1,
      step: 1
    }, props.config)
    this.state = {
      sliderValue: props.value
    }
  }

  componentWillReceiveProps (nextProps) {
    this.state = {
      sliderValue: nextProps.value
    }
  }

  onSliderChange = value => {
    const { onChange } = this.props
    this.setState({
      sliderValue: value
    })
    onChange(value)
  }

  render () {
    const { prefixText } = this.props
    const { sliderValue } = this.state
    return <span>
      <span className={prefixText ? 'slp-mod-seniorexam__slidername' : 'hide'}>{prefixText}</span>
      <div className='slp-ui-slider'>
        <Slider {...this.sliderConfig} value={sliderValue} onChange={this.onSliderChange} />
        <div className='slp-ui-slider__num'>{sliderValue}</div>
      </div>
    </span>
  }
}
