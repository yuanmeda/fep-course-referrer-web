/**
 * @description 中考选科组件：租户新增和编辑
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  params.id: [String] 编辑态需传租户id
 *  config.componentConfig.fun: [String] 当前操作状态：新增 or 编辑
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Tabs, Button} from 'fish'
import TenantInfo from './infoConfig/Info'
import OrgTree from './orgTreeConfig/OrgTree'
import CourseConfig from './courseConfig/CourseConfig'
import TenantService from 'services/tenant'
import Dialog from 'components/dialog'

const TabPane = Tabs.TabPane

@componentIntl('configTenant')
class configTenant extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      currentType: props.config.componentConfig.fun, // 当前配置类型 新增和编辑 默认是新增页
      currentTab: 'info', // 当前页面 默认租户信息配置页
      tenantId: props.params.id ? props.params.id : '',
      orgTreeStatus: false,
      studentsStatus: false,
      tanentInfo: null
    }
    this.getTenants()
  }
  jumpToList = () => {
    window.location.hash = `#/tenant`
  }

  // 获取租户
  getTenants = () => {
    const that = this
    if (that.state.tenantId) {
      return TenantService.getTenants({
        tenant_id: that.state.tenantId
      }).then(res => {
        that.setState({
          tanentInfo: res
        })
        return res
      }).catch((err) => {
        let msg = ''
        const code = err.response && err.response.data && err.response.data.code
        switch (code) {
          case 'CRS/TENANT_RECORD_NOT_EXIST':
            msg = '租户不存在'
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
        return err
      })
    } else {
      return Promise.resolve(null)
    }
  }

  handleChangeTab = (value) => {
    // 是否有配置租户信息
    if (value === 'tree') {
      this.getTenants().then(res => {
        if (res) {
          this.setState({
            'currentTab': 'tree'
          })
          this.getOrgTreeStatus()
          this.getStudentsStatus()
        } else {
          Dialog.warning({
            title: '提示',
            content: '请先完成租户配置。'
          })
        }
      })
    }
    if (value === 'course') {
      this.getOrgTreeStatus().then(res => {
        if (res.status) {
          this.getStudentsStatus().then(res => {
            if (res.status) {
              this.setState({
                'currentTab': 'course'
              })
            } else {
              Dialog.warning({
                title: '提示',
                content: '请先完成学生信息导入。'
              })
            }
          })
        } else {
          Dialog.warning({
            title: '提示',
            content: '请先完成组织树数据的导入。'
          })
        }
      })
    }
    if (value === 'info') {
      this.setState({
        'currentTab': 'info'
      })
    }
  }

  changeState = (value, key) => {
    this.setState({
      [key]: value
    })
  }

  // 获取组织树数据导入状态
  getOrgTreeStatus = () => {
    if (this.state.tenantId) {
      return TenantService.getOrgTreeStatus({
        tenant_id: this.state.tenantId
      }).then(res => {
        this.setState({
          orgTreeStatus: res.status
        })
        return res
      })
    } else {
      return Promise.resolve({status: false})
    }
  }

  // 获取组学生信息导入状态
  getStudentsStatus = () => {
    if (this.state.tenantId) {
      return TenantService.getStudentsStatus({
        tenant_id: this.state.tenantId
      }).then(res => {
        this.setState({
          studentsStatus: res.status
        })
        return res
      })
    } else {
      return Promise.resolve({status: false})
    }
  }

  render () {
    const {currentType, currentTab, orgTreeStatus, studentsStatus, tenantId, tanentInfo} = this.state
    const operations = <Button type='primary' onClick={this.jumpToList}>返回</Button>
    return (
      <div className='main-wrap wrapper slp-mod-seniorexam'>
        <div className='slp-l-bordermain'>
          <Tabs defaultActiveKey={currentTab} activeKey={currentTab} onTabClick={this.handleChangeTab} tabBarExtraContent={operations}>
            <TabPane tab='租户信息' key='info'>
              <TenantInfo
                type={currentType}
                tenantId={tenantId}
                tanentInfo={tanentInfo}
                changeState={this.changeState} />
            </TabPane>
            <TabPane tab='组织树' key='tree'>
              <OrgTree
                tenantId={tenantId}
                getStudentsStatus={this.getStudentsStatus}
                getOrgTreeStatus={this.getOrgTreeStatus}
                orgTreeStatus={orgTreeStatus}
                studentsStatus={studentsStatus} />
            </TabPane>
            <TabPane tab='选科配置' key='course'>
              <CourseConfig tenantId={tenantId} />
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}
export default configTenant
