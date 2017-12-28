/**
 * @function 重新预测记录-科目推荐
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-22 17:11:19
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *   referralId,
 *   trigger: bool 触发数据
 *   initTrigger: fn
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import { subjectEnum } from 'services/enum'
import { Table } from 'fish'
import DataEmpty from 'components/DataEmpty'
import Dialog from 'components/dialog'

@componentIntl('ForecastRecommend')
export default class ForecastRecommend extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      columns: [{
        title: '序号',
        key: 'sequence',
        dataIndex: 'sequence',
        width: '20%'
      }, {
        title: '组合',
        key: 'data',
        dataIndex: 'data'
      }],
      showEmpty: false,
      dataSource: null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.trigger) {
      nextProps.initTrigger()
      this.getRecommendData(nextProps.referralId)
    }
  }

  getRecommendData = referralId => {
    let { showEmpty, dataSource, visible } = this.state
    const config = {
      url: `${ORIGINS.FEP}/v1/students/referral_again/${referralId}`,
      method: 'get'
    }
    request(config).then(resData => {
      subjectEnum(resData.version).then(subjectList => {
        showEmpty = !(resData && resData.total)
        if (!showEmpty) {
          dataSource = resData.items.map((item, index) => {
            return {
              key: index,
              sequence: index + 1,
              data: item.subject.map(subItem => {
                return subjectList.getName(subItem)
              }).join('、')
            }
          })
          visible = true
        }
        this.setState({
          showEmpty,
          dataSource,
          visible
        })
      })
    }, e => {
      showEmpty = true
      this.setState({
        showEmpty
      })
    })
  }

  onCancel = () => {
    this.setState({
      visible: false
    })
  }

  render () {
    const { showEmpty, dataSource, columns, visible } = this.state
    return <Dialog wrapClassName='slp-ndui-modal slp-mod-seniorexam__popup2'
      title='推荐记录'
      width='600'
      visible={visible}
      onCancel={this.onCancel}
      cancelText='取消'
      maskClosable={false}>
      {
        showEmpty === true
          ? <DataEmpty />
          : <Table columns={columns} dataSource={dataSource} pagination={false} bordered />
      }
    </Dialog>
  }
}
