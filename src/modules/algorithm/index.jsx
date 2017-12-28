/**
 * @description 中考选科组件：算法设置
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1 [高精尖业务 v0.9.3]
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Tabs} from 'fish'
import AlgorithmConfig from './component/AlgorithmConfig'
import TenantService from 'services/tenant'
import DataEmpty from 'components/DataEmpty'
import request from 'ae/shared/request'

const TabPane = Tabs.TabPane

@componentIntl('Algorithm')
class Algorithm extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      isConfigTenant: undefined,
      currentCourse: '',
      courseTabData: null
    }
  }
  componentDidMount () {
    request({
      url: `${ORIGINS.FEP}/v1/common/tenant_status`,
      method: 'get'
    }).then(res => {
      if (res.status) {
        TenantService.getTenantCourse().then(res => {
          if (res && res.courses) {
            this.setState({
              courseTabData: res.courses,
              currentCourse: res.courses[0].course
            })
          }
        })
      }
      this.setState({
        isConfigTenant: res.status
      })
    })
  }

  handleChangeTab = (value) => {
    this.setState({
      'currentCourse': value
    })
  }

  render () {
    const {isConfigTenant, currentCourse, courseTabData} = this.state
    return (
      <div className='main-wrap wrapper slp-mod-seniorexam'>
        <div className='slp-l-bordermain'>
          {isConfigTenant && courseTabData
            ? <Tabs defaultActiveKey={currentCourse} onChange={this.handleChangeTab}>
              {courseTabData.map(item => {
                return (
                  <TabPane tab={item.name} key={item.course}>
                    <AlgorithmConfig currentCourse={currentCourse} />
                  </TabPane>
                )
              })}
            </Tabs>
            : isConfigTenant === false ? <DataEmpty /> : ''
          }
        </div>
      </div>
    )
  }
}
export default scope => ({
  permission: 0,
  name: '算法设置',
  component: Algorithm
})
