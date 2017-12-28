/**
 * @description 中考选科组件：选科配置
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  tenantId: [String] 租户id
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Tabs} from 'fish'
import TenantService from 'services/tenant'
import Subject from './Subject'
import ScoringRule from './ScoringRule'
import OptionalRule from './OptionalRule'
import EnumService from 'services/enum'

const TabPane = Tabs.TabPane

@componentIntl('courseConfig')
class courseConfig extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      currentTab: 'subject',
      subjectOptions: [],
      referralRule: null,
      referralSubjects: null,
      scoringRule: null,
      unConfigRule: true,
      unConfigScore: true
    }
  }
  componentDidMount () {
    this.getReferralSubjects()
    EnumService.tenantCourseEnum(this.props.tenantId).then(courseMap => {
      this.setState({
        subjectOptions: courseMap.map(item => {
          item.label = item.name
          item.value = item.code
          item.key = item.code
          return item
        })
      })
    })
  }

  getReferralSubjects = () => {
    const that = this
    return TenantService.getReferralSubjectConfig({tenant_id: that.props.tenantId}).then(res => {
      that.setState({
        unConfigRule: !(res && res.referral_subjects),
        unConfigScore: !(res && res.referral_rule),
        referralSubjects: res && res.referral_subjects,
        referralRule: res && res.referral_rule,
        scoringRule: res && res.scoring_rule
      })
      return res
    })
  }

  changeState = (value, key) => {
    this.setState({
      [key]: value
    })
  }
  handleChangeTab = (value) => {
    const that = this
    // 重新获取新的数据
    that.getReferralSubjects()
    that.setState({
      'currentTab': value
    })
  }

  render () {
    const {currentTab, unConfigRule, unConfigScore, subjectOptions, referralSubjects, referralRule, scoringRule} = this.state
    const {tenantId} = this.props
    return (
      <Tabs defaultActiveKey={currentTab} activeKey={currentTab} onTabClick={this.handleChangeTab} tabPosition='left'>
        <TabPane tab='选考科目' key='subject'>
          <Subject
            tenantId={tenantId}
            changeState={this.changeState}
            subjectOptions={subjectOptions}
            referralSubjects={referralSubjects}
            handleChangeTab={this.handleChangeTab} />
        </TabPane>
        <TabPane tab='选考规则' key='optional' disabled={unConfigRule}>
          <OptionalRule
            tenantId={tenantId}
            changeState={this.changeState}
            referralSubjects={referralSubjects}
            referralRule={referralRule}
            handleChangeTab={this.handleChangeTab} />
        </TabPane>
        <TabPane tab='计分规则' key='scoring' disabled={unConfigScore}>
          <ScoringRule
            referralRule={referralRule}
            scoringRule={scoringRule}
            tenantId={tenantId} />
        </TabPane>
      </Tabs>
    )
  }
}
export default courseConfig
