import React from 'react'
import AEComponentRender from 'ae/components/Render'
import { get } from 'ae/services/uc'

export default class AEComponentRenderUser extends AEComponentRender {
  state = {
    entity: {}
  }

  componentWillMount () {
    const { value } = this.props
    if (value) {
      get(value).then(entity => {
        this._isMounted && this.setState({
          entity
        })
      })
    }
  }

  render () {
    const { value } = this.props
    const { entity } = this.state

    return <i title={value}>{entity.nick_name || entity.user_name || value}</i>
  }
}
