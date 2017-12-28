import React from 'react'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'
import { Button } from 'fish'
import hasOwn from 'ae/shared/has-own'

let key = Date.now()

export default function (buttons) {
  if (!buttons) {
    return undefined
  }

  return buttons.map((button, index) => {
    if (button.__normalized) {
      return button
    }

    const {
      label,
      style = 'default',
      type = 'button',
      action = () => {},
      disabled,
      component,
      scope,
      ...rest
    } = button

    return Object.assign(rest, {
      __normalized: true,
      label,
      // 用于显示
      component: component || function (...args) {
        let __action = action
        if (isString(action)) {
          const _action = action
          __action = function () {
            if (this.handleAction) {
              this.handleAction(_action, ...args)
            } else if (hasOwn(this.props, _action)) {
              this.props[_action](...args)
            }
          }
        }
        /**
         * arguments:
         *  on item: id, entity, index
         *  on list: state
         */
        return scope === 'item'
          ? <a key={key++} disabled={isFunction(disabled) ? disabled.apply(this, args) : disabled} href='javascript:;' onClick={() => { __action.apply(this, args) }}>{label}</a>
          : <Button type={style} disabled={isFunction(disabled) ? disabled.apply(this, args) : disabled} htmlType={type} key={key++} onClick={() => { __action.apply(this, args) }}>{label}</Button>
      },
      scope
    })
  })
}
