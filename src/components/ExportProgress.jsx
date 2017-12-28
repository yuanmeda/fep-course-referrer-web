/**
 * @function 异步任务导出进度
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-18 17:26:43
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   title: '', // 进度标题
 *   tasks: [{session_id, title}] // 轮询任务
 *   onSuccess
 * }
 */

import React from 'react'
import { Component, componentIntl, propTypes, contextTypes } from 'ae'
import Downer from 'services/downer'
import AsyncPolling from 'components/AsyncPolling'

@componentIntl('ExportProgress')
export default class ExportProgress extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      tasks: props.tasks
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      tasks: nextProps.tasks
    })
  }

  downloadFile = url => {
    Downer(url)
  }

  onPollingSuccess = taskItem => {
    const { onSuccess } = this.props
    const result = JSON.parse(taskItem.result)
    this.downloadFile(result.file_url)
    if (onSuccess) {
      onSuccess(taskItem)
    }
  }

  onPollingFail = taskItem => {
    const { onFail } = this.props
    if (onFail) {
      onFail(taskItem)
    }
  }

  render () {
    const { tasks } = this.state
    return <AsyncPolling title='正在导出数据' tasks={tasks} onSuccess={this.onPollingSuccess} onFail={this.onPollingFail} />
  }
}
