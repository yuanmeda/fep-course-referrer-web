// 输入到全局
import './constants'
import request, { intercept } from 'ae/shared/request'
import { bootstrap } from 'ae'
import { getUrlParams } from 'services/utils'
import 'assets/styles/style-exam.min.css'
import 'assets/styles/custom.less'

const urlParams = getUrlParams()
request({
  url: `${ORIGINS.FEP}/v1/common/encode?code=${urlParams['project_id']}`
}).then(GAEAID => {
  window.GAEAID = GAEAID
  // window.global_uc_sdp_app_id = urlParams['sdp_app_id'] || 'e955b848-cc82-4d07-8d33-640d4e9ddf44'
  bootstrap()
    // 命名空间，可用于避免同一域名下多个 AE 应用导致的数据冲突
    .ns('FEP')
    // 非admin禁用rbac
    .rbac({
      disabled: urlParams.client !== 'admin',
      client: urlParams.client
    })
    // 解析并加载 require.context，允许多次调用
    .req(require.context('./modules', true, /(?:index|404).jsx?$/))
    // 自定义主题
    // .theme(import('./theme/fep'))
    // 挂载！
    .mount('#app')
})
// 请求拦截添加 'sdp-app-id'
intercept(config => {
  if (window.GAEAID && config.url.indexOf(ORIGINS.FEP) !== -1) {
    config.headers = {
      ...config.headers,
      'X-Gaea-Authorization': `GAEA id="${window.GAEAID}"`
    }
  }
  return config
})
