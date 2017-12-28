import React, { Component, PropTypes } from 'react'
import Hover from './Hover'
import defaultAvatar from '../../images/avatar.png'

export default class User extends Component {
  state = {
    avatar: defaultAvatar
  }

  static propTypes = {
    authUser: PropTypes.object
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.authUser && this.props.authUser !== nextProps.authUser) {
      const { user_id } = nextProps.authUser
      this.setState({
        avatar: `${window.ORIGINS.UC_AVATAR}/${user_id}/${user_id}.jpg?size=240`
      })
    }
  }

  handleAvatarError = () => {
    this.setState({
      avatar: defaultAvatar
    })
  }

  render () {
    const { user_id, nick_name, user_name, org_user_code } = this.props.authUser || {}
    return (
      user_id ? <Hover
        className='hover-item'
        overlay={<span className='user-name'>{nick_name || user_name || org_user_code || user_id}</span>}>
        <img className='avatar'
          src={this.state.avatar}
          onError={() => { this.handleAvatarError() }} />
      </Hover> : null
    )
  }
}
