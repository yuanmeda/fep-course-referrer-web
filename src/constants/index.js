/**
 * [ORIGINS 环境对应host]
 * 默认{ CS,RBAC,UC,UC_AVATAR }
 */
window.ORIGINS = require(`./origins/${process.env.SDP_ENV}`)

/**
 * [ORIGINS 常量配置]
 * 默认{ CDN_JS_BASE,LOCALE_BASE }
 */
window.AECONST = {
  PAGE_SIZE: 8, // 分页数
  DATE_TIME_STYLE: 'YYYY-MM-DD HH:mm' // 日期_时间格式
}
