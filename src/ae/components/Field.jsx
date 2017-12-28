import React, { Component, PropTypes } from 'react'
import { contextTypes } from 'ae/core/shapes'
import i18n from 'ae/services/i18n'

/**
 * 字段处理：编辑与显示
 */

export const RENDER_STATE = {
  EDIT: 0,
  DISPLAY: 1
}

export default class AEComponentField extends Component {
  static contextTypes = contextTypes

  static propTypes = {
    config: PropTypes.object.isRequired,
    entity: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    // 来自 ant
    value: PropTypes.any,
    renderState: PropTypes.number,
    onChange: PropTypes.func
  }

  static defaultConfig = {}

  constructor (props, context) {
    super(props, context)

    this.state = {
      value: this.props.value
    }

    this.config = Object.assign({}, this.constructor.defaultConfig, this.props.config)

    // 优先使用 props.config 中定义的 render
    const {
      displayRender = this.displayRender,
      editRender = this.editRender,
      ...restConfig } = this.config
    this.DisplayRender = displayRender.bind(this)
    this.EditRender = editRender.bind(this)
    // 使用干净的 config
    this.config = restConfig
  }

  componentWillReceiveProps (nextProps) {
    const { value } = nextProps
    if (value !== this.state.value) {
      this.setState({ value })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const { value, entity, field: { key }, renderState } = this.props
    if (renderState === RENDER_STATE.EDIT) {
      // 当且仅当 value 不相等时重新渲染
      return value !== nextProps.value
    } else {
      return entity[key] !== nextProps.entity[key]
    }
  }

  // 这里使用箭头函数，那么子类也必须使用箭头函数
  handleChange = value => {
    const { onChange, field } = this.props
    // 如果是数字类型的时间，则需要转成数字
    // TODO 支持更多类型的转换
    if (field.type === 'number') {
      value = +value
      if (isNaN(value)) {
        value = 0
      }
    }

    // 转换为标准的国际化数据结构
    value = this.i18nEncode(value)

    this.setState({ value })
    onChange && onChange(value)
  }

  editRender ({ value }) {
    return <div>{ value != null ? value : '-' }</div>
  }

  displayRender ({ value }) {
    return <div>{ value != null ? value : '-' }</div>
  }

  /**
   * 国际化数据编码
   * value: 'xxx'
   * =>
   * value: {
   *   'zh-CN': 'xxx'
   * }
   * @return {object} 国际化数据
   */
  i18nEncode (value) {
    const { field } = this.props
    if (!field.i18n) {
      return value
    }

    const { entity, renderState } = this.props
    let ret

    if (renderState === RENDER_STATE.EDIT) {
      ret = this.state.value
    } else {
      ret = entity[field.key]
    }

    ret = i18n.normalize(ret)

    const language = i18n.language || i18n.detectLanguage()
    ret[language] = value

    return ret
  }

  /**
   * 国际化数据解码
   * value: {
   *   'zh-CN': 'xxx'
   * }
   * =>
   * value: 'xxx'
   * @return {string} 'xxx'
   */
  i18nDecode (value) {
    const { field } = this.props
    if (!field.i18n) {
      return i18n.isI18nObj(value) ? JSON.stringify(value) : value
    }

    return i18n.decode(value)
  }

  // @protected
  render () {
    const { EditRender, DisplayRender } = this
    const { renderState, ...restProps } = this.props
    if (renderState === RENDER_STATE.EDIT) {
      const { field } = restProps
      const stateValue = this.i18nDecode(this.state.value)
      const defaultValue = this.i18nDecode(field.defaultValue)
      const value = stateValue === undefined ? defaultValue : stateValue
      return <EditRender {...restProps} value={value} />
    } else {
      const { entity, field } = restProps
      const entityValue = this.i18nDecode(entity[field.key])
      const value = entityValue === undefined ? '' : entityValue
      return <DisplayRender {...restProps} value={value} />
    }
  }
}
