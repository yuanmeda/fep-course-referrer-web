import React, { PropTypes } from 'react'
import ComponentBase from 'ae/components/Base'
import { message } from 'fish'
import { Base64 } from 'js-base64'
import Loading from './Loading'

export default class AuthLogin extends ComponentBase {
  static propTypes = {
    query: PropTypes.object.isRequired,
    valid: PropTypes.func.isRequired
  }

  componentDidMount () {
    // sdp-app-id
    // vorg
    // orgname
    // back: 成功后跳转地址
    // auth
    // mode=embed: 聚合后台
    // , back, vorg, orgname
    const { auth, mode, back = '/' } = this.props.query
    // const sdpAppId = this.props.query['sdp-app-id']
    const re = /"(.*)"/
    const params = (mode === 'embed' ? Base64.decode(auth) : auth)
      .split(',')
      .map(param => param.match(re))
      // matched 有可能是 null
      .map(matched => (matched && matched[1]) || '')

    if (params && params.length >= 3) {
      this.props.valid(
        // access_token, nonce, mac
        {
          access_token: params[0],
          nonce: params[1],
          // mac 有可能包含空格，需要替换
          mac: params[2].replace(/\s/g, '+'),
          request_uri: mode === 'embed' ? `/${window.location.hash.split('&auth=')[0]}` : '/'
        },
        // callback when ok
        res => {
          const { authorized: { entities, result } } = res
          const tokens = entities[result[0]]
          // 把 tokens 给 ucsdk
          this.props.thirdLoginSso(tokens).then(() => {
            window.location.hash = `#${back}`
          }).catch(err => {
            if (process.env.NODE_ENV !== 'production') {
              console.error(err)
            }
            message.error(this.__('auth.invalid'), 2)
            window.location.hash = '#/'
          })
        },
        // callback when error
        () => {
          setTimeout(() => {
            window.location.hash = `#/`
          }, 2000)
        }
      )
    } else {
      message.error(this.__('auth.invalid'), 2)
    }
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    return <Loading />
  }
}
