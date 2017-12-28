/**
 * @description 中考选科组件：选考科目配置
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  tenantId: [String] 租户id
 *  subjectOptions: [Array] 学科数据集合
 *  referralSubjects: [Array] 科目信息数据
 *  changeState: [Fun] 状态切换
 *  handleChangeTab: [Fun] tab切换
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Button} from 'fish'
import TenantService from 'services/tenant'
import DetailItem from './subject/DetailItem'
import EditItem from './subject/EditItem'

@componentIntl('Subject')
class Subject extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      currentState: '',
      referralSubjects: props.referralSubjects,
      subjectOptions: props.subjectOptions
    }
  }

  componentDidMount () {
    this.setState({
      currentState: this.props.referralSubjects ? 'detail' : 'undetail'
    })
  }

  componentWillReceiveProps (props) {
    if (props.referralSubjects) {
      this.setState({
        referralSubjects: props.referralSubjects,
        currentState: 'detail'
      })
    }
    if (props.subjectOptions) {
      this.setState({
        subjectOptions: props.subjectOptions
      })
    }
  }

  submitReferral = data => {
    const that = this
    return TenantService.setReferralSubject({
      tenant_id: that.props.tenantId,
      data: {
        referral_subjects: data
      }
    }).then(res => {
      that.setState({
        currentState: 'detail',
        referralSubjects: res.referral_subjects
      })
      that.props.changeState(false, 'unConfigRule')
      that.props.handleChangeTab('optional')
      return res
    })
  }

  changeState = (value, key) => {
    this.setState({
      [key]: value
    })
  }
  render () {
    const {currentState, referralSubjects, subjectOptions} = this.state
    return (
      currentState === 'undetail'
        ? <EditItem
          changeState={this.changeState}
          submitReferral={this.submitReferral}
          referralSubjects={referralSubjects}
          subjectEnum={subjectOptions} />
        : <div className='slp-mod-seniorexam__setbody'>
          {referralSubjects && referralSubjects.map((item, index) => {
            return <DetailItem itemData={item} subjectEnum={subjectOptions} key={index} num={index} />
          })}
          <div className='slp-mod-seniorexam__btns'>
            <Button type='primary' onClick={() => { this.changeState('undetail', 'currentState') }}>修改</Button>
          </div>
        </div>
    )
  }
}
export default Subject
