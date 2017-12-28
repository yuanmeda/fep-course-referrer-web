/**
 * @description 中考选科组件：组织树配置
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  tenantId: [String] 租户id
 *  getStudentsStatus: [Fun] 获取学生信息是否导入状态
 *  getOrgTreeStatus: [Fun] 获取组织树信息是否导入状态
 *  orgTreeStatus: [bool] 学生信息是否导入状态
 *  studentsStatus: [bool] 组织树信息是否导入状态
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import UploadFile from 'components/Upload'
import AsyncPolling from 'components/AsyncPolling'
import request from 'ae/shared/request'
import _remove from 'lodash/remove'
import Dialog from 'components/dialog'

@componentIntl('OrgTree')
class OrgTree extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    this.state = {
      orgTreeStatus: props.orgTreeStatus,
      studentsStatus: props.studentsStatus,
      exportTask: []
    }
  }
  // 参数变更 已加载组件收到新的参数时调用
  componentWillReceiveProps (props) {
    this.setState({
      orgTreeStatus: props.orgTreeStatus,
      studentsStatus: props.studentsStatus
    })
  }

  handleTask = (url, res) => {
    const { exportTask } = this.state
    const config = {
      url,
      method: 'post',
      data: res
    }
    request(config).then(resData => {
      exportTask.push(resData)
      this.setState({
        exportTask
      })
    }).catch((err) => {
      let msg = ''
      const code = err.response && err.response.data && err.response.data.code
      switch (code) {
        case 'CRS/TENANT_UNCONFIG':
          msg = '租户未配置(请先完成租户配置)'
          break
        case 'CRS/EMPTY_FILE':
          msg = '文件数据为空'
          break
        case 'CRS/ORG_TREE_UNIMPORT':
          msg = '组织树未导入(请先导入组织树)'
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

  hanldeSuccessOrgTree = (res, file) => {
    const url = `${ORIGINS.FEP}/v1/admins/tenants/${this.props.tenantId}/org_tree/import`
    this.handleTask(url, res)
  }

  hanldeSuccessStudent = (res, file) => {
    const url = `${ORIGINS.FEP}/v1/admins/tenants/${this.props.tenantId}/students/import`
    this.handleTask(url, res)
  }

  removeTask = (task) => {
    const { exportTask } = this.state
    exportTask.forEach(taskItem => {
      if (taskItem.session_id === task.session_id) {
        _remove(exportTask, taskItem)
      }
    })
    this.setState({
      exportTask
    })
  }

  onExportSuccess = task => {
    const that = this
    that.removeTask(task)
    that.props.getOrgTreeStatus()
    that.props.getStudentsStatus()
  }

  onFail = task => {
    const result = JSON.parse(task.result)
    const message = result.errors.map((item, index) => {
      return `${index + 1}: ${item.message}`
    })
    this.removeTask(task)
    Dialog.warning({
      title: '提示',
      content: message.join('\n')
    })
  }

  render () {
    const {orgTreeStatus, studentsStatus, exportTask} = this.state
    return (
      <div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>组织树数据</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__tree'>
              <span className='slp-mod-seniorexam__treelabel'>组 织 树：</span>
              {!orgTreeStatus
                ? <UploadFile
                  label={<a className='slp-mod-seniorexam__treetxt'>初始数据导入</a>}
                  onSuccess={this.hanldeSuccessOrgTree} />
                : <span><span className='slp-mod-seniorexam__treetxt'>初始数据</span>
                  <UploadFile
                    label={<a className='slp-ui-linkbtn slp-ui-linkbtn--default slp-ui-linkbtn--refresh'>重新导入</a>}
                    onSuccess={this.hanldeSuccessOrgTree} />
                </span>
              }
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>学生信息导入</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__tree'>
              <span className='slp-mod-seniorexam__treelabel'>学 生 信 息：</span>
              {!studentsStatus
                ? <UploadFile
                  label={<a className='slp-mod-seniorexam__treetxt'>初始数据导入</a>}
                  onSuccess={this.hanldeSuccessStudent} />
                : <span><span className='slp-mod-seniorexam__treetxt'>初始数据</span>
                  <UploadFile
                    label={<a className='slp-ui-linkbtn slp-ui-linkbtn--default slp-ui-linkbtn--refresh'>重新导入</a>}
                    onSuccess={this.hanldeSuccessStudent} />
                </span>
              }
            </div>
          </div>
        </div>
        <AsyncPolling title='正在导入数据' tasks={exportTask} onSuccess={this.onExportSuccess} onFail={this.onFail} />
      </div>
    )
  }
}
export default OrgTree
