import isEqual from 'lodash/isEqual'
import AEDecorator from 'ae/components/Decorator'
import normalizeQuery from 'ae/shared/normalize-query'

export default function list (WrappedComponent) {
  return class AEComponentDecoratorList extends AEDecorator {
    static defaultConfig = {
      label: '刷新',
      disabled: false
    }

    initialize () {
      const { label } = this.config
      if (label) {
        // 往主页添加刷新按钮
        this.pushButton({
          action: () => {
            const { defaultQuery } = this.props
            const { query } = this.props.location
            const _query = { ...defaultQuery, ...query }
            // 空字符串不参与查询
            const params = Object.keys(_query).filter(key => _query[key] !== null).reduce((obj, key) => {
              obj[key] = _query[key]
              return obj
            }, {})

            this.props.list({ params })
          },
          label,
          scope: 'list'
        })
      }

      // _e 是特殊参数
      const { params, query: { _e, ...query } } = this.props
      if (!params || !params.deco) {
        this.context.route.query(query)
      }
    }

    componentWillUpdate (nextProps, nextState) {
      const { query } = nextProps
      // 将 query 变化响应到地址栏
      if (!isEqual(query, this.props.query) &&
        !isEqual(query, normalizeQuery(this.props.location.query))) {
        this.context.route.query(query)
      }
    }

    // @override
    // hookRender () {
    //   return super.hookRender()
    // }

    // @override
    decoRender () {
      // 因为这个地址不会被激活，所以不会执行到这里
      // 此装饰器不存在 deco 的情况
    }
  }
}
