/**
 * @description 中考选科组件：选考规则配置
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  tenantId: [String] 租户id
 *  referralRule: [Array] 选考规则数据
 *  referralSubjects: [Array] 科目信息数据
 *  changeState: [Fun] 状态切换
 *  handleChangeTab: [Fun] tab切换
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Button} from 'fish'
import EditRuleItem from './rule/EditRuleItem'
import TenantService from 'services/tenant'
import Dialog from 'components/dialog'

@componentIntl('OptionalRule')
class OptionalRule extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    this.state = {
      currentState: '',
      tenantId: props.tenantId,
      referralSubjects: props.referralSubjects || [],
      referralRule: props.referralRule
    }
  }
  componentDidMount () {
    this.setState({
      currentState: this.props.referralRule ? 'detail' : 'undetail'
    })
  }

  componentWillReceiveProps (props) {
    if (props.referralSubjects) {
      const rangeOptions = props.referralSubjects.map(item => {
        return {
          label: item.subject_name,
          value: item.subject_id
        }
      })
      this.setState({
        referralSubjects: rangeOptions
      })
    }
    if (props.referralRule) {
      this.setState({
        referralRule: props.referralRule,
        currentState: 'detail'
      })
    }
  }

  setReferralRule = data => {
    const that = this
    TenantService.setReferralRule({
      tenant_id: that.props.tenantId,
      data: data
    }).then(res => {
      that.setState({
        currentState: 'detail',
        referralRule: res
      })
      that.props.changeState(false, 'unConfigScore')
      that.props.handleChangeTab('scoring')
    }).catch((err) => {
      let msg = ''
      const code = err.response && err.response.data && err.response.data.code
      switch (code) {
        case 'CRS/REFERRAL_SUBJECT_UNCONFIG':
          msg = '选考科目未配置'
          break
        default:
          break
      }
      if (msg) {
        Dialog.warning({
          title: '提示',
          content: msg
        })
      }
    })
  }

  changeState = (value, key) => {
    this.setState({
      [key]: value
    })
  }

  render () {
    const {referralRule, referralSubjects, currentState} = this.state
    return (
      currentState === 'undetail'
        ? <EditRuleItem
          changeState={this.changeState}
          setReferralRule={this.setReferralRule}
          referralRule={referralRule}
          referralSubjects={referralSubjects} />
        : <div>
          <div className='slp-mod-seniorexam__btnfix'>
            <Button type='primary' onClick={() => { this.changeState('undetail', 'currentState') }}>修改</Button>
          </div>
          <div className='slp-mod-seniorexam__setcol'>
            <span className='slp-mod-seniorexam__setlabel'>需选考科目数：</span>
            <span className='slp-mod-seniorexam__treetxt'>{referralRule && referralRule.referral_subject_num}</span>
          </div>
          {referralRule && referralRule.required_subjects.map((item, index) => {
            item.subjectNames = item.subjects.map(cell => cell.subject_name).join('；')
            return (
              <div className='slp-ui-formcard' key={index}>
                <div className='slp-ui-formcard__head'>必选科目组合</div>
                <div className='slp-ui-formcard__body'>
                  <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol1'>
                    <span className='slp-mod-seniorexam__setlabel'>必选科目范围：</span>
                    <span className='slp-mod-seniorexam__treetxt'>{item.subjectNames}</span>
                  </div>
                  <div className='slp-mod-seniorexam__setcol'>
                    <span className='slp-mod-seniorexam__setlabel'>必选科目数：</span>
                    <span className='slp-mod-seniorexam__treetxt'>{item.num}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
    )
  }
}
export default OptionalRule
