import { handleActions } from 'redux-actions'
import isEmpty from 'lodash/isEmpty'
import camelCase from 'ae/shared/camel-case'
import storeReducers from 'ae/store/reducers'

export default function parseReducers (config) {
  const { scope, reducers, modules } = config
  if (!isEmpty(reducers)) {
    const _scope = camelCase(scope)
    Object.assign(storeReducers, {
      [_scope]: handleActions({
        [_scope]: reducers
      }, {})
    })
  }
  if (!isEmpty(modules)) {
    // TODO 避免覆盖？
    Object.values(modules).forEach(parseReducers)
  }
}
