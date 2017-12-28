/**
 * @function 选考科目排序列表
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-07 21:12:13
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   trigger: 触发获取数据
 *   initTrigger
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import SubjectList from './SubjectList'
import ReferralInfo from './ReferralInfo'
import DataEmpty from 'components/DataEmpty'
import Dialog from 'components/dialog'

@componentIntl('ReferralList')
export default class ReferralList extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      referralData: null,
      showEmpty: null
    }
  }

  componentDidMount () {
    this.getReferralData()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.trigger) {
      nextProps.initTrigger()
      this.getReferralData()
    }
  }

  getReferralData = () => {
    const config = {
      url: `${ORIGINS.FEP}/v1/students/referral`,
      method: 'get'
    }
    request(config).then(resData => {
      this.setState({
        referralData: resData,
        showEmpty: !(resData && resData.total)
      })
    }, e => {
      this.setState({
        showEmpty: true
      })
    })
  }

  /**
   * [onSubmit 试提交，验证首选学科必填，备选项0-2，验证通过弹窗信息提交]
   */
  onSubmit = (referralData, subjectList) => {
    let preferenceCount = 0
    let alternateCount = 0
    let warnTip
    const preferenceSubjectData = []
    const alternateSubjectData = []
    referralData && referralData.items.forEach(item => {
      if (item.valid_select_status === 1) {
        preferenceCount++
        preferenceSubjectData.push(item.subject)
      } else if (item.valid_select_status === 2) {
        alternateCount++
        alternateSubjectData.push(item.subject)
      }
    })
    if (preferenceCount < 1) {
      warnTip = '请选择首选学科组合！'
    } else if (alternateCount > 2) {
      warnTip = '至多只可选择两种备选学科组合！'
    }
    if (warnTip) {
      Dialog.warning({
        content: warnTip
      })
    } else {
      const choiceSubjectData = preferenceSubjectData.concat(alternateSubjectData)
      this.setState({
        choiceSubjectData: choiceSubjectData.map(item => {
          return item.map(subItem => {
            return {
              code: subItem,
              name: subjectList.getName(subItem)
            }
          })
        })
      })
      this.infoModal(true)
    }
  }

  // 选科依据弹窗
  infoModal = isShow => {
    this.setState({
      infoVisible: isShow
    })
  }

  render () {
    const { showEmpty, referralData, infoVisible, choiceSubjectData } = this.state
    if (showEmpty === true) {
      return <DataEmpty />
    } else if (!referralData) {
      return null
    }
    return <div>
      <SubjectList subjectData={referralData} onSubmit={this.onSubmit} />

      <ReferralInfo visible={infoVisible} closeModal={this.infoModal} referralId={referralData.referral_id} choiceSubjectData={choiceSubjectData} />
    </div>
  }
}
