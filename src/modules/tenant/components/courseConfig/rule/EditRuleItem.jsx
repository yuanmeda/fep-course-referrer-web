/**
 * @description 中考选科组件：选考规则新增和编辑
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  referralRule: [Object] 学科数据集合
 *  referralSubjects: [Array] 科目信息数据
 *  changeState: [Fun] 状态切换
 *  setReferralRule: [Fun] 提交数据
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Form, Input, Button, Checkbox} from 'fish'
import Dialog from 'components/dialog'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

let uuid = 1

@componentIntl('EditRuleItem')
class EditRuleItem extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      referralRule: props.referralRule,
      referralSubjects: props.referralSubjects || []
    }
  }

  // 参数变更 已加载组件收到新的参数时调用
  componentWillReceiveProps (props) {
    if (props.referralSubjects) {
      this.setState({
        referralSubjects: props.referralSubjects
      })
    }
    if (props.referralRule) {
      this.setState({
        referralRule: props.referralRule
      })
    }
  }
  deleteOption = num => {
    const { form } = this.props
    const nums = form.getFieldValue('nums')
    form.setFieldsValue({
      nums: nums.filter(key => key !== num)
    })
  }

  addCourseOption = () => {
    uuid++
    const { form } = this.props
    const nums = form.getFieldValue('nums')
    const nextNums = nums.concat(uuid)
    form.setFieldsValue({
      nums: nextNums
    })
  }

  validatorCourses = (values) => {
    const courses = []
    let isValid = true
    for (let i = 0; i < values.nums.length; i++) {
      const subjects = values[`required_subjects_${values.nums[i]}`]
      for (let j = 0; j < subjects.length; j++) {
        if (courses.indexOf(subjects[j]) !== -1) {
          isValid = false
          break
        } else {
          courses.push(subjects[j])
        }
      }
    }
    return isValid
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const that = this
    this.props.form.validateFields((error, values) => {
      if (!error) {
        if (!this.validatorCourses(values)) {
          Dialog.warning({
            title: '提示',
            content: '学科不能重复设置'
          })
          return false
        }
        if (values.nums.length > 0) {
          const nums = values.nums.map((k) => {
            return parseInt(values[`num_${k}`])
          }).reduce((result, num) => {
            return result + num
          })
          if (nums > parseInt(values.referral_subject_num)) {
            Dialog.warning({
              title: '提示',
              content: '必选科目数总和必须小于等于需考科目数。'
            })
          } else {
            that.props.setReferralRule({
              referral_subject_num: parseInt(values.referral_subject_num),
              required_subjects: values.nums.map((k) => {
                return {
                  subject_ids: values[`required_subjects_${k}`],
                  num: parseInt(values[`num_${k}`])
                }
              })
            })
          }
        } else {
          that.props.setReferralRule({
            referral_subject_num: parseInt(values.referral_subject_num),
            required_subjects: []
          })
        }
      } else {
        console.log('error', error, values)
      }
    })
  }

  render () {
    const {referralRule, referralSubjects} = this.state
    const {getFieldDecorator, getFieldValue} = this.props.form
    let formItems = []
    let initNums
    if (referralRule) {
      getFieldDecorator('nums', { initialValue: referralRule.required_subjects.map((val, index) => index + 1) })
      initNums = referralRule.required_subjects.length
    } else {
      getFieldDecorator('nums', { initialValue: [1] })
      initNums = 1
    }
    if (uuid <= initNums) { // 编辑态初始化uuid 再新增选项的时候不会重新赋值
      uuid = initNums
    }
    const nums = getFieldValue('nums')
    formItems = nums.map((k) => {
      let item = null
      if (referralRule && k <= referralRule.required_subjects.length) {
        item = referralRule.required_subjects[k - 1]
      }
      return (
        <div className='slp-ui-formcard' key={k}>
          <div className='slp-mod-seniorexam__btnfix'>
            <a className='slp-ui-linkbtn slp-ui-linkbtn--delete' onClick={() => this.deleteOption(k)}>
              删除
            </a>
          </div>
          <div className='slp-ui-formcard__head'>必选科目组合</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol' style={{marginBottom: 0}}>
              <FormItem
                labelCol={{span: 3}}
                wrapperCol={{span: 21}}
                label='必选科目范围'>
                {getFieldDecorator(`required_subjects_${k}`, {
                  rules: [{
                    required: true,
                    message: '必选科目范围不能为空。'
                  }, {
                    validator: (rule, value, callback) => {
                      const { getFieldValue } = this.props.form
                      const checkedVal = getFieldValue(`num_${k}`)
                      const err = '必选科目数必须小于选择科目数量。'
                      if (value.length > 0 && checkedVal && value.length <= parseInt(checkedVal)) {
                        callback(err)
                      }
                      callback()
                    }
                  }],
                  initialValue: item ? item.subjects.map(cell => cell.subject_id) : []
                })(
                  <CheckboxGroup options={referralSubjects} />
                )}
              </FormItem>
            </div>
            <FormItem
              labelCol={{span: 3}}
              wrapperCol={{span: 3}}
              label='必选科目数'>
              {getFieldDecorator(`num_${k}`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  message: '必选科目数不能为空'
                }, {
                  validator: (rule, value, callback) => {
                    const val = parseInt(value)
                    const { getFieldValue } = this.props.form
                    const checkedVal = getFieldValue(`required_subjects_${k}`)
                    const err = '所填数字为大于零的整数'
                    const err1 = '必选科目数必须小于选择科目数量。'
                    if (value && (!val || val < 0)) {
                      callback(err)
                    }
                    if (val && checkedVal && val >= checkedVal.length) {
                      callback(err1)
                    }
                    callback()
                  }
                }],
                initialValue: item ? item.num : ''
              })(<Input size='default' />)}
            </FormItem>
          </div>
        </div>
      )
    })
    return (
      <Form onSubmit={this.handleSubmit} hideRequiredMark>
        <div className='ndui-form-item'>
          <FormItem
            labelCol={{span: 3}}
            wrapperCol={{span: 5}}
            label='需考科目数'>
            {getFieldDecorator('referral_subject_num', {
              rules: [{
                required: true,
                message: '需选考科目数不能为空！'
              }, {
                validator: (rule, value, callback) => {
                  const val = parseInt(value)
                  const err = '所填数字为大于零的整数'
                  const err1 = `需选考科目数在(0 - ${referralSubjects.length})之间`
                  if (value && !val) {
                    callback(err)
                  }
                  if (val && (val < 0 || val >= referralSubjects.length)) {
                    callback(err1)
                  }
                  // 这里必须有个默认的回调，否则表单submit不会去回调
                  callback()
                }
              }],
              initialValue: referralRule ? referralRule.referral_subject_num : ''
            })(<Input size='default' />)}
          </FormItem>
        </div>
        {formItems}
        <a className='slp-ui-linkbtn slp-ui-linkbtn--add' onClick={this.addCourseOption}>
          添加必选科目组合
        </a>
        <div className='slp-mod-seniorexam__btns'>
          <Button type='primary' htmlType='submit' >下一步</Button>
        </div>
      </Form>)
  }
}

const WrappedHorizontalEditRuleItemForm = Form.create()(EditRuleItem)
export default WrappedHorizontalEditRuleItemForm
