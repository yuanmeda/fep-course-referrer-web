/**
 * @description 中考选科组件：租户信息详情和编辑
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  currentState: [String] 当前态 detail or edit
 *  tanentInfo: [Object] 租户信息数据
 *  changeState: [Fun] 状态切换
 *  editTenant: [Fun] 编辑后提交数据
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Form, Input, Button, Radio} from 'fish'

const FormItem = Form.Item

@componentIntl('DetailTenant')
class DetailTenant extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      tanentInfo: props.tanentInfo,
      currentState: props.currentState
    }
  }
  // 参数变更 已加载组件收到新的参数时调用
  componentWillReceiveProps (props) {
    if (props.currentState) {
      this.setState({
        currentState: props.currentState
      })
    }
    if (props.tanentInfo) {
      this.setState({
        tanentInfo: props.tanentInfo
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const that = this
    this.props.form.validateFields((error, values) => {
      if (!error) {
        that.props.editTenant({
          tenant_name: values.tenant_name
        })
      } else {
        console.log('error', error, values)
      }
    })
  }
  render () {
    const {changeState} = this.props
    const {currentState, tanentInfo} = this.state
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {span: 2},
      wrapperCol: {span: 6}
    }
    return (
      <Form hideRequiredMark>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>租户名称设置</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__tree'>
              {currentState === 'detail'
                ? <span>
                  <span className='slp-mod-seniorexam__treelabel'>租户名称：</span>
                  <span className='slp-mod-seniorexam__treetxt'>{tanentInfo.tenant_name}</span>
                </span>
                : <FormItem
                  {...formItemLayout}
                  label='租户名称'>
                  {getFieldDecorator('tenant_name', {
                    rules: [{
                      required: true, message: '租户名称不能为空！'
                    }],
                    initialValue: tanentInfo && tanentInfo.tenant_name
                  })(<Input size='default' />)}
                </FormItem>
              }
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>项目信息配置</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__tree'>
              <Radio.Group>
                <Radio value='esp' disabled checked={tanentInfo && tanentInfo.tenant_type === 'esp'}>教育平台</Radio>
                <Radio value='fep' disabled checked={tanentInfo && tanentInfo.tenant_type === 'fep'}>高精尖</Radio>
              </Radio.Group>
              <p className='slp-mod-seniorexam__treetip'>注：教育平台组织树来自emos，基础学科来自NDR。</p>
            </div>
          </div>
        </div>

        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>教育平台信息配置</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__tree'>
              <span className='slp-mod-seniorexam__treelabel'>项目ID：</span>
              <span className='slp-mod-seniorexam__treetxt'>{tanentInfo && tanentInfo.tenant_project.project_id}</span>
            </div>
          </div>
        </div>
        <div className='slp-ui-formcard'>
          <div className='slp-ui-formcard__head'>sdp_app_id</div>
          <div className='slp-ui-formcard__body'>
            <div className='slp-mod-seniorexam__tree'>
              <span className='slp-mod-seniorexam__treelabel'>sdp_app_id：</span>
              <span className='slp-mod-seniorexam__treetxt'>{tanentInfo && tanentInfo.sdp_app_id}</span>
            </div>
          </div>
        </div>
        {
          currentState === 'detail'
            ? <div className='slp-mod-seniorexam__btns'>
              <Button type='primary' onClick={() => { changeState('edit', 'currentState') }}>修改</Button>
            </div>
            : <div className='slp-mod-seniorexam__btns'>
              <Button type='primary' onClick={this.handleSubmit} >保存</Button>
              <Button type='primary' onClick={() => { changeState('detail', 'currentState') }}>取消</Button>
            </div>
        }

      </Form>
    )
  }
}

const WrappedHorizontalDetailTenantForm = Form.create()(DetailTenant)
export default WrappedHorizontalDetailTenantForm
