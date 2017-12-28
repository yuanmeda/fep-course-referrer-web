/**
 * @function 兴趣度、努力度设置弹窗
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-07 21:12:46
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *    trigger // 触发数据
 *    initTrigger
 *    onSubmit  // 确定回调
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import { courseEnum } from 'services/enum'
import NumberSlider from 'components/NumberSlider'
import classnames from 'classnames'
import Dialog from 'components/dialog'

@componentIntl('InterestSetting')
export default class InterestSetting extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      confirmLoading: false, // 异步确定按钮loading
      tipVisible: false, // '兴趣度、努力度'解释提示框
      courseItems: null, // 学科兴趣、努力度数据
      visible: false
    }
    this.infoData = [{
      code: 'interest_level',
      name: '兴趣度',
      info: '是指对某学科学习喜好程度及情绪反应。例如，兴趣度高的表现为喜欢学习该学科。兴趣低代表不喜欢甚至讨厌学习该学科，上课情绪不高。'
    }, {
      code: 'effort_level',
      name: '努力度',
      info: '是指对学科学习时间和精力的投入。高努力度是投入大量的时间和精力在该学科的学习上。低努力度是指该学科的学习与其他学科相比所花费的时间和精力都比较少。'
    }]
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.trigger) {
      nextProps.initTrigger()
      this.getCourseConfig()
    }
  }

  /**
   * [获取学科配置详情]
   * 初始时获取 返回是total=0，items为空，此时需根据学科初始化数据
   */
  getCourseConfig = () => {
    const config = {
      url: `${ORIGINS.FEP}/v1/students/course_config`,
      method: 'get'
    }
    let courseItems = []
    request(config).then(resData => {
      courseEnum().then(courseList => {
        courseItems = resData && resData.items
        if (!(courseItems && courseItems.length)) {
          courseItems = courseList.map(item => {
            return {
              course: item.code
            }
          })
        }
        courseItems.forEach(item => {
          item.name = courseList.getName(item.course)
          item.interest_level = item.interest_level ? item.interest_level : 1
          item.effort_level = item.effort_level ? item.effort_level : 1
        })
        this.setState({
          courseItems,
          visible: true
        })
      })
    })
  }

  // 使用箭头函数，使this指向InterestModal
  handleOk = () => {
    const { courseItems } = this.state
    this.setState({
      confirmLoading: true
    })
    const config = {
      url: `${ORIGINS.FEP}/v1/students/course_config`,
      method: 'put',
      data: courseItems
    }
    request(config).then(() => {
      this.setState({
        confirmLoading: false,
        visible: false
      })
      this.props.onSubmit()
      Dialog.tip('保存成功')
    }, e => {
      const errorCode = e.response && e.response.data && e.response.data.code
      let errorTip
      this.setState({
        confirmLoading: false
      })
      switch (errorCode) {
        case 'CRS/COURSE_CONFIG_UNMATCH':
          errorTip = '传入的学科数量和实际需要配置的学科数量不匹配'
          break
        default:
          break
      }
      if (errorTip) {
        Dialog.warning({
          content: errorTip
        })
      }
    })
  }

  handleCancel = () => {
    this.setState({
      visible: false
    })
  }

  visibleTip = (isVisible) => {
    this.setState({
      tipVisible: isVisible
    })
  }

  onSlideChange = (item, key, value) => {
    item[key] = value
    const { courseItems } = this.state
    this.setState({
      courseItems
    })
  }

  render () {
    const { confirmLoading, tipVisible, courseItems, visible } = this.state
    if (!courseItems) {
      return null
    }
    return <Dialog wrapClassName='slp-ndui-modal'
      title='设置兴趣度、努力度'
      okText='保存'
      cancelText='取消'
      visible={visible}
      onOk={this.handleOk}
      onCancel={this.handleCancel}
      confirmLoading={confirmLoading}>
      <p className='slp-mod-seniorexam__intro2'>想要推荐结果更准确，请先设置各学科兴趣度、学习努力度吧！要按自己的情况进行设置，别人是无法看到您的设置哦！</p>
      <a onMouseOver={e => { this.visibleTip(true) }}
        onMouseOut={e => { this.visibleTip(false) }}
        className={classnames({
          'slp-mod-seniorexam__interestbtn': true,
          'slp-active': tipVisible
        })}>
        （什么是兴趣度、努力度？）
        <div className='slp-ui-dialog slp-ui-dialog--l slp-ui-dialog--down'>
          {
            this.infoData.map((item, index) => {
              return <p key={index}><strong>{item.name}：</strong>{item.info}</p>
            })
          }
        </div>
      </a>

      <p className='slp-mod-seniorexam__slidertit'>
        {
          this.infoData.map((item, index) => {
            return <span key={index} className={`slp-mod-seniorexam__slidertit${index + 1}`}>{item.name}</span>
          })
        }
      </p>

      {courseItems.map((item, index) => {
        return <div key={index} className='slp-mod-seniorexam__sliderlist slp-mod-seniorexam__sliderlist1'>
          <NumberSlider prefixText={item.name} value={item.interest_level} onChange={value => {
            this.onSlideChange(item, 'interest_level', value)
          }} />
          <NumberSlider value={item.effort_level} onChange={value => {
            this.onSlideChange(item, 'effort_level', value)
          }} />
        </div>
      })}
    </Dialog>
  }
}
