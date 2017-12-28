import { Component } from 'react'
import { contextTypes, propTypes } from 'ae/core/shapes'
import i18n from 'ae/services/i18n'

/**
 * Component 基类
 */
export default class AEComponentBase extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  __ (id, values, defaultMessage) {
    const { antLocale } = this.context
    const { aeComponentIntl, aeInjectedIntl } = this.props
    // 先组件
    // IE 10 下 antLocale 可能为 undefined
    if (antLocale && aeComponentIntl) {
      // defaultMessage 使用 undefined，
      // 使得如果没有在组件里找到翻译，会去模块的翻译里找
      const res = i18n.translate(`${aeComponentIntl}.${id}`, values, undefined, antLocale.Comp)
      if (res !== undefined) {
        return res
      }
      // 如果没找到翻译，则往下执行
    }
    // 再模块
    if (aeInjectedIntl) {
      return aeInjectedIntl.formatMessage({
        id,
        defaultMessage
      }, values)
    }
    // 再默认
    return defaultMessage || id
  }

  /**
   * 用于跳转列表（过滤装饰器与详情、编辑等信息）
   */
  redirect (query = {}) {
    /* eslint-disable */
    const { deco, id, act, ...restParams } = this.props.params
    /* eslint-enable */

    this.context.route.push(restParams, Object.assign({
      // 确保刷新
      _: Date.now()
    }, query))
  }

  render () {
    return null
  }
}
