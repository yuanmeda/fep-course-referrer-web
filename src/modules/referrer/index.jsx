/**
 * @function 学生中考选科页面
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-07 21:08:46
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import React from 'react'
import { Component, contextTypes, propTypes } from 'ae'
import { Tabs, Button } from 'fish'
import Subject from './components/Subject'
import History from './components/History'
import Forecast from './components/subject/Forecast'
import DataEmpty from 'components/DataEmpty'
import isEmpty from 'lodash/isEmpty'

const TabPane = Tabs.TabPane

class ReferrerTab extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    props.get()
    this.state = {
      tabKey: 'subject',
      trigger: false
    }
  }

  onChangeTab = tabKey => {
    this.setState({
      tabKey
    })
  }

  triggerHandle = () => {
    this.setState({
      trigger: true
    })
  }

  initTrigger = () => {
    this.setState({
      trigger: false
    })
  }

  render () {
    const { tabKey, trigger } = this.state
    const { entity } = this.props
    if (isEmpty(entity)) {
      return null
    } else if (!entity.status) {
      return <DataEmpty />
    }
    return <div className='main-wrap wrapper slp-mod-seniorexam'>
      <div className='slp-l-bordermain'>
        <Tabs onChange={this.onChangeTab}>
          <TabPane tab='中考选科' key='subject'>
            <Subject tabKey={tabKey} />
          </TabPane>
          <TabPane tab='选科历史' key='history'>
            <History tabKey={tabKey} />
          </TabPane>
        </Tabs>
      </div>
      <div className={tabKey === 'subject' ? '' : 'hide'}>
        <div className='slp-l-bordermain slp-mod-seniorexam__reset'>
          <span className='slp-mod-seniorexam__tip3'>推荐结果和您设想的不一样吗？那来设置下在您心目中成绩、兴趣和努力的重要程度进行重新预测吧！</span>
          <Button type='primary' onClick={this.triggerHandle}>重新预测</Button>
        </div>
        <Forecast trigger={trigger} initTrigger={this.initTrigger} />
      </div>
    </div>
  }
}

export default scope => ({
  permission: 0,
  name: '学生选科',
  model: 'Form',
  component: ReferrerTab,
  source: {
    uri: `${ORIGINS.FEP}/v1/common/tenant_status`
  }
})
