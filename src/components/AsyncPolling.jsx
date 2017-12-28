/**
 * @function 异步任务轮询
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-22 14:22:20
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   title: '', // 进度标题
 *   tasks: [{session_id, title}], // 轮询任务
 *   onSuccess: fn(taskItem), // 成功回调
 *   onFail: fn(taskItem), // 失败回调
 * }
 */

import React from 'react'
import { Component, componentIntl, propTypes, contextTypes } from 'ae'
import request from 'ae/shared/request'
import _find from 'lodash/find'
import Dialog from 'components/dialog'

let taskPatrolTimer

@componentIntl('AsyncPolling')
export default class AsyncPolling extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      title: props.title,
      tasks: [],
      showList: true
    }
  }

  componentWillReceiveProps (nextProps) {
    let { tasks } = this.state
    if (nextProps.tasks && nextProps.tasks.length) {
      tasks = nextProps.tasks.map(task => {
        const matchTask = _find(tasks, {session_id: task.session_id})
        return matchTask || task
      })
      this.setState({
        tasks: tasks
      }, () => {
        this.creatTaskPatrolTimer()
      })
    }
  }

  // 定时任务轮询（只针对未结束状态）
  creatTaskPatrolTimer = () => {
    const { tasks } = this.state
    const taskIds = []
    tasks.forEach(task => {
      if (task.status !== 2 && task.status !== 3 && task.status !== -1) {
        taskIds.push(task.session_id)
      }
    })
    if (taskPatrolTimer) {
      clearTimeout(taskPatrolTimer)
    }
    if (taskIds.length) {
      taskPatrolTimer = setTimeout(() => {
        this.getAsyncTask(taskIds).then(() => {
          this.creatTaskPatrolTimer()
        })
      }, 1000)
    }
  }

  // 获取异步任务信息
  // "status":int, 任务状态  0：未开始  1：进行中  2：成功   3：失败
  getAsyncTask = (taskIds) => {
    let { tasks } = this.state
    const { onSuccess, onFail } = this.props
    const config = {
      url: `${ORIGINS.FEP}/v1/common/asynctask/actions/batch_get`,
      method: 'get',
      params: {
        task_id: taskIds.join(',')
      }
    }
    return request(config).then(resData => {
      tasks = tasks.map(taskItem => {
        const matchTask = _find(resData, {id: taskItem.session_id})
        return {
          ...taskItem,
          ...matchTask
        }
      })
      this.setState({ tasks })

      tasks.forEach(taskItem => {
        if (taskItem.status === 2) {
          if (onSuccess) {
            onSuccess(taskItem)
          }
        } else if (taskItem.status === 3) {
          if (onFail) {
            onFail(taskItem)
          }
        }
      })
    })
  }

  // 显隐列表
  toggleList = () => {
    let { showList } = this.state
    showList = !showList
    this.setState({ showList })
  }

  // 取消，确认取消操作将此任务状态设为-1:无效
  deleteTask = taskItem => {
    let { tasks } = this.state
    clearTimeout(taskPatrolTimer)
    Dialog.confirm({
      content: '是否取消操作？',
      onOk: () => {
        tasks = tasks.map(task => {
          if (taskItem.id === task.id) {
            task.status = -1
          }
          return task
        })
        this.setState({ tasks }, () => {
          this.creatTaskPatrolTimer()
        })
      },
      onCancel: () => {
        this.creatTaskPatrolTimer()
      }
    })
  }

  render () {
    const { title, tasks, showList } = this.state
    const validTasks = []
    tasks.forEach(task => {
      if (task.status !== 2 && task.status !== 3 && task.status !== -1) {
        validTasks.push(task)
      }
    })
    if (!validTasks.length) {
      return null
    }
    return <div className='exporting-float' >
      <div className='exp-title' >
        <span><em>{title}</em><em>（</em><em>{validTasks.length}</em><em>）</em></span>
        <i onClick={this.toggleList} />
      </div>
      <ul className={showList ? 'exp-main' : 'hide'}>
        {
          validTasks.map((task, index) => {
            const progressPercent = (task.progress || 0) + '%'
            return <li key={index}>
              <div className='mark' style={{width: progressPercent}} />
              <div className='exp-lic'>
                <span title={task.title}>{task.title}</span>
                <em className={task.status === 3 ? 'error-text' : ''}>{task.status === 3 ? '失败' : progressPercent}</em>
                <a onClick={() => {
                  this.deleteTask(task)
                }}>取消</a>
              </div>
            </li>
          })
        }
      </ul>
    </div>
  }
}
