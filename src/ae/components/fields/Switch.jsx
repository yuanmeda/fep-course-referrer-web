import React from 'react'
import AEComponentField from 'ae/components/Field'
import { Switch } from 'fish'

/**
 * 开关
 */
export default class AEComponentFieldSwitch extends AEComponentField {
  static defaultConfig = {
    checkedChildren: '',
    checkedValue: true,
    unCheckedChildren: '',
    unCheckedValue: false,
    size: 'default'
  }

  editRender ({ value }) {
    const {
      checkedChildren,
      checkedValue,
      unCheckedChildren,
      unCheckedValue,
      size
    } = this.config

    return (
      <Switch {...this.config}
        checked={value === checkedValue}
        checkedChildren={checkedChildren}
        unCheckedChildren={unCheckedChildren}
        onChange={v => this.handleChange(v ? checkedValue : unCheckedValue)}
        size={size}
        defaultChecked />
    )
  }

  displayRender ({ value }) {
    const {
      checkedChildren,
      checkedValue,
      unCheckedChildren
    } = this.config
    return (
      <span>
        {value === checkedValue ? checkedChildren : unCheckedChildren}
      </span>
    )
  }
}
