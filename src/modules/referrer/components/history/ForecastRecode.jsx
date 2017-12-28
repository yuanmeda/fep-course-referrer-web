/**
 * @function 重新预测记录
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-12 16:36:55
 * @version  v0.1 [高精尖业务v0.9.3]
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import moment from 'moment'
import { Table } from 'fish'
import DataEmpty from 'components/DataEmpty'
import ForecastRecommend from './ForecastRecommend'

@componentIntl('ForecastRecode')
export default class ForecastRecode extends Component {
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
        title: '成绩重要度',
        key: 'academic_record',
        dataIndex: 'academic_record'
      }, {
        title: '兴趣度重要度',
        key: 'subject_interest',
        dataIndex: 'subject_interest'
      }, {
        title: '努力度重要度',
        key: 'learning_effort',
        dataIndex: 'learning_effort'
      }, {
        title: '推荐详情',
        key: 'recommend',
        dataIndex: 'recommend',
        render: (text, record, index) => <div className='slp-ui-table__control'>
          <a className='slp-ui-table__btn--single slp-ui-table__c-primary'
            onClick={() => {
              this.triggerHandle(record.referral_id)
            }}>{text}</a>
        </div>
      }],
      pagination: {
        showQuickJumper: true,
        current: 1,
        total: 0,
        pageSize: AECONST.PAGE_SIZE
      },
      recommendTrigger: false,
      referralId: ''
    }
  }

  componentDidMount () {
    const { pagination } = this.state
    this.getRecodeData(pagination)
  }

  // 获取列表
  getRecodeData = pagination => {
    const config = {
      url: `${ORIGINS.FEP}/v1/students/referral_again/record`,
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
        const recodeData = this.formatRecodeData(resData.items)
        this.setState({
          recodeData,
          pagination
        })
      }
    }, e => {
      this.setState({
        showEmpty: true
      })
    })
  }

  // 处理 api 数据，返回 fish Table dataSource 适应数据
  formatRecodeData = recodeData => {
    return recodeData.map((item, index) => {
      return {
        key: index,
        date: moment(item.date).format(AECONST.DATE_TIME_STYLE),
        academic_record: item.academic_record,
        subject_interest: item.subject_interest,
        learning_effort: item.learning_effort,
        referral_id: item.referral_id,
        recommend: '查看'
      }
    })
  }

  // 分页切换
  onChange = pagination => {
    this.getRecodeData(pagination)
  }

  triggerHandle = referralId => {
    this.setState({
      recommendTrigger: true,
      referralId
    })
  }

  initTrigger = () => {
    this.setState({
      recommendTrigger: false
    })
  }

  render () {
    const { showEmpty, recodeData, columns, pagination, recommendTrigger, referralId } = this.state
    if (showEmpty === true) {
      return <DataEmpty />
    } else if (!recodeData) {
      return null
    }
    return <div className='slp-mod-seniorexam__table3'>
      <Table columns={columns} dataSource={recodeData} pagination={pagination} onChange={this.onChange} bordered />
      <ForecastRecommend trigger={recommendTrigger} referralId={referralId} initTrigger={this.initTrigger} />
    </div>
  }
}
