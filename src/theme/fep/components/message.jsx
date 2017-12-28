import { Component, PropTypes } from 'react'
// import isEqual from 'lodash/isEqual'
import { message } from 'fish'

export default class Main extends Component {
  static propTypes = {
    globalMessage: PropTypes.object
  }

  static defaultProps = {
    globalMessage: {}
  }

  componentWillReceiveProps (nextProps) {
    const { globalMessage } = nextProps
    if (globalMessage && globalMessage.message && globalMessage !== this.props.globalMessage) {
      message.error(globalMessage.message, 2)
    }
  }

  render () {
    return null
  }
}
