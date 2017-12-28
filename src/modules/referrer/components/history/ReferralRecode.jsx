/**
 * @function 提交选科记录
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-12 16:36:50
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import { subjectEnum } from 'services/enum'
import { asyncLoop } from 'services/utils'
import moment from 'moment'
import { Table } from 'fish'
import DataEmpty from 'components/DataEmpty'

@componentIntl('ReferralRecode')
export default class ReferralRecode extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      recodeData: null,
      showEmpty: null,
      columns: [{
        title: '选科时间',
        key: 'date',
        dataIndex: 'date',
        width: '20%'
      }, {
        title: '首选组合',
        key: 'preference',
        dataIndex: 'preference',
        width: '20%'
      }, {
        title: '备选组合',
        key: 'alternate',
        dataIndex: 'alternate',
        width: '25%'
      }, {
        title: '选科原因',
        key: 'reason',
        dataIndex: 'reason',
        width: '35%'
      }],
      pagination: {
        showQuickJumper: true,
        current: 1,
        total: 0,
        pageSize: AECONST.PAGE_SIZE
      }
    }
  }

  componentDidMount () {
    const { pagination } = this.state
    this.getRecodeData(pagination)
  }

  // 获取列表
  getRecodeData = pagination => {
    const config = {
      url: `${ORIGINS.FEP}/v1/students/referral/choice_record`,
      method: 'get',
      params: {
        limit: pagination.pageSize,
        offset: pagination.pageSize * (pagination.current - 1)
      }
    }
    request(config).then(resData => {
      const showEmpty = !(resData && resData.total)
      this.setState({
        showEmpty
      })
      if (!showEmpty) {
        pagination.total = resData.total
        this.formatRecodeData(resData.items, recodeData => {
          this.setState({
            recodeData
          })
        })
        this.setState({
          pagination
        })
      }
    }, e => {
      this.setState({
        showEmpty: true
      })
    })
  }

  /**
   * [description 处理 api 数据，返回 fish Table dataSource 适应数据]
   * @param  {[type]} recodeData [api 数据]
   * @param  {[type]} doneFn     [数据处理完成回调方法]
   */
  formatRecodeData = (recodeData, doneFn) => {
    const recodeDataSource = []
    const formatData = (subjectList, item, index) => {
      const attrs = ['first', 'second', 'third', 'reason']
      const datas = {}
      attrs.forEach(attr => {
        if (item[attr]) {
          const data = item[attr].map(subject => {
            return subjectList.getName(subject)
          })
          datas[attr] = data.join(attr === 'reason' ? '；' : '、')
        }
      })

      const alternateData = []
      if (datas['second']) {
        alternateData.push(datas['second'])
      }
      if (datas['third']) {
        alternateData.push(datas['third'])
      }

      recodeDataSource.push({
        key: index,
        date: moment(item.date).format(AECONST.DATE_TIME_STYLE),
        preference: datas['first'],
        alternate: alternateData.join('；'),
        reason: datas['reason']
      })
    }

    asyncLoop(recodeData, (loopFn, item, index) => {
      subjectEnum(item.version).then(subjectList => {
        formatData(subjectList, item, index)
        loopFn()
      })
    }, () => {
      doneFn(recodeDataSource)
    })

    return recodeDataSource
  }

  // 分页切换
  onChange = pagination => {
    this.getRecodeData(pagination)
  }

  render () {
    const { showEmpty, recodeData, columns, pagination } = this.state
    if (showEmpty === true) {
      return <DataEmpty />
    } else if (!recodeData) {
      return null
    }
    return <div className='slp-mod-seniorexam__table3'>
      <Table columns={columns} dataSource={recodeData} pagination={pagination} onChange={this.onChange} bordered />
    </div>
  }
}
