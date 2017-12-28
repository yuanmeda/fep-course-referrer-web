/**
 * @description 中考选科组件：选考科目详情 item
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  itemData: [Object] 科目item数据
 *  subjectEnum: [Array] 学科数据集合
 *  num: [Array] key
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Row, Col} from 'fish'

@componentIntl('DetailItem')
export default class DetailItem extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      itemData: props.itemData,
      subjectEnum: props.subjectEnum
    }
  }
  // 参数变更 已加载组件收到新的参数时调用
  componentWillReceiveProps (props) {
    if (props.subjectEnum && props.subjectEnum.length > 0) {
      this.setState({
        subjectEnum: props.subjectEnum
      })
    }
  }
  render () {
    const {itemData, subjectEnum} = this.state
    return (
      <div className='slp-mod-seniorexam__setitem'>
        <Row>
          <Col span={3}>
            <span className='slp-mod-seniorexam__setlabel'>{`选考科目${this.props.num + 1}：`}</span>
          </Col>
          <Col span={21}>
            <span className='slp-mod-seniorexam__setname'>{itemData.subject_name}</span>
          </Col>
        </Row>
        <Row>
          <Col span={3}>
            <span className='slp-mod-seniorexam__setlabel'>学科指数比例：</span>
          </Col>
          <Col span={21}>
            {itemData.scales.map(cell => {
              const course = subjectEnum && subjectEnum.find(value => value.code === cell.course)
              if (course) {
                return (
                  <span className='slp-mod-seniorexam__setname' key={cell.course}>{`${course.name}：${cell.scale}`}</span>
                )
              }
            })}
          </Col>
        </Row>
        <Row>
          <Col span={3}>
            <span className='slp-mod-seniorexam__setlabel'>科目Icon：</span>
          </Col>
          <Col span={21}>
            <div className='slp-detail-img'>
              <ul className='img-list'>
                <li>
                  <img src={itemData.icon} />
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
