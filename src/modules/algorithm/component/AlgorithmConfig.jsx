/**
 * @description 中考选科组件：算法设置-学科Tab
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1 [高精尖业务 v0.9.3]
 * @param {
 * currentCourse: 当前选中学科
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import TenantService from 'services/tenant'
import AlgorithmDetail from './config/Detail'
import AlgorithmEdit from './config/Edit'

@componentIntl('AlgorithmConfig')
class AlgorithmConfig extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      currentState: 'detail',
      configObject: null
    }
  }
  componentDidMount () {
    TenantService.getAlgorithmConfig({course: this.props.currentCourse}).then(res => {
      if (res) {
        this.setState({
          configObject: res
        })
      }
      this.setState({
        currentState: res ? 'detail' : 'undetail'
      })
    })
  }

  submitConfig = paramData => {
    const that = this
    TenantService.setAlgorithmConfig({
      course: this.props.currentCourse,
      data: paramData}
    ).then(res => {
      this.setState({
        configObject: paramData
      })
      that.changeState('detail', 'currentState')
    })
  }

  changeState = (value, key) => {
    this.setState({
      [key]: value
    })
  }

  render () {
    const {configObject, currentState} = this.state
    return (
      currentState === 'undetail' ? <AlgorithmEdit configDetail={configObject} changeState={this.changeState} submitConfig={this.submitConfig} /> : <AlgorithmDetail configDetail={configObject} changeState={this.changeState} />
    )
  }
}
export default AlgorithmConfig
