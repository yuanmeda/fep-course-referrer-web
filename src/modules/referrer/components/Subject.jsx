/**
 * @function 中考选科
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-07 21:08:52
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import React from 'react'
import { Component, componentIntl, propTypes, contextTypes } from 'ae'
import request from 'ae/shared/request'
import InterestSetting from './subject/InterestSetting'
import ReferralList from './subject/ReferralList'

// 模块名
@componentIntl('Subject')
export default class Subject extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      referralTrigger: false,
      interestTrigger: false,
      tabKey: props.tabKey
    }
  }

  componentDidMount () {
    this.getStatus()
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      tabKey: nextProps.tabKey
    })
  }

  getStatus = () => {
    const config = {
      url: `${ORIGINS.FEP}/v1/students/course_config/status`,
      method: 'get'
    }
    request(config).then(resData => {
      this.setState({
        interestTrigger: !resData.status
      })
    })
  }

  triggerInterest = () => {
    this.setState({
      interestTrigger: true
    })
  }

  initInterestTrigger = () => {
    this.setState({
      interestTrigger: false
    })
  }

  triggerReferral = () => {
    this.setState({
      referralTrigger: true
    })
  }

  initReferralTrigger = () => {
    this.setState({
      referralTrigger: false
    })
  }

  render () {
    const { tabKey, interestTrigger, referralTrigger } = this.state
    if (tabKey !== 'subject') {
      return null
    }
    return <div>
      <p className='slp-mod-seniorexam__intro'>
        根据您参与平台的所有测试得出的学科能力、线下期中期末考试成绩、对各个学科的兴趣度、努力度，进行综合分析，我们将所有的学科组合做了优化排序，您可以结合自己的实际情况进行中考选科。
      </p>
      <div className='slp-mod-seniorexam__control clearfix'>
        <span className='slp-mod-seniorexam__tip'>从下面的推荐中选择1-3个您最倾向的组合</span>
        <a className='slp-mod-seniorexam__link' onClick={this.triggerInterest}>设置兴趣度、努力度</a>
      </div>

      <ReferralList trigger={referralTrigger} initTrigger={this.initReferralTrigger} />

      <InterestSetting trigger={interestTrigger} initTrigger={this.initInterestTrigger} onSubmit={this.triggerReferral} />
    </div>
  }
}
