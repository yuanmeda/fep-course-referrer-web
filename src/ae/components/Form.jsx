import React, { PropTypes } from 'react'
import isError from 'lodash/isError'
import isFunction from 'lodash/isFunction'
import isArray from 'lodash/isArray'
import flatten from 'lodash/flatten'
import { componentIntl } from 'ae/core/intl'
import normalizeButtons from 'ae/core/normalizers/buttons'
import { contextTypes } from 'ae/core/shapes'
import AEComponentBase from 'ae/components/Base'
import buildField, { defaultFormItemLayout } from 'ae/shared/build-field'
import { Form, Col } from 'fish'

function getDefaultButtons (reset, submit) {
  return normalizeButtons([{
    style: 'ghost',
    type: 'reset',
    action: 'reset',
    label: reset
  }, {
    style: 'primary',
    type: 'submit',
    action: 'submit',
    label: submit
  }])
}

@Form.create()
@componentIntl(`AE.Form`)
export default class AEComponentForm extends AEComponentBase {
  static contextTypes = contextTypes
  static propTypes = {
    entities: PropTypes.any,
    config: PropTypes.object,
    entity: PropTypes.object
  }
  static defaultProps = {
    config: {},
    entity: {}
  }

  _onResponse (payload) {
    if (!isError(payload)) {
      this.redirect()
    }
  }

  handleSubmit = () => {
    if (this.props.onSubmit) {
      this.handleAction(this.props.onSubmit)
    }
  }

  handleAction = action => {
    if (action === 'reset') {
      return this.props.form.resetFields()
    }

    if (action === 'submit') {
      return this.handleAction('post')
    }

    if (action === 'get') {
      return this.props[action]()
    }

    if (action === 'back') {
      return this.context.router.goBack()
    }

    if (action === 'redirect') {
      return this.redirect()
    }

    this.props.form.validateFields((err, entity) => {
      if (!err) {
        if (isFunction(action)) {
          return action.call(this, entity)
        }

        const ok = (...args) => {
          const { onResponse = this._onResponse } = this.props.config
          // 执行回调，可能是跳转或关闭对话框
          onResponse.apply(this, args)
        }

        const ko = ok

        // 跳转需要带上 restParams，否则可能报错
        switch (action) {
          case 'put':
          case 'patch':
            return this.props[action](this.props.params.id, { data: entity }, ok, ko)
          default:
            return this.props[action]({ data: entity }, ok, ko)
        }
      }
    })
  }

  _getButtons () {
    let { buttons } = this.props.config
    // 如果传入的buttons为空数组，表示故意配置成无按钮，就不处理了
    if (buttons === undefined) {
      // 如果buttons为空，则使用 context 里的
      buttons = this.context.ae.buttons
      if (isArray(buttons)) {
        // 过滤掉给表格的
        buttons = buttons.filter(button => !button.scope)
      }

      // 如果都不存在，则使用默认的
      if (!buttons || buttons.length === 0) {
        buttons = getDefaultButtons(
          this.__('reset', {}, '重置'),
          this.__('submit', {}, '提交')
        )
      }
    }

    const formItemLayout = this.props.config.formItemLayout || defaultFormItemLayout
    const layout = {
      offset: formItemLayout.labelCol && formItemLayout.labelCol.span,
      span: formItemLayout.wrapperCol && formItemLayout.wrapperCol.span
    }
    return (
      <Form.Item>
        <Col {...layout}>
          {buttons && buttons.map(button => button.component.call(this))}
        </Col>
      </Form.Item>
    )
  }

  render () {
    const { schema } = this.context
    const { form, entity = {}, config = {} } = this.props
    if (config.formItemLayout) {
      form.formItemLayout = config.formItemLayout
    }
    return (
      <Form {...config.formConfig} onSubmit={this.handleSubmit}>
        {flatten(schema.getFields(config.fields).map(field => buildField(field, entity, form))) }
        <div className='ae-form-buttons'>
          { this._getButtons() }
        </div>
      </Form>
    )
  }
}
