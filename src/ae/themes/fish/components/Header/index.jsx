import React, { PropTypes } from 'react'
import ComponentBase from 'ae/components/Base'
import { Icon } from 'fish'
import Hover from './Hover'
import Language from './Language'
import User from './User'

export default class Header extends ComponentBase {
  static propTypes = {
    authUser: PropTypes.object,
    delete: PropTypes.func.isRequired,
    detail: PropTypes.func.isRequired
  }

  static defaultProps = {
    authUser: {}
  }

  componentWillMount () {
    this.props.detail()
  }

  handleLogout () {
    this.props.delete()
  }

  render () {
    return (
      <header className='ae-layout-header'>
        <nav>
          <Language />
          <User authUser={this.props.authUser} />
          <Hover
            className='hover-item quit'
            overlay={
              <a href='javascript:;' onClick={() => { this.handleLogout() }}>
                {this.__('logout')}
              </a>
            }>
            <Icon type='poweroff' onClick={() => { this.handleLogout() }} />
          </Hover>
        </nav>
      </header>
    )
  }
}
