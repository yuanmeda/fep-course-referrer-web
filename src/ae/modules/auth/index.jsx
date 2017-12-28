import { $inject } from '@sdp.nd/redux-async-promise'
import rbac from 'ae/core/rbac'
import auth from './lib/auth'
import valid from './lib/valid'

const authPermissions = $inject(async authorized => {
  if (authorized && !rbac.disabled) {
    return rbac.getPermissions()
  }
  return []
})('authorized')

export default scope => ({
  // namespaced: true,
  state: {
    authorized: undefined, // undefined - 未知，false - 未登录，true - 已登录
    authCode: '',
    authError: false,
    authPermissions: [],
    authSession: {},
    authUser: null
  },
  actions: {
    getSession: async refresh => auth.getSession(refresh),
    getCode: session_id => auth.getCode(session_id),
    get: [
      // 自动登录；串行请求，返回 { authorized, authPermissions }
      () => ({
        authorized: auth.checkLogin(),
        authPermissions
      }),
      // 自定义 metaCreator，不处理全局错误
      () => ({
        finalProcess: {
          error: false
        }
      })
    ],
    // 表单登录；串行请求，返回 { authorized, authPermissions }
    post: ({ data: { name, pass, code } }) => ({
      // 登录成功，强制返回 true，不处理 tokens
      authorized: auth.login(name, pass, code).then(data => {
        if (data && typeof data === 'object') {
          return true
        }
        throw new Error(data)
      }),
      authPermissions
    }),
    delete: async () => auth.logout(),
    detail: async () => auth.getUserInfo(),
    // 验证单点 token；串行请求，返回 { authorized, authPermissions }
    valid: ({
      access_token,
      nonce,
      mac,
      http_method = 'GET',
      request_uri = '/',
      host = location.host
    }) => ({
      authorized: valid.post({
        uriParams: { access_token },
        data: { nonce, mac, http_method, request_uri, host }
      }),
      authPermissions
    }),
    // 第三方登录成功后，把tokens传给ucsdk, ucsdk模拟登录步骤
    thirdLoginSSO: tokens => auth.thirdLoginSso(tokens)
  },
  reducers: {
    getSession: {
      next (state, action) {
        // handle success
        return {
          ...state,
          authSession: action.payload
        }
      },
      throw (state, action) {
        // handle error
        return {
          ...state,
          authError: action.payload
        }
      }
    },

    getCode (state, action) {
      // handle success
      return {
        ...state,
        authCode: action.payload
      }
    },

    get: {
      next (state, action) {
        // handle success
        return {
          ...state,
          ...action.payload,
          authError: false
        }
      },
      throw (state, action) {
        // handle error
        return {
          ...state,
          authorized: false,
          authPermissions: [],
          authError: action.payload
        }
      }
    },

    post: {
      next (state, action) {
        // handle success
        return {
          ...state,
          ...action.payload,
          authError: false
        }
      },
      throw (state, action) {
        // handle error
        return {
          ...state,
          authorized: false,
          authPermissions: [],
          authError: action.payload
        }
      }
    },

    delete: {
      next (state, action) {
        // handle success
        return {
          ...state,
          authorized: false,
          authError: false
        }
      },
      throw (state, action) {
        // handle error
        return {
          ...state,
          authorized: false,
          authError: action.payload
        }
      }
    },

    detail: {
      next (state, action) {
        // handle success
        return {
          ...state,
          authError: false,
          authUser: action.payload
        }
      },
      throw (state, action) {
        // handle error
        return {
          ...state,
          authError: action.payload,
          authUser: null
        }
      }
    },

    // 与 post 一致
    valid: {
      next (state, action) {
        // handle success
        return {
          ...state,
          ...action.payload,
          authError: false
        }
      },
      throw (state, action) {
        // handle error
        return {
          ...state,
          authorized: false,
          authPermissions: [],
          authError: action.payload
        }
      }
    }
  }
})
