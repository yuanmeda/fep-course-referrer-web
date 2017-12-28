import isEmpty from 'lodash/isEmpty'
import createStorage from 'ae/shared/storage'

class Auth {
  constructor () {
    this.provider = window.ucManager
    this.storage = createStorage({
      namespace: 'AE-AUTH',
      // Session 20 分钟过期
      expires: 19 * 60 * 1000
    })
  }

  static SESSION_TYPES = {
    // --会话类型，
    // 0：注册(手机或邮箱注册)
    // 1：登录(帐号、密码登录)
    // 2：邮箱找回密码
    // 11：登录(短信登录)
    // 12：手机找回密码
    // 13：更新手机号码
    LOGIN: 1
  }

  static STORAGE_KEYS = {
    SESSION: 'SESSION'
  }

  _handleRes (res, onSuccess, onFailure) {
    if (this.provider.isOk(res)) {
      onSuccess && onSuccess(res)
      return res
    } else {
      onFailure && onFailure(res)
      throw new Error(JSON.stringify(res))
    }
  }

  // 获取验证码
  getCode (session_id) {
    return this.provider.getPictureCode(session_id)
  }

  async getSession (refresh = false) {
    const key = Auth.STORAGE_KEYS.SESSION
    const session = this.storage.get(key)
    if (!refresh && !isEmpty(session)) {
      return session
    }
    return this._handleRes(
      await this.provider.getSessionId(Auth.SESSION_TYPES.LOGIN),
      res => {
        // 缓存 session
        this.storage.set(key, res)
      }
    )
  }

  /**
   * 错误代码：
       UC/REQUIRE_ARGUMENT 缺少参数
       UC/INVALID_ARGUMENT 无效参数(格式不对,长度过长或过短等)
       UC/INVALID_LOGIN_NAME 登录名格式不正确,只能包括字母、数字、_、.、@，最长50字符
       UC/ORGNAME_INVALID 组织名格式不正确,只允许字母、数字、_，最长50字符
       UC/ACCOUNT_NOT_EXIST 帐号不存在
       UC/PASSWORD_NOT_CORRECT 密码不正确
       UC/ACCOUNT_UN_ENABLE 帐号未启用
       UC/LOGIN_FAILURE 登录失败
       UC/SESSION_EXPIRED Session未创建或已过期
       UC/SESSION_ID_NEED_FOR_ORG 该组织登录需要session_id
       UC/SESSION_TYPE_INVALID 会话类型不正确
       UC/IDENTIFY_CODE_REQUIRED 需要验证码登录
       UC/IDENTIFY_CODE_INVALID 无效的验证码
       UC/ACCOUNT_LOCKED 帐号登录错误次数太多，被锁定！请5分钟后再登录！
   * @param login_name
   * @param password
   * @param picture_code
   * @returns {Promise.<*>}
   */
  async login (login_name, password, picture_code = '') {
    const session = await this.getSession()
    return this._handleRes(await this.provider.login(login_name, password, session.session_id, session.session_key, picture_code))
  }

  logout () {
    // provider.logout 太慢了，所以不等了，直接返回
    this.provider.logout()
    return this._handleRes({})
  }

  async getUserInfo () {
    return this._handleRes(await this.provider.getUserInfo())
  }

  async checkLogin () {
    // ucManager.isLogin 居然返回的是字符串
    return this._handleRes(await this.provider.isLogin() === 'true')
  }

  thirdLoginSso ({ access_token, refresh_token, mac_key, user_id }) {
    return this.provider.thirdLoginSSO(access_token, refresh_token, mac_key, user_id)
      .then(res => {
        if (res !== 'success') {
          throw new Error('UC SDK thirdLoginSSO failed')
        }
      })
  }
}

export default new Auth()
