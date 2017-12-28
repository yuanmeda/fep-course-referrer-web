import 'ae/polyfills'
// 输入到全局
import 'ae/constants'
import AE from 'ae/AE'
import 'ae/core/register'

/**
 * 所有组件必须基于 Base
 */
export { default as Component } from 'ae/components/Base'
export { default as Grid } from 'ae/components/Grid'
export { default as Form } from 'ae/components/Form'
export { default as Field } from 'ae/components/Field'
export { default as Decorator } from 'ae/components/Decorator'
export { default as Render } from 'ae/components/Render'
export { default as Route } from 'ae/core/route'
export { contextTypes, propTypes } from 'ae/core/shapes'
export { default as redirect } from 'ae/shared/redirect'
export { default as formatPath } from 'ae/shared/format-path'
export { formatPattern } from 'react-router'
export * from 'ae/core/intl'

export function bootstrap () {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`%c hello AE `, 'background: #222; color: #bada55')
  }

  // 合并并解析
  return new AE().req(require.context('./modules', true, /(?:index|404)\.jsx$/))
}
