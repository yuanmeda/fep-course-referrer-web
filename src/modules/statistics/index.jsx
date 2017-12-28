/**
 * @function 选科统计
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-15 14:24:41
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import React from 'react'
import { Component } from 'ae'
import { Tabs } from 'fish'
import CityTree from 'components/CityTree'
import Subject from './components/Subject'
import Course from './components/Course'
import Fitness from './components/Fitness'
import ExportProgress from 'components/ExportProgress'
import request from 'ae/shared/request'
import _remove from 'lodash/remove'

const TabPane = Tabs.TabPane

class Statistics extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabKey: 'subject',
      selectedNode: {},
      exportTask: []
    }
  }

  onChangeTab = tabKey => {
    this.setState({
      tabKey
    })
  }

  onSelect = selectedNode => {
    this.setState({
      selectedNode
    })
  }

  exportSubjectHandle = grade => {
    const { selectedNode } = this.state
    const url = `${ORIGINS.FEP}/v1/reports/admins/referral_choice/subjects_combine/actions/export_excel`
    const params = {
      grade: grade,
      range_type: selectedNode.type,
      range_id: selectedNode.id
    }
    this.exportHandle(url, params)
  }

  exportCourseHandle = grade => {
    const { selectedNode } = this.state
    const url = `${ORIGINS.FEP}/v1/reports/admins/referral_choice/course/actions/export_excel`
    const params = {
      grade: grade,
      range_type: selectedNode.type,
      range_id: selectedNode.id
    }
    this.exportHandle(url, params)
  }

  exportFitnessHandle = () => {
    const url = `${ORIGINS.FEP}/v1/reports/admin/referral_choice/actions/export_excel`
    const params = {}
    this.exportHandle(url, params)
  }

  exportHandle = (url, params) => {
    const { exportTask } = this.state
    const config = {
      url: url,
      method: 'post',
      params: params
    }
    request(config).then(resData => {
      exportTask.push(resData)
      this.setState({
        exportTask
      })
    })
  }

  onExportResult = task => {
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

  render () {
    const { tabKey, selectedNode, exportTask } = this.state
    const exportLink = <a className='slp-link-output' onClick={this.exportFitnessHandle}>导出数据</a>
    return <div className='main-wrap wrapper slp-mod-seniorexam'>
      <div className='slp-l-bordermain slp-mod-seniorexam__sidetree'>
        <CityTree onSelect={this.onSelect} />
      </div>
      <div className='slp-l-bordermain slp-mod-seniorexam__main'>
        <Tabs onChange={this.onChangeTab} tabBarExtraContent={exportLink}>
          <TabPane tab='选科组合统计' key='subject'>
            <Subject tabKey={tabKey} selectedNode={selectedNode} exportHandle={this.exportSubjectHandle} />
          </TabPane>
          <TabPane tab='学科选择统计' key='course'>
            <Course tabKey={tabKey} selectedNode={selectedNode} exportHandle={this.exportCourseHandle} />
          </TabPane>
          <TabPane tab='吻合度对比' key='fitness'>
            <Fitness tabKey={tabKey} selectedNode={selectedNode} />
          </TabPane>
        </Tabs>
      </div>
      <ExportProgress tasks={exportTask} onSuccess={this.onExportResult} onFail={this.onExportResult} />
    </div>
  }
}

export default scope => ({
  permission: 0,
  name: '选科统计',
  component: Statistics
})
