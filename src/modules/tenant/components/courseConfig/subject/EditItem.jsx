/**
 * @description 中考选科组件：选考科目配置新增和编辑
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  subjectEnum: [Array] 学科数据集合
 *  referralSubjects: [Array] 科目信息数据
 *  changeState: [Fun] 状态切换
 *  submitReferral: [Fun] 提交数据
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Form, Input, Button, Checkbox, Row, Col} from 'fish'

import UploadFile from 'components/Upload'
import Dialog from 'components/dialog'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

let uuid = 1
let status = {}
let iconsFile = {}
const TRIGGER = 'onChange'

@componentIntl('EditItem')
class EditItem extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      referralSubjects: props.referralSubjects,
      subjectEnum: props.subjectEnum,
      checkedValues: {}
    }
  }

  // 参数变更 已加载组件收到新的参数时调用
  componentWillReceiveProps (props) {
    if (props.referralSubjects) {
      this.setState({
        referralSubjects: props.referralSubjects
      })
    }
    if (props.subjectEnum) {
      this.setState({
        subjectEnum: props.subjectEnum
      })
    }
  }
  deleteOption = num => {
    const { form } = this.props
    const nums = form.getFieldValue('nums')
    if (nums.length === 2) {
      Dialog.warning({
        title: '提示',
        content: '至少需要配置两个选考科目'
      })
      return
    }
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
      const subjects = values[`subject_${values.nums[i]}`]
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

  validatorScales = (values) => {
    let isValid = true
    for (let i = 0; i < values.nums.length; i++) {
      const subjects = values[`subject_${values.nums[i]}`]
      let sum = 0
      for (let j = 0; j < subjects.length; j++) {
        const scale = parseFloat(values[`${subjects[j]}_${values.nums[i]}_scale`])
        sum += scale
      }
      if (sum !== 1) {
        isValid = false
        break
      }
    }
    return isValid
  }

  handleRemove = (file, num) => {
    const that = this
    const { setFieldsValue } = that.props.form
    setFieldsValue({
      [`icon_${num}`]: []
    })
  }
  handleImageSucess= (res, file) => {
    iconsFile[`icon_${file[0].num}`] = file
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const that = this
    const {validateFields, getFieldValue} = that.props.form
    // 修复：学科比例验证出错后，再隐藏，点击下一步不会忽略隐藏了的学科比例错误验证
    const nums = getFieldValue('nums')
    const filedNames = ['nums']
    nums.forEach(k => {
      filedNames.push(`name_${k}`)
      filedNames.push(`subject_${k}`)
      const subjects = getFieldValue(`subject_${k}`)
      subjects.forEach(val => {
        filedNames.push(`${val}_${k}_scale`)
      })
    })
    validateFields(filedNames, (error, values) => {
      if (!error) {
        if (!this.validatorCourses(values)) {
          Dialog.warning({
            title: '提示',
            content: '学科不能重复设置'
          })
          return false
        }
        if (!this.validatorScales(values)) {
          Dialog.warning({
            title: '提示',
            content: '学科指数比例总和为1，所填数字为(0,1]之间，支持小数点后两位数'
          })
          return false
        }
        const data = values.nums.map((k) => {
          const icon = (iconsFile[`icon_${k}`] && iconsFile[`icon_${k}`][0]) || (getFieldValue(`icon_${k}`) && getFieldValue(`icon_${k}`)[0])
          return {
            subject_name: values[`name_${k}`],
            // icon: 'http://sdpcs.beta.web.sdp.101.com/v0.1/download?dentryId=a311984d-503f-4116-aa55-885730edba64',
            icon: icon ? icon.url : '',
            scales: values[`subject_${k}`].map(val => {
              return {
                course: val,
                scale: values[`${val}_${k}_scale`]
              }
            })
          }
        })
        that.props.submitReferral(data).then(res => {
          iconsFile = {}
          status = {}
        })
      } else {
        console.log('error', error, values)
      }
    })
  }

  checkOptionState = (vals, k) => {
    status[k] = 1
    this.setState({
      checkedValues: Object.assign({}, this.state.checkedValues, {[k]: vals})
    })
  }

  render () {
    const {referralSubjects, subjectEnum, checkedValues} = this.state
    const { getFieldDecorator, getFieldValue } = this.props.form
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 5}
    }
    let initNums
    let formItem
    if (referralSubjects) { // 编辑态
      getFieldDecorator('nums', { initialValue: referralSubjects.map((val, index) => (index + 1)) })
      initNums = referralSubjects.length
    } else { // 新增态
      getFieldDecorator('nums', { initialValue: [1, 2, 3, 4, 5] })
      initNums = 5
    }
    if (uuid <= initNums) { // 编辑态初始化uuid 再新增选项的时候不会重新赋值
      uuid = initNums
    }
    const nums = getFieldValue('nums')
    if (subjectEnum.length > 0) {
      const checkedValuesMap = {}
      formItem = nums.map((k, index) => {
        if (!checkedValuesMap[k]) {
          checkedValuesMap[k] = checkedValues[k] || []
        }
        let item = null
        if (referralSubjects && k <= referralSubjects.length) {
          item = referralSubjects[k - 1]
          if (!status[k]) {
            checkedValuesMap[k] = item.scales.map(cell => cell.course)
          } else {
            checkedValuesMap[k] = checkedValues[k]
          }
        }
        return (
          <div className='slp-mod-seniorexam__setitem' style={{paddingTop: '20px'}} key={k}>
            <a className='slp-ui-linkbtn slp-ui-linkbtn--delete' onClick={() => this.deleteOption(k)}>
              删除
            </a>
            <FormItem
              {...formItemLayout}
              label={`选考科目${index + 1}：`}>
              {getFieldDecorator(`name_${k}`, {
                rules: [{
                  required: true,
                  message: '请选择选考科目。'
                }],
                initialValue: item ? item.subject_name : ''
              })(
                <Input size='default' maxLength={10} />
              )}
            </FormItem>
            <div className='slp-ui-form'>
              <FormItem>
                {getFieldDecorator(`subject_${k}`, {
                  rules: [{
                    required: true,
                    message: '请选择选考科目。'
                  }],
                  initialValue: item ? item.scales.map(cell => cell.course) : []
                })(
                  <CheckboxGroup options={subjectEnum} onChange={(e) => { this.checkOptionState(e, k) }} />
                )}
              </FormItem>
            </div>
            <Row>
              <Col span={3}>
                <span className='slp-mod-seniorexam__setlabel'>{checkedValuesMap[k].length > 0 ? '学科指数比例：' : ''}</span>
              </Col>
              <Col span={21}>
                <Row>
                  {subjectEnum && subjectEnum.map(course => {
                    const isShow = checkedValuesMap[k] && checkedValuesMap[k].includes(course.code)
                    return <Col span={6} className={!isShow ? 'hide' : ''} key={course.code}>
                      <FormItem
                        labelCol={{span: 14}}
                        wrapperCol={{span: 10}}
                        label={course.name}>
                        {getFieldDecorator(`${course.code}_${k}_scale`, {
                          rules: [{
                            required: isShow,
                            message: '请设置选考科目权重。'
                          }, {
                            validator: (rule, value, callback) => {
                              const val = parseFloat(value)
                              const err = '所填数字为(0,1]之间，支持小数点后两位数'
                              if (value && (!val || val > 1 || val <= 0 || !((/^[\d]+\.?\d*$/).test(value)))) {
                                callback(err)
                              }
                              callback()
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: item && isShow && item.scales.find(val => val.course === course.code) ? item.scales.find(val => val.course === course.code).scale : ''
                        })(
                          <Input size='default' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                  })}
                </Row>
              </Col>
            </Row>
            <FormItem
              labelCol={{span: 3}}
              wrapperCol={{span: 21}}
              label='科目Icon'>
              {getFieldDecorator(`icon_${k}`, {
                valuePropName: 'fileList',
                initialValue: item && item.icon ? [{
                  uid: `icon_${k}`,
                  name: `icon_${k}`,
                  status: 'done',
                  url: item.icon,
                  thumbUrl: item.icon
                }] : []
              })(
                <UploadFile
                  isShowUploadList
                  listType='picture-card'
                  type='image'
                  maxSize={10485760}
                  onRemove={this.handleRemove}
                  onSuccess={this.handleImageSucess}
                  num={k} />
              )}
            </FormItem>
          </div>
        )
      })
    }
    return (
      <Form onSubmit={this.handleSubmit} hideRequiredMark>
        <div className='slp-mod-seniorexam__setbody'>
          {formItem}
          <a className='slp-ui-linkbtn slp-ui-linkbtn--add' onClick={this.addCourseOption}>
            添加选考科目
          </a>
          <div className='slp-mod-seniorexam__btns'>
            <Button type='primary' htmlType='submit' >下一步</Button>
          </div>
        </div>
      </Form>)
  }
}

const WrappedHorizontalEditItemForm = Form.create()(EditItem)
export default WrappedHorizontalEditItemForm
