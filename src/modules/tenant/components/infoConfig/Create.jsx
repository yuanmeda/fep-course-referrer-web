/**
 * @description 中考选科组件：租户信息新增
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  submitInfo: [Fun] 提交数据
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Form, Input, Button, Radio, Row, Col} from 'fish'

const FormItem = Form.Item

@componentIntl('CreateTenant')
class CreateTenant extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  handleReset = () => {
    this.props.form.resetFields()
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const that = this
    this.props.form.validateFields((error, values) => {
      if (!error) {
        that.props.submitInfo({
          tenant_name: values.tenant_name,
          tenant_type: values.tenant_type,
          tenant_project: {
            project_id: values.project_id,
            project_code: values.project_code
          },
          sdp_app_id: values.sdp_app_id
        })
      } else {
        console.log('error', error, values)
      }
    })
  }
  render () {
    const {getFieldDecorator} = this.props.form
    return (
      <Form onSubmit={this.handleSubmit} hideRequiredMark>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>租户名称设置</div>
          <div className='slp-ui-formcard__body'>
            <div className='ndui-form-item'>
              <FormItem
                labelCol={{span: 2}}
                wrapperCol={{span: 6}}
                label='租户名称'>
                {getFieldDecorator('tenant_name', {
                  rules: [{
                    required: true, message: '租户名称不能为空！'
                  }]
                })(<Input size='default' maxLength={20} />)}
              </FormItem>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>项目信息配置</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__tree'>
              <FormItem
                label='项目信息配置'>
                {getFieldDecorator('tenant_type', {
                  rules: [{
                    required: true, message: '项目信息配置不能为空！'
                  }]
                })(
                  <Radio.Group>
                    <Radio key={0} value='esp'>教育平台</Radio>
                    <Radio key={1} value='fep'>高精尖</Radio>
                  </Radio.Group>
                )}
              </FormItem>
              <p className='slp-mod-seniorexam__treetip'>注：教育平台组织树来自emos，基础学科来自NDR。</p>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>教育平台信息配置</div>
          <div className='slp-ui-formcard__body'>
            <div className='ndui-form-item'>
              <Row >
                <Col span={8}>
                  <FormItem
                    labelCol={{span: 6}}
                    wrapperCol={{span: 18}}
                    label='项目ID'>
                    {getFieldDecorator('project_id', {
                      rules: [{
                        required: true, message: '项目信息配置不能为空！'
                      }, {
                        validator: (rule, value, callback) => {
                          const err = '只允许输入数字！'
                          if (value && (/[^\d]/g).test(value)) {
                            callback(err)
                          }
                          callback()
                        }
                      }]
                    })(<Input size='default' maxLength={255} />)}
                  </FormItem>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>sdp_app_id</div>
          <div className='slp-ui-formcard__body'>
            <div className='ndui-form-item'>
              <FormItem
                labelCol={{span: 3}}
                wrapperCol={{span: 6}}
                label='sdp_app_id'>
                {getFieldDecorator('sdp_app_id', {
                  rules: [{
                    required: true, message: 'sdp_app_id不能为空！'
                  }]
                })(<Input size='default' maxLength={36} />)}
              </FormItem>
            </div>
          </div>
        </div>
        <div className='slp-mod-seniorexam__btns'>
          <Button type='primary' htmlType='submit'>保存</Button>
          <Button onClick={this.handleReset}>取消</Button>
        </div>
      </Form>
    )
  }
}
const WrappedHorizontalCreateTenantForm = Form.create()(CreateTenant)
export default WrappedHorizontalCreateTenantForm
