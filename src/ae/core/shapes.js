import { PropTypes } from 'react'

export default {
  contextTypes: {
    ae: PropTypes.any,
    source: PropTypes.any,
    schema: PropTypes.any,
    route: PropTypes.any,
    antLocale: PropTypes.any,
    intl: PropTypes.any,
    // location: PropTypes.object,
    // params: PropTypes.object,
    router: PropTypes.object
  },
  // 留空，不影响正常使用，却能跳过检查
  propTypes: {}
}
