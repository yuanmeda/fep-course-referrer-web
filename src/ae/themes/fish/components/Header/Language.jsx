import React, { Component } from 'react'
import qs from 'query-string'
import { Icon, Dropdown, Menu } from 'fish'
import i18n from 'ae/services/i18n'

export default class Language extends Component {
  changeLocale = ({ key: locale }) => {
    const search = qs.parse(window.location.search)
    window.location.search = qs.stringify(Object.assign(search, { locale }))
  }

  render () {
    const supportLanguages = i18n.getSupportLanguages()
    // 少于一种语言，就不选择了
    if (supportLanguages.length <= 1) {
      return null
    }

    const overlay = (
      <Menu onSelect={this.changeLocale}>
        {
          supportLanguages.map(item => (
            <Menu.Item key={item.id}>{item.label}</Menu.Item>
          ))
        }
      </Menu>
    )
    const lang = i18n.getLocale()
    return (
      <Dropdown overlay={overlay} trigger={['click']}>
        <div className='hover-item lang'>
          {lang.label}
          <Icon type='down' />
        </div>
      </Dropdown>
    )
  }
}
