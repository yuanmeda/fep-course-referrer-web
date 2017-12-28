/**
 * @function 重新预测结果
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-18 16:28:39
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *    trigger // 触发获取数据
 *    referralId  // 预测id，请求结果数据
 *    initTrigger
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import Dialog from 'components/dialog'
import SubjectList from './SubjectList'

@componentIntl('Result')
export default class Result extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      resultData: null,
      visible: false
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.trigger) {
      nextProps.initTrigger()
      this.getReferralAgain(nextProps.referralId)
    }
  }

  getReferralAgain = (referralId) => {
    const config = {
      url: `${ORIGINS.FEP}/v1/students/referral_again/${referralId}`,
      method: 'get'
    }
    request(config).then(resData => {
      this.setState({
        resultData: resData,
        visible: true
      })
    })
  }

  onCancel = () => {
    this.setState({
      visible: false
    })
  }

  render () {
    const { resultData, visible } = this.state
    return <Dialog title='中考选科重新预测结果'
      wrapClassName='slp-ndui-modal'
      visible={visible}
      onCancel={this.onCancel}
      cancelText='取消'>

      <SubjectList subjectData={resultData} isReadOnly />
    </Dialog>
  }
}
