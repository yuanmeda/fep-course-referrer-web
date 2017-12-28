/**
 * @function 学生提交选科结果
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-08 16:31:58
 * @version  v0.1 [高精尖业务v0.9.3]
 * @params   {
 *    visible // 弹窗显隐控制
 *    closeModal  // 关闭回调,
 *    choiceSubjectData: [[{code:'',name:''},...],[],[]] // 0位为首选科目
 *    referralId  // 推荐记录id 提交选科使用
 * }
 */

import React from 'react'
import { Component, componentIntl, contextTypes, propTypes } from 'ae'
import request from 'ae/shared/request'
import { Checkbox, Input } from 'fish'
import Dialog from 'components/dialog'

@componentIntl('ReferralInfo')
export default class ReferralInfo extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      reasonsData: [],
      choiceSubjectData: props.choiceSubjectData,
      confirmLoading: false
    }
  }

  componentWillReceiveProps (nextProps) {
    this.initReasonsData()
    this.setState({
      choiceSubjectData: nextProps.choiceSubjectData
    })
  }

  initReasonsData = () => {
    let reasonsData = [{
      text: '对这些科目感兴趣'
    }, {
      text: '擅长这些科目'
    }, {
      text: '家长的建议'
    }, {
      text: '这些科目是学校的优势学科'
    }, {
      text: '未来高中（校）招录有选科要求'
    }, {
      text: '未来职业兴趣'
    }, {
      text: '为了将来就业考虑'
    }, {
      text: '其他(请填写)',
      isCustom: true,
      customText: '',
      customLimit: 50
    }]
    reasonsData = reasonsData.map(item => {
      item.checked = false
      return item
    })
    this.setState({
      reasonsData
    })
  }

  // 选科数据提交
  referralSubmit = () => {
    const { referralId } = this.props
    const { reasonsData, choiceSubjectData } = this.state
    const formErrorTip = this.inValidFormError(reasonsData)
    this.setState({
      formErrorTip
    })
    if (formErrorTip) {
      return
    }
    const postData = {
      referral_id: referralId,
      reason: []
    }
    choiceSubjectData.forEach((item, index) => {
      switch (index) {
        case 0:
          postData.first = item.map(subItem => {
            return subItem.code
          })
          break
        case 1:
          postData.second = item.map(subItem => {
            return subItem.code
          })
          break
        case 2:
          postData.third = item.map(subItem => {
            return subItem.code
          })
          break
        default:
          break
      }
    })
    reasonsData.forEach(item => {
      if (item.checked) {
        postData.reason.push(item.isCustom ? item.customText : item.text)
      }
    })
    this.setState({
      confirmLoading: true
    })
    const config = {
      url: `${ORIGINS.FEP}/v1/students/referral/choice`,
      method: 'post',
      data: postData
    }
    request(config).then(() => {
      this.setState({
        confirmLoading: false
      })
      this.props.closeModal()
      Dialog.tip('保存成功')
    }, e => {
      this.setState({
        confirmLoading: false
      })
      console.log(e)
    })
  }

  // 取消选择，直接关闭弹窗
  referralCancel = () => {
    this.props.closeModal()
  }

  // 多选框选择，需重置错误提示语空
  onCheckboxChange = checkItem => {
    checkItem.checked = !checkItem.checked
    this.setState({
      formErrorTip: ''
    })
  }

  // 其它原因填写，同上
  onInputChange = (e, item) => {
    item.customText = e.target.value
    this.setState({
      formErrorTip: ''
    })
  }

  /**
   * [description 选科依据表单校验]
   * @param  {[Array]} reasonsData [description]
   * @return {[String]} errorTip   [错误提示语，''表验证通过]
   * 未使用fish表单验证，因①无法校验需至少填写一项；②需自定义input错误提示，禁用态时不做校验
   */
  inValidFormError = (reasonsData) => {
    let errorTip = '请选择选科依据'
    reasonsData.forEach(item => {
      if (item.checked) {
        if (item.isCustom && !item.customText) {
          errorTip = '请填写选科依据'
        } else {
          errorTip = ''
        }
      }
    })
    return errorTip
  }

  render () {
    const { visible } = this.props
    const { reasonsData, choiceSubjectData, formErrorTip, confirmLoading } = this.state
    if (!choiceSubjectData) {
      return null
    }
    return <Dialog title='提示'
      okText='提交选科'
      cancelText='重新选择'
      wrapClassName='slp-ndui-modal slp-mod-seniorexam__popup1'
      visible={visible}
      onOk={this.referralSubmit}
      onCancel={this.referralCancel}
      confirmLoading={confirmLoading}
      maskClosable={false}>

      <div className='slp-mod-seniorexam__title'>
          您的选科组合为：
      </div>
      <p className='slp-mod-seniorexam__choice'>
        {choiceSubjectData.map((item, index) => {
          return <span key={index}>
            <span>{index === 0 ? '首选：' : `备选${index}：`}</span>
            {item.map((subItem, subIndex) => {
              return <span key={subIndex}>
                {subItem.name}{subIndex === item.length - 1 ? '' : '，'}
              </span>
            })}
            <br />
          </span>
        })}
      </p>
      <div className='slp-mod-seniorexam__title'>您选择这些学科作为中考选考科目的依据是什么？（多选）</div>
      {reasonsData.map((item, index) => {
        return <div key={index} className='slp-ui-form__checkboxgroup'>
          <Checkbox checked={item.checked} onChange={() => {
            this.onCheckboxChange(item)
          }}>{item.text}</Checkbox>
          {item.isCustom && item.checked
            ? <div className='slp-ui-tarea slp-ui-tarea--m'>
              <Input type='textarea' disabled={!item.checked} rows={4} maxLength={item.customLimit} onChange={e => {
                this.onInputChange(e, item)
              }} placeholder='请输入50个字符以内' />
            </div>
            : null
          }
        </div>
      })}
      <div className={formErrorTip ? 'error-text' : 'hide'}>{formErrorTip}</div>
    </Dialog>
  }
}
