/**
 * @function 选科-学科-吻合度 公用
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-15 17:52:55
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   hideExport:bool 隐藏导出按钮
 *   exportHandle:导出操作
 *   onGradeChange:下拉回调(grade),
 *   data:{
 *     total: int,
 *     items: [{
 *       result_type: string,
 *       result_type_name: string,
 *       result_id: string,
 *       result_name: string,
 *       details: [{
 *         code: string,
 *         name: string,
 *         num: int
 *       }]
 *     }]
 *   }
 * }
 */

import React from 'react'
import { Component, componentIntl, propTypes, contextTypes } from 'ae'
import { Table, Button, Select } from 'fish'
import { gradeEnum } from 'services/enum'
import DataEmpty from 'components/DataEmpty'

const Option = Select.Option

@componentIntl('Base')
export default class Base extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      gradeList: [],
      defaultOption: {
        code: '',
        name: '请选择年级'
      },
      grade: '',
      tableData: {
        columns: [],
        dataSource: []
      },
      showEmpty: null
    }
  }

  componentDidMount () {
    const { defaultOption } = this.state
    let { gradeList } = this.state
    gradeList.unshift(defaultOption)
    gradeEnum().then(gradeData => {
      gradeList = gradeList.concat(gradeData)
      this.setState({
        gradeList
      })
    })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data) {
      this.formatTableData(nextProps.data)
    }
  }

  // 处理fish Table组件的 columns 及 dataSource 数据
  formatTableData = data => {
    const { tableData } = this.state
    tableData.columns = []
    tableData.dataSource = []
    const showEmpty = !(data && data.total)
    this.setState({
      showEmpty
    })
    if (!showEmpty) {
      const forColumnItem = data.items[0]
      tableData.columns.push({
        title: forColumnItem.result_type_name,
        key: 'result_type',
        dataIndex: 'result_type',
        width: '10%'
      })
      forColumnItem.details.forEach(item => {
        tableData.columns.push({
          title: item.name,
          key: item.code,
          dataIndex: item.code
        })
      })

      data.items.forEach((item, index) => {
        const dataItem = {
          key: index,
          result_type: item.result_name
        }
        item.details.forEach(subItem => {
          dataItem[subItem.code] = subItem.num
        })
        tableData.dataSource.push(dataItem)
      })

      this.setState({
        tableData
      })
    }
  }

  onSelectChange = grade => {
    this.setState({ grade })
    this.props.onGradeChange(grade)
  }

  render () {
    const { showEmpty, gradeList, defaultOption, tableData } = this.state
    const { columns, dataSource } = tableData
    const { exportHandle, hideExport } = this.props
    let dataBody
    if (showEmpty === true) {
      dataBody = <DataEmpty />
    } else if (!dataSource.length) {
      dataBody = null
    } else {
      dataBody = <div className='slp-mod-seniorexam__table3'>
        <Table columns={columns} dataSource={dataSource} pagination={false} bordered />
      </div>
    }

    return <div>
      <div className='slp-mod-seniorexam__handle slp-mod-seniorexam__handle1'>
        <Select onChange={this.onSelectChange} defaultValue={defaultOption.name}>
          {gradeList.map(option => {
            return <Option key={option.code} value={option.code}>{option.name}</Option>
          })}
        </Select>
        <div className={hideExport || showEmpty === true ? 'hide' : ''} style={{float: 'right'}}>
          <Button type='ghost' onClick={exportHandle}>导出数据</Button>
        </div>
      </div>

      { dataBody }
    </div>
  }
}
