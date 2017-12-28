/**
 * @function 选科历史
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-07 21:11:40
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import React from 'react'
import { Component, componentIntl, propTypes, contextTypes } from 'ae'
import ReferralRecode from './history/ReferralRecode'
import ForecastRecode from './history/ForecastRecode'
import { Radio } from 'fish'
const RadioGroup = Radio.Group

// 模块名
@componentIntl('History')
export default class History extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      tabKey: props.tabKey,
      radioKey: 'referralRecode' // 'forecastRecode'
    }
  }

  // 参数变更
  componentWillReceiveProps (props) {
    this.setState({
      tabKey: props.tabKey
    })
  }

  onChange = e => {
    this.setState({
      radioKey: e.target.value
    })
  }

  render () {
    const { tabKey, radioKey } = this.state
    if (tabKey !== 'history') {
      return null
    }
    return <div className='slp-mod-seniorexam__radio'>
      <RadioGroup onChange={this.onChange} value={radioKey}>
        <Radio value='referralRecode'>提交选科记录</Radio>
        <Radio value='forecastRecode'>重新预测记录</Radio>
      </RadioGroup>
      {
        radioKey === 'referralRecode' ? <ReferralRecode /> : <ForecastRecode />
      }
    </div>
  }
}
