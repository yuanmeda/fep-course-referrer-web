/**
 * @description 中考选科组件：算法设置-设置编辑
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1 [高精尖业务 v0.9.3]
 * @param {
 * configDetail: [Object] 详情数据
 * changeState：[Function] 切换状态
 * submitConfig：[Function] 提交数据
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Form, Input, Button, Row, Col} from 'fish'
import Dialog from 'components/dialog'

const FormItem = Form.Item
const TRIGGER = 'onChange'

@componentIntl('AlgorithmEdit')
class AlgorithmEdit extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      configDetail: props.configDetail
    }
  }
  // 参数变更 已加载组件收到新的参数时调用
  componentWillReceiveProps (props) {
    if (props.configDetail) {
      this.setState({
        configDetail: props.configDetail
      })
    }
  }

  validatorK = (rule, value, callback) => {
    const val = parseFloat(value)
    const err = '只允许修改为[0-99]的数字，可为小数'
    if (value && (val > 99 || val < 0 || !((/^[\d]+\.?\d*$/).test(value)))) {
      callback(err)
    }
    callback()
  }

  validatorW = (rule, value, callback) => {
    const val = parseFloat(value)
    const err = '请填写(0,1)之间的数字'
    if (value && (!val || val >= 1 || val <= 0 || !((/^[\d]+\.?\d*$/).test(value)))) {
      callback(err)
    }
    callback()
  }

  validatorSum = (values) => {
    if (parseFloat(values['composition_param_w1']) + parseFloat(values['composition_param_w2']) !== 1) {
      return false
    }
    if (parseFloat(values['offline_param_three_terms_w1']) + parseFloat(values['offline_param_three_terms_w2']) + parseFloat(values['offline_param_three_terms_w3']) !== 1) {
      return false
    }
    if (parseFloat(values['offline_param_two_terms_w1']) + parseFloat(values['offline_param_two_terms_w2']) !== 1) {
      return false
    }
    if (parseFloat(values['online_param_three_terms_w1']) + parseFloat(values['online_param_three_terms_w2']) + parseFloat(values['online_param_three_terms_w3']) !== 1) {
      return false
    }
    if (parseFloat(values['online_param_two_terms_w1']) + parseFloat(values['online_param_two_terms_w2']) !== 1) {
      return false
    }
    return true
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const that = this
    this.props.form.validateFields((error, values) => {
      if (!error) {
        if (!that.validatorSum(values)) {
          Dialog.warning({
            title: '提示',
            content: '参数之和必须等于1'
          })
          return false
        }
        that.props.submitConfig({
          referral_param: {
            k1: values['referral_param_k1'],
            k2: values['referral_param_k2'],
            k3: values['referral_param_k3'],
            rgq: values['referral_param_Rgq'],
            rgn: values['referral_param_Rgn']
          },
          composition_param: {
            w1: values['composition_param_w1'],
            w2: values['composition_param_w2']
          },
          offline_param: {
            three_terms: {
              w1: values['offline_param_three_terms_w1'],
              w2: values['offline_param_three_terms_w2'],
              w3: values['offline_param_three_terms_w3']
            },
            two_terms: {
              w1: values['offline_param_two_terms_w1'],
              w2: values['offline_param_two_terms_w2']
            }
          },
          online_param: {
            three_terms: {
              w1: values['online_param_three_terms_w1'],
              w2: values['online_param_three_terms_w2'],
              w3: values['online_param_three_terms_w3']
            },
            two_terms: {
              w1: values['online_param_two_terms_w1'],
              w2: values['online_param_two_terms_w2']
            }
          }
        })
      } else {
        console.log('error', error, values)
      }
    })
  }

  handleReset = () => {
    this.props.form.resetFields()
  }
  render () {
    const {configDetail} = this.state
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14}
    }
    return (
      <Form onSubmit={this.handleSubmit} hideRequiredMark>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>学科推荐指数：RI<sub>X</sub>= K<sub>1</sub> G<sub>1</sub> + K<sub>2</sub> r<sub>GQ</sub> Q<sub>X</sub> + K<sub>3</sub> r<sub>GN</sub> N<sub>XX</sub></div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol2'>
              <Row>
                <Col span={2}>
                  <span className='slp-mod-seniorexam__setlabel'>参数设置：</span>
                </Col>
                <Col span={22}>
                  <Row>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='K1 = '>
                        {getFieldDecorator(`referral_param_k1`, {
                          rules: [{
                            required: true,
                            message: 'K1不能为空'
                          }, {
                            validator: this.validatorK
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.referral_param ? configDetail.referral_param.k1 : 1
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={5} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='K2 = '>
                        {getFieldDecorator(`referral_param_k2`, {
                          rules: [{
                            required: true,
                            message: 'K2不能为空'
                          }, {
                            validator: this.validatorK
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.referral_param ? configDetail.referral_param.k2 : 1
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={5} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='K3 = '>
                        {getFieldDecorator(`referral_param_k3`, {
                          rules: [{
                            required: true,
                            message: 'K3不能为空'
                          }, {
                            validator: this.validatorK
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.referral_param ? configDetail.referral_param.k3 : 1
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={5} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label={(
                          <span>
                            r<sub>GQ</sub> =
                          </span>
                        )}>
                        {getFieldDecorator(`referral_param_Rgq`, {
                          rules: [{
                            required: true,
                            message: 'Rgq不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              const val = parseFloat(value)
                              const err = '只允许修改为[-1,1]的数字，可为小数'
                              if (value && (!(/^[- | \d]+\.?\d*$/).test(value) || val > 1 || val < -1)) {
                                callback(err)
                              }
                              callback()
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.referral_param ? configDetail.referral_param.rgq : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label={(
                          <span>
                            r<sub>GN</sub> =
                          </span>
                        )}>
                        {getFieldDecorator(`referral_param_Rgn`, {
                          rules: [{
                            required: true,
                            message: 'Rgn不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              const val = parseFloat(value)
                              const err = '只允许修改为[-1,1]的数字，可为小数'
                              if (value && (!(/^[- | \d]+\.?\d*$/).test(value) || val > 1 || val < -1)) {
                                callback(err)
                              }
                              callback()
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.referral_param ? configDetail.referral_param.rgn : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>综 合 成 绩：G<sub>X</sub> = 0.6 * G<sub>C</sub> + 0.4 * G<sub>1</sub></div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol2'>
              <Row>
                <Col span={2}>
                  <span className='slp-mod-seniorexam__setlabel'>参数设置：</span>
                </Col>
                <Col span={22}>
                  <Row>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w1 = '>
                        {getFieldDecorator(`composition_param_w1`, {
                          rules: [{
                            required: true,
                            message: 'w1不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'composition_param', cell: 'w', nums: [1, 2]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.composition_param ? configDetail.composition_param.w1 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w2 = '>
                        {getFieldDecorator(`composition_param_w2`, {
                          rules: [{
                            required: true,
                            message: 'w2不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'composition_param', cell: 'w', nums: [1, 2]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.referral_param ? configDetail.composition_param.w2 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>线 下 成 绩：G<sub>C</sub>=( g<sub>1</sub> * ω<sub>1</sub> + g<sub>2</sub> + g<sub>3</sub> * ω<sub>1</sub> ) / 10</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol2'>
              <Row>
                <Col span={2}>
                  <span className='slp-mod-seniorexam__setlabel'>参数设置：</span>
                </Col>
                <Col span={22}>
                  <Row>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w1 = '>
                        {getFieldDecorator(`offline_param_three_terms_w1`, {
                          rules: [{
                            required: true,
                            message: 'w1不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'offline_param_three_terms', cell: 'w', nums: [1, 2, 3]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.offline_param ? configDetail.offline_param.three_terms.w1 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w2 = '>
                        {getFieldDecorator(`offline_param_three_terms_w2`, {
                          rules: [{
                            required: true,
                            message: 'w2不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'offline_param_three_terms', cell: 'w', nums: [1, 2, 3]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.offline_param ? configDetail.offline_param.three_terms.w2 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w3 = '>
                        {getFieldDecorator(`offline_param_three_terms_w3`, {
                          rules: [{
                            required: true,
                            message: 'w3不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'offline_param_three_terms', cell: 'w', nums: [1, 2, 3]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.offline_param ? configDetail.offline_param.three_terms.w3 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={2}>
                      <span className='slp-mod-seniorexam__setlabel slp-mod-seniorexam__setlabel3'> ( 三项成绩 ) </span>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w1 = '>
                        {getFieldDecorator(`offline_param_two_terms_w1`, {
                          rules: [{
                            required: true,
                            message: 'w1不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'offline_param_two_terms', cell: 'w', nums: [1, 2]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.offline_param ? configDetail.offline_param.two_terms.w1 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w2 = '>
                        {getFieldDecorator(`offline_param_two_terms_w2`, {
                          rules: [{
                            required: true,
                            message: 'w2不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'offline_param_two_terms', cell: 'w', nums: [1, 2]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.offline_param ? configDetail.offline_param.two_terms.w2 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={2}>
                      <span className='slp-mod-seniorexam__setlabel slp-mod-seniorexam__setlabel3'>（两项成绩）</span>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>总 测 成 绩：G<sub>C</sub>=( g<sub>1</sub> * ω<sub>1</sub> + g<sub>2</sub> + g<sub>3</sub> * ω<sub>1</sub> ) / 10</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__setcol slp-mod-seniorexam__setcol2'>
              <Row>
                <Col span={2}>
                  <span className='slp-mod-seniorexam__setlabel'>参数设置：</span>
                </Col>
                <Col span={22}>
                  <Row>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w1 = '>
                        {getFieldDecorator(`online_param_three_terms_w1`, {
                          rules: [{
                            required: true,
                            message: 'w1不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'online_param_three_terms', cell: 'w', nums: [1, 2, 3]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.online_param ? configDetail.online_param.three_terms.w1 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w2 = '>
                        {getFieldDecorator(`online_param_three_terms_w2`, {
                          rules: [{
                            required: true,
                            message: 'w2不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'online_param_three_terms', cell: 'w', nums: [1, 2, 3]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.online_param ? configDetail.online_param.three_terms.w2 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w3 = '>
                        {getFieldDecorator(`online_param_three_terms_w3`, {
                          rules: [{
                            required: true,
                            message: 'w3不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'online_param_three_terms', cell: 'w', nums: [1, 2, 3]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.online_param ? configDetail.online_param.three_terms.w3 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={2}>
                      <span className='slp-mod-seniorexam__setlabel slp-mod-seniorexam__setlabel3'> ( 三项成绩 ) </span>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w1 = '>
                        {getFieldDecorator(`online_param_two_terms_w1`, {
                          rules: [{
                            required: true,
                            message: 'w1不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'online_param_two_terms', cell: 'w', nums: [1, 2]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.online_param ? configDetail.online_param.two_terms.w1 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem
                        {...formItemLayout}
                        colon={false}
                        label='w2 = '>
                        {getFieldDecorator(`online_param_two_terms_w2`, {
                          rules: [{
                            required: true,
                            message: 'w2不能为空'
                          }, {
                            validator: (rule, value, callback) => {
                              this.validatorW(rule, value, callback, this.validatorSum, {filed: 'online_param_two_terms', cell: 'w', nums: [1, 2]})
                            }
                          }],
                          validateTrigger: TRIGGER,
                          initialValue: configDetail && configDetail.online_param ? configDetail.online_param.two_terms.w2 : ''
                        })(
                          <Input className='slp-ui-inpts slp-ui-inpts--xs' maxLength={4} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={2}>
                      <span className='slp-mod-seniorexam__setlabel slp-mod-seniorexam__setlabel3'>（两项成绩）</span>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className='slp-mod-seniorexam__btns'>
          <Button type='primary' htmlType='submit'>保存</Button>
          {configDetail ? <Button onClick={() => { this.props.changeState('detail', 'currentState') }}>取消</Button>
            : <Button onClick={this.handleReset}>取消</Button>
          }

        </div>
      </Form>
    )
  }
}
const WrappedHorizontalAlgorithmEditForm = Form.create()(AlgorithmEdit)
export default WrappedHorizontalAlgorithmEditForm
