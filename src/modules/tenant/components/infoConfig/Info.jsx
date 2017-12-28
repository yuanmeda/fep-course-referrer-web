/**
 * @description 中考选科组件：租户信息配置
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  tenantId: [String] 租户id
 *  type: [Fun] 当前tab项
 *  tanentInfo: [Object] 租户信息
 *  changeState: [Fun] 状态切换
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import TenantService from 'services/tenant'
import CreateTenant from './Create'
import DetailTenant from './Detail'
import Dialog from 'components/dialog'

@componentIntl('tanentInfo')
class tanentInfo extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      tanentInfo: props.tanentInfo,
      currentState: props.type,
      tenantId: props.tenantId
    }
  }

  componentWillReceiveProps (props) {
    if (props.tanentInfo) {
      this.setState({
        tanentInfo: props.tanentInfo
      })
    }
    if (props.tenantId) {
      this.setState({
        tenantId: props.tenantId
      })
    }
    this.setState({
      currentState: props.tanentInfo ? 'detail' : 'create'
    })
  }

  // 新增租户
  submitInfo = paramData => {
    const that = this
    TenantService.addTenants(paramData).then(res => {
      that.setState({
        tanentInfo: paramData
      })
      that.props.changeState(res.tenant_id, 'tenantId')
      that.changeState('detail', 'currentState')
    }).catch((err) => {
      let msg = ''
      const code = err.response && err.response.data && err.response.data.code
      switch (code) {
        case 'CRS/TENANT_HAS_EXIST':
          msg = '租户已存在'
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

  // 修改租户
  editTenant = paramData => {
    const that = this
    TenantService.editTenants({tenant_id: that.state.tenantId, data: paramData}).then(res => {
      that.setState({
        tanentInfo: Object.assign({}, that.state.tanentInfo, {
          tenant_name: paramData.tenant_name
        })
      })
      that.changeState('detail', 'currentState')
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
    })
  }
  changeState = (value, key) => {
    this.setState({
      [key]: value
    })
  }

  render () {
    const {tanentInfo, currentState} = this.state
    return (
      currentState === 'create' ? <CreateTenant submitInfo={this.submitInfo} />
        : <DetailTenant
          currentState={currentState}
          tanentInfo={tanentInfo}
          changeState={this.changeState}
          editTenant={this.editTenant} />
    )
  }
}
export default tanentInfo
