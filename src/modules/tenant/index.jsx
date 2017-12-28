/**
 * @description 中考选科组件：租户列表 新增、搜索、编辑
 * @Author      130061@nd
 * @DateTime    2017-12-28
 * @version     v0.1
 */
import configTenant from './components/Config'
export default scope => ({
  permission: 0,
  menu: {
    title: '租户列表'
  },
  component: 'Grid',
  model: 'Grid',
  path: '/tenant',
  source: {
    uri: `${ORIGINS.FEP}/v1/admins/tenants`,
    params: {
      keyword: '',
      limit: 10,
      offset: 0
    },
    interceptors: {
      request (config) {
        if (config.params && config.params.$filter) {
          config.params.keyword = config.params.$filter.split(' ')[2]
        }
        config.params = {
          keyword: config.params.keyword,
          limit: config.params.$limit,
          offset: config.params.$offset
        }
        return config
      },
      response (data) {
        // 列表数据 AE 只支持 count/items 的格式
        if (data && data.total) {
          data.count = data.total
        }
        // 数据拦截
        return data
      }
    }
  },
  schema: {
    tenant_id: {
      primary: true,
      hidden: true
    },
    sequence_number: {
      type: 'number',
      label: '序号'
    },
    tenant_name: {
      type: 'string',
      label: '名称'
    }
  },
  decorators: {
    list: {
      label: '' // 隐藏列表刷新按钮
    },
    paginate: {
      $limit: 10
    },
    search: {
      fields: [
        ['tenant_name', { op: '=', required: false, description: null }]
      ],
      transformer: (fields, arg) => {
        // 去除搜索条件头部和尾部的空格
        return fields.map(item => {
          item.value = item.value.replace(/(^\s*)|(\s*$)/g, '')
          return item
        })
      }
    },
    create: {
      component: configTenant,
      componentConfig: {
        fun: 'create'
      }
    },
    edit: {
      component: configTenant,
      componentConfig: {
        fun: 'config'
      }
    },
    del: {
      label: ''
    }
  }
})
