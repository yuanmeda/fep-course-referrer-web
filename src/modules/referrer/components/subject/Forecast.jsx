/**
 * @function 重新预测设置重要程度
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-18 16:03:50
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *    trigger // 触发获取数据
 *    initTrigger
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import NumberSlider from 'components/NumberSlider'
import isEmpty from 'lodash/isEmpty'
import DataEmpty from 'components/DataEmpty'
import Dialog from 'components/dialog'
import Result from './Result'

@componentIntl('Forecast')
export default class Forecast extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      forecastData: null,
      showEmpty: null,
      visible: false,
      referralId: '',
      trigger: false
    }
    this.slideData = [{
      code: 'academic_record',
      name: '学习成绩'
    }, {
      code: 'subject_interest',
      name: '学科兴趣度'
    }, {
      code: 'learning_effort',
      name: '学习努力度'
    }]
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.trigger) {
      nextProps.initTrigger()
      this.getReferralAgainConfig()
    }
  }

  getReferralAgainConfig = () => {
    const config = {
      url: `${ORIGINS.FEP}/v1/students/referral_again/config`,
      method: 'get'
    }
    request(config).then(resData => {
      // 初始值为0数据转为1
      for (const item in resData) {
        resData[item] = resData[item] ? resData[item] : 1
      }
      this.setState({
        forecastData: resData,
        showEmpty: isEmpty(resData),
        visible: true
      })
    })
  }

  onSlideChange = (key, value) => {
    const { forecastData } = this.state
    forecastData[key] = value
    this.setState({
      forecastData
    })
  }

  onOk = () => {
    const { forecastData } = this.state
    const config = {
      url: `${ORIGINS.FEP}/v1/students/referral_again/config`,
      method: 'put',
      data: forecastData
    }
    request(config).then(resData => {
      this.setState({
        visible: false,
        trigger: true,
        referralId: resData.referral_id
      })
    })
  }

  onCancel = () => {
    this.setState({
      visible: false
    })
  }

  initTrigger = () => {
    this.setState({
      trigger: false
    })
  }

  render () {
    const { showEmpty, forecastData, visible, referralId, trigger } = this.state
    if (showEmpty) {
      return <DataEmpty />
    } else if (!forecastData) {
      return null
    }
    return <div>
      <Dialog title='中考选科重新预测'
        wrapClassName='slp-ndui-modal'
        visible={visible}
        onCancel={this.onCancel}
        okText='重新预测'
        onOk={this.onOk}
        cancelText='取消'>

        <div style={{padding: '0 40px'}}>
          <div className='slp-mod-seniorexam__tip5 tl'>每个人对成绩、兴趣和努力的重视程度并不一样。在您心目中它们的重要程度是怎样的呢？（分值越大代表越重要，1是基本不重要，10是非常重要。）</div>
          {this.slideData.map((item, index) => {
            return <div key={index} className='slp-mod-seniorexam__sliderlist slp-mod-seniorexam__sliderlist2'>
              <NumberSlider prefixText={item.name} value={forecastData[item.code]} onChange={value => {
                this.onSlideChange(item.code, value)
              }} />
            </div>
          })}
          <p className='slp-mod-seniorexam__tip6'>提示：成绩不能全面反映您的真实情况，成绩、兴趣度、努力度对您而言的重要程度也十分有价值。设置这三项参数后，重新预测结果将更准确。</p>
        </div>
      </Dialog>

      <Result trigger={trigger} initTrigger={this.initTrigger} referralId={referralId} />
    </div>
  }
}
