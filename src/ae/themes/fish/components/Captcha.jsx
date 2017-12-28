import React, { PropTypes } from 'react'
import ComponentBase from 'ae/components/Base'
import { Input, Row, Col, Icon } from 'fish'

export default class Captcha extends ComponentBase {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    config: PropTypes.shape({
      title: PropTypes.string,
      placeholder: PropTypes.string,
      size: PropTypes.string,
      authCode: PropTypes.string,
      onCodeError: PropTypes.func
    })
  }

  state = {
    key: 0
  }

  handleRefresh = () => {
    this.setState({
      key: this.state.key + 1
    })
  }

  render () {
    const { value, onChange, config: { title, placeholder, size, authCode, onCodeError } } = this.props
    const codeUrl = `${authCode}?_=${this.state.key}`
    return (
      <Row gutter={16} className='captcha'>
        <Col span='8'>
          <Input
            size={size}
            value={value}
            onChange={onChange}
            placeholder={placeholder} />
        </Col>
        <Col span='12'>
          <img src={codeUrl} onError={onCodeError} />
        </Col>
        <Col span='4'>
          <Icon type='reload' title={title} onClick={this.handleRefresh} />
        </Col>
      </Row>
    )
  }
}
