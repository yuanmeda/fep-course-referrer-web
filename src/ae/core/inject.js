import { connect } from 'react-redux'
import camelCase from 'ae/shared/camel-case'
import actions from 'ae/store/actions'

// TODO 支持黑白名单？不需要的数据不要 connect？允许只 connect state 或 action
// TODO 重命名？inject-store？

function connectState (scopes) {
  return state => scopes.reduce((obj, scope) => Object.assign(obj, state[scope]), {})
}

function connectActions (scopes) {
  return scopes.reduce((obj, scope) => Object.assign(obj, actions[scope]), {})
}

/**
 * 注入全局及自定义的 state/actions
 */
export default function inject ({ scope, inject } = {}) {
  const injectKeys = []

  // 注入在配置项 inject 中声明的其它模块
  if (inject) {
    injectKeys.push(...inject.map(camelCase))
  }

  // 注入当前 scope
  injectKeys.push(camelCase(scope))

  const mapStateToProps = connectState(injectKeys, scope)
  const mapDispatchToProps = connectActions(injectKeys, scope)

  return ConnectedComponent => connect(
    mapStateToProps,
    mapDispatchToProps
  )(ConnectedComponent)
}
