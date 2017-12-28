import React from 'react'
import flattenDeep from 'lodash/flattenDeep'
import { componentIntl } from 'ae/core/intl'
import { contextTypes } from 'ae/core/shapes'
import AEComponentBase from 'ae/components/Base'
import Forbidden from 'ae/components/Forbidden'
import restify from 'ae/shared/restify-actions'

function wrap ({ permission, transparent }) {
  return WrappedComponent => {
    class RBAC extends AEComponentBase {
      // IE 10 必须要有 contextTypes，不然正确获取 context，原因未知
      static contextTypes = contextTypes

      constructor (props, context) {
        super(props, context)
        this.i18ns = {
          e401: this.__('forbidden.401'),
          e403: this.__('forbidden.403')
        }
      }

      transfer (Element) {
        return transparent
          // 透传，不做阻止，用于装饰器
          ? <WrappedComponent.WrappedComponent {...this.props} />
          : Element
      }

      render () {
        switch (rbac.checkAuth(this.props, permission)) {
          case 401:
            return this.transfer(<Forbidden code={401} message={this.i18ns.e401} />)
          case 403:
            return this.transfer(<Forbidden code={403} message={this.i18ns.e403} />)
          default:
            return <WrappedComponent {...this.props} />
        }
      }
    }

    return componentIntl('AE.RBAC')(RBAC)
  }
}

const api = restify('Grid', {
  uri: `${ORIGINS.RBAC}/v0.1/resources/my/:client`,
  normalize (items) {
    return {
      result: flattenDeep(items.map(({ resources }) => resources.map(({ code }) => code)))
    }
  }
}, { primaryKey: ['code'] })

const rbac = {
  disabled: false,
  client: 'admin',
  prefix: undefined,
  getPermissions () {
    return api.list({
      uriParams: {
        client: rbac.client
      }
    }).then(({ result }) => result)
  },
  should (permission) {
    // 被禁用
    if (rbac.disabled) {
      return false
    }
    // 模块不需要权限控制
    if (permission === -1) {
      return false
    }
    return true
  },
  // TODO 应该用 HOC 来实现？
  checkAuth ({ authorized, authPermissions }, permission) {
    // 被禁用
    if (!rbac.should(permission)) {
      return 0
    }
    // 未登录
    if (!authorized) {
      return 401
    }
    // 仅需判断登录
    if (permission === 0) {
      return 0
    }
    // 基于资源判断
    return permission.split(';').some(P => P.split(',').every(p => authPermissions.indexOf(p) !== -1)) ? 0 : 403
  },
  wrap
}

export default rbac
