/**
 * @function 选科列表
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-18 14:19:08
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *      subjectData: {total, items, version}
 *      isReadOnly: bool 只读，隐藏交互内容
 *      onSubmit:提交回调，isReadOnly:false 有效
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import { subjectEnum } from 'services/enum'
import { Button, Radio } from 'fish'
import DataEmpty from 'components/DataEmpty'
const RadioGroup = Radio.Group

@componentIntl('SubjectList')
export default class SubjectList extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    this.state = {
      subjectData: props.subjectData
    }
  }

  componentDidMount () {
    this.setData()
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      subjectData: nextProps.subjectData
    }, () => {
      this.setData()
    })
  }

  setData = () => {
    const { subjectData } = this.state
    subjectEnum(subjectData.version).then(subjectList => {
      this.setState({
        subjectList,
        showEmpty: !subjectData.total
      })
    })
  }

  /**
   * [description 首选，只能选择一个]
   * 需将当前首选status置为0，再设置选择目标status 1
   */
  choosePreference = (chooseItem, subjectData) => {
    subjectData.items.forEach(item => {
      if (item === chooseItem) {
        item.valid_select_status = 1
      } else if (item.valid_select_status === 1) {
        item.valid_select_status = 0
      }
    })
    this.setState({
      subjectData
    })
  }

  /**
   * [description 备选，0-2项]
   * 选中高亮备选项时，取消高亮操作
   */
  chooseAlternate = (chooseItem, subjectData) => {
    subjectData.items.forEach(item => {
      if (item === chooseItem) {
        item.valid_select_status = item.valid_select_status === 2 ? 0 : 2
      }
    })
    this.setState({
      subjectData
    })
  }

  onSubmit = () => {
    const { subjectData, subjectList } = this.state
    this.props.onSubmit(subjectData, subjectList)
  }

  render () {
    const { showEmpty, subjectData, subjectList } = this.state
    const { isReadOnly } = this.props
    if (showEmpty) {
      return <DataEmpty />
    } else if (!(subjectData && subjectList)) {
      return null
    }
    const headItem = subjectData.items[0]
    return <div>
      <div className={isReadOnly ? 'hide' : 'slp-mod-seniorexam__tip2'}>{subjectData.default_referral ? '选考科目（因成绩有缺失，本排序为默认排序）' : '选考科目（九种组合从最优进行排序）'}</div>
      <div className='slp-popup-wrapper'>
        <table className='slp-ui-charttable'>
          <thead>
            <tr>
              <th width='5%' />
              {headItem.subject.map((code, index) => {
                return <th key={index} width='15%' />
              })}
              <th className={isReadOnly ? 'hide' : ''} width='10%'>首选</th>
              <th className={isReadOnly ? 'hide' : ''} width='10%'>备选</th>
            </tr>
          </thead>
          <tbody>
            {subjectData.items.map((item, index) => {
              return <tr key={index}>
                <td>{index + 1}</td>
                {item.subject.map((code, index) => {
                  return <td key={index}>
                    <span className='slp-ui-icon'>
                      <img src={subjectList.getName(code, 'icon')} />
                    </span>
                    <span className='slp-mod-seniorexam__tabletxt'>{subjectList.getName(code)}</span>
                  </td>
                })}
                <td className={isReadOnly ? 'hide' : ''}>
                  <RadioGroup onChange={() => {
                    this.choosePreference(item, subjectData)
                  }} value={item.valid_select_status}>
                    <Radio value={1} />
                  </RadioGroup>
                </td>
                <td className={isReadOnly ? 'hide' : ''}>
                  <RadioGroup onChange={() => {
                    this.chooseAlternate(item, subjectData)
                  }} value={item.valid_select_status}>
                    <Radio value={2} />
                  </RadioGroup>
                </td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
      <div className={isReadOnly ? 'hide' : 'slp-mod-seniorexam__btn'}>
        <Button type='primary' size='large' onClick={this.onSubmit}>提交</Button>
      </div>
    </div>
  }
}
