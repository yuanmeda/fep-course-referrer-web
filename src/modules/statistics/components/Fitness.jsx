/**
 * @function 吻合度对比
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-18 11:59:52
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   tabKey:string
 *   selectedNode:{
 *     code,name,type,isLeaf:bool
 *   }
 * }
 */

import React from 'react'
import { Component, componentIntl, propTypes, contextTypes } from 'ae'
import request from 'ae/shared/request'
import { areaRangeEnum, fitnessEnum } from 'services/enum'
import Base from './Base'

@componentIntl('Fitness')
export default class Fitness extends Component {
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
    if (nextProps.tabKey !== 'fitness') {
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
    const { grade, selectedNode = {} } = this.state
    const config = {
      url: `${ORIGINS.FEP}/v1/reports/admins/referral_choice/fitness`,
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
   *   total: int, items: [{ result_type,result_id, result_name, details:{fully:int,basically,inconformity}
   * }
   * @return {[type]} newData {
   *   total: int,
   *   items: [{
   *     result_type:'',
   *     result_type_name:'',
   *     result_id:'',
   *     result_name:'',
   *     details: [{
   *       code: '',
   *       name: '',
   *       num: int,
   *     }]
   *   }]
   * }
   */
  formatData = data => {
    const newData = {
      total: data.total,
      items: []
    }
    const showEmpty = !(newData && newData.total)
    const fitnessCodes = ['fully', 'basically', 'inconformity']

    if (!showEmpty) {
      return areaRangeEnum().then(areaRangeList => {
        return fitnessEnum().then(fitnessList => {
          newData.items = data.items.map(item => {
            return {
              result_type: item.result_type,
              result_type_name: areaRangeList.getName(item.result_type),
              result_id: item.result_id,
              result_name: item.result_name,
              details: fitnessCodes.map(code => {
                return {
                  code: code,
                  name: fitnessList.getName(code),
                  num: item[code]
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

  render () {
    const { data, tabKey } = this.state
    if (tabKey !== 'fitness') {
      return null
    }
    return <div>
      <Base data={data} onGradeChange={this.onGradeChange} hideExport />
    </div>
  }
}
