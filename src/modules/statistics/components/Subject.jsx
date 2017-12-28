/**
 * @function 选科组合统计
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-15 17:32:53
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   tabKey:string
 *   selectedNode:{
 *     code,name,type,isLeaf:bool
 *   }
 *   exportHandle(grade):导出操作，统一放在父级，否则会出现多个导出进度实例
 * }
 */

import React from 'react'
import { Component, componentIntl, propTypes, contextTypes } from 'ae'
import request from 'ae/shared/request'
import { areaRangeEnum, subjectCombineEnum } from 'services/enum'
import Base from './Base'
import _find from 'lodash/find'

@componentIntl('Subject')
export default class Subject extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      grade: '',
      tabKey: props.tabKey,
      selectedNode: props.selectedNode,
      data: null
    }
  }

  componentDidMount () {
    this.getData()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.tabKey !== 'subject') {
      this.setState({
        tabKey: nextProps.tabKey,
        grade: '',
        selectedNode: null
      })
    } else if (nextProps.selectedNode && nextProps.selectedNode !== this.state.selectedNode) {
      this.setState({
        tabKey: nextProps.tabKey,
        selectedNode: nextProps.selectedNode
      }, () => {
        this.getData()
      })
    }
  }

  // 数据请求，每次切换年级或组织树都需调用
  getData = () => {
    const { grade, selectedNode } = this.state
    const config = {
      url: `${ORIGINS.FEP}/v1/reports/admins/referral_choice/subjects_combine`,
      method: 'get',
      params: {
        grade: grade,
        range_type: selectedNode.type,
        range_id: selectedNode.id
      }
    }
    request(config).then(resData => {
      this.formatData(resData).then(data => {
        this.setState({
          data
        })
      })
    })
  }

  /**
   * [formatData] 数据处理为Base需求结构
   * @param  {[type]} data {
   *   total: int, items: [{ result_type,result_id, result_name, details:[{subjects:[],num}]
   * }
   * @return {[type]} newData {
   *   total: int,
   *   items: [{
   *     result_type:'', result_type_name:'', result_id:'', result_name:'',
   *     details: [{ code: '', name: '', num: int, }]
   *   }]
   * }
   */
  formatData = data => {
    const newData = {
      total: data.total,
      items: []
    }
    const showEmpty = !(newData && newData.total)

    if (!showEmpty) {
      return areaRangeEnum().then(areaRangeList => {
        return subjectCombineEnum('', true).then(subjectCombineList => {
          newData.items = data.items.map(item => {
            return {
              result_type: item.result_type,
              result_type_name: areaRangeList.getName(item.result_type),
              result_id: item.result_id,
              result_name: item.result_name,
              details: subjectCombineList.map(subjectCombineItem => {
                const matchItem = _find(item.details, {subjects: subjectCombineItem.code})
                return {
                  code: subjectCombineItem.code.join('+'),
                  name: subjectCombineItem.name.join('+'),
                  num: matchItem ? matchItem.num : 0
                }
              })
            }
          })
          return newData
        })
      })
    } else {
      return Promise.resolve(newData)
    }
  }

  onGradeChange = grade => {
    this.setState({ grade }, () => {
      this.getData()
    })
  }

  exportHandle = () => {
    const { grade } = this.state
    this.props.exportHandle(grade)
  }

  render () {
    const { data, tabKey } = this.state
    if (tabKey !== 'subject') {
      return null
    }
    return <div>
      <Base data={data} onGradeChange={this.onGradeChange} exportHandle={this.exportHandle} />
    </div>
  }
}
