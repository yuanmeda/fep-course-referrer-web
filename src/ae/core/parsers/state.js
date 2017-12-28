import isEmpty from 'lodash/isEmpty'
import camelCase from 'ae/shared/camel-case'
import storeState from 'ae/store/state'

export default function parseState (config) {
  const { scope, state, modules } = config
  if (!isEmpty(state)) {
    const _scope = camelCase(scope)
    const _state = storeState[_scope] || {}
    Object.assign(storeState, {
      // 合并相同 scope 的 state
      [_scope]: Object.assign(_state, state)
    })
  }
  if (!isEmpty(modules)) {
    // TODO 避免覆盖？
    Object.values(modules).forEach(parseState)
  }
}
