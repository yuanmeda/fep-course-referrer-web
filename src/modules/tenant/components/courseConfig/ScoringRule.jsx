/**
 * @description 中考选科组件：计分规则配置
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 * @param {
 *  tenantId: [String] 租户id
 *  referralRule: [Array] 选考规则数据
 *  scoringRule: [Array] 计分规则数据
 * }
 */
import React from 'react'
import {Component, componentIntl, contextTypes, propTypes} from 'ae'
import {Form, Input, Button, Row, Col} from 'fish'
import Dialog from 'components/dialog'
import TenantService from 'services/tenant'

const FormItem = Form.Item

@componentIntl('Demo')
class ScoringRule extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  constructor (props) {
    super(props)
    this.state = {
      currentState: '',
      scoringRule: props.scoringRule,
      referralRule: props.referralRule
    }
  }
  componentDidMount () {
    this.setState({
      currentState: this.props.scoringRule ? 'detail' : 'undetail'
    })
  }

  componentWillReceiveProps (props) {
    if (props.referralRule) {
      this.setState({
        referralRule: props.referralRule
      })
    }
    if (props.scoringRule) {
      this.setState({
        scoringRule: props.scoringRule
      })
    }
  }
  changeState = (value, key) => {
    this.setState({
      [key]: value
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    const that = this
    this.props.form.validateFields((error, values) => {
      if (!error) {
        const data = values.items.map((val, index) => (values[`scale_${index}`] / 100))
        TenantService.setScoringRule({
          tenant_id: that.props.tenantId,
          data
        }).then(() => {
          this.setState({
            scoringRule: data,
            currentState: 'detail'
          })
        }).catch((err) => {
          let msg = ''
          const code = err.response && err.response.data && err.response.data.code
          switch (code) {
            case 'CRS/REFERRAL_SUBJECT_UNCONFIG ':
              msg = '选考科目未配置'
              break
            case 'CRS/REFERRAL_RULE_UNCONFIG ':
              msg = '选考规则未配置'
              break
            default:
              break
          }
          if (msg) {
            Dialog.warning({
              title: '提示',
              content: msg
            })
          }
        })
      } else {
        console.log('error', error, values)
      }
    })
  }

  render () {
    const {scoringRule, referralRule, currentState} = this.state
    const { getFieldDecorator, getFieldValue } = this.props.form
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16}
    }
    let formItems
    if (currentState === 'undetail') {
      if (scoringRule) {
        getFieldDecorator('items', {initialValue: scoringRule}) // 编辑态
      } else {
        const nums = []
        for (var i = 0; i < referralRule.referral_subject_num; i++) {
          nums.push(i + 1)
        }
        getFieldDecorator('items', {initialValue: nums}) // 新增态
      }
      const itemsData = getFieldValue('items')
      formItems = itemsData.map((item, index) => {
        return (
          <Row>
            <Col span={5}>
              <FormItem
                {...formItemLayout}
                label={`第${index + 1}高`}>
                {getFieldDecorator(`scale_${index}`, {
                  rules: [{
                    required: true, message: '请填写对应计分比例。'
                  }, {
                    validator: (rule, value, callback) => {
                      const val = parseFloat(value)
                      const err1 = '只允许输入[1,100]之间的整数'
                      if (value && (!val || (val && ((/[^\d]/g).test(value) || val > 100 || val < 1)))) {
                        callback(err1)
                      }
                      // 这里必须有个默认的回调，否则表单submit不会去回调
                      callback()
                    }
                  }],
                  initialValue: scoringRule && (item * 100).toFixed(0),
                  validateTrigger: 'onBlur'
                })(<Input size='default' />)}
              </FormItem>
            </Col>
            <Col span={1}>
              <span className='slp-mod-seniorexam--unit'>%</span>
            </Col>
          </Row>
        )
      })
    }
    if (currentState === 'detail') {
      formItems = scoringRule.map((val, index) => {
        return (
          <p className='slp-mod-seniorexam__setinpts'>
            <span className='slp-base-ghost'>{`第${index + 1}高：`}</span>
            <span className='slp-mod-seniorexam__treetxt'>{`${(val * 100).toFixed(0)}`}</span>
            <span>%</span>
          </p>
        )
      })
    }

    return (
      currentState === 'undetail'
        ? <Form onSubmit={this.handleSubmit} hideRequiredMark>
          <div className='slp-mod-seniorexam__setbody'>
            <p className='slp-mod-seniorexam__setintro'>需选考{referralRule && referralRule.referral_subject_num}科，请分别设置参与中考计分比例</p>
            {formItems}
            <div className='slp-mod-seniorexam__btns'>
              <Button type='primary' htmlType='submit' size='large'>保存</Button>
              <Button type='primary' onClick={() => { this.changeState('detail', 'currentState') }}>取消</Button>
            </div>
          </div>
        </Form>
        : <div className='slp-mod-seniorexam__setbody'>
          <p className='slp-mod-seniorexam__setintro'>需选考{referralRule && referralRule.referral_subject_num}科，请分别设置参与中考计分比例</p>
          {formItems}
          <div className='slp-mod-seniorexam__btns'>
            <Button type='primary' onClick={() => { this.changeState('undetail', 'currentState') }}>修改</Button>
          </div>
        </div>
    )
  }
}
const WrappedHorizontalScoringRuleForm = Form.create()(ScoringRule)
export default WrappedHorizontalScoringRuleForm
