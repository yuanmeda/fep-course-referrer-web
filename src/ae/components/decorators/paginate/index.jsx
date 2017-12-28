import React, { PropTypes } from 'react'
import { locationShape } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import AEDecorator from 'ae/components/Decorator'
import normalizeQuery from 'ae/shared/normalize-query'
import hasOwn from 'ae/shared/has-own'
import { Pagination } from 'fish'

export default function paginate (WrappedComponent) {
  return class AEComponentDecoratorPaginate extends AEDecorator {
    static propTypes = {
      location: locationShape.isRequired,
      total: PropTypes.number,
      query: PropTypes.object
    }
    static defaultConfig = {
      $limit: 20,
      $offset: 0,
      query: {}
    }

    initialize () {
      const { $count, $limit, $offset } = this.config

      // 默认的查询串
      this.defaultQuery = {
        $count: $count === false ? 'false' : 'true',
        $limit,
        $offset
      }

      this._syncQuery(this.props.location.query, this.props.query)
    }

    _syncQuery (a = {}, b = {}) {
      const { $count, $limit, $offset, $filter, $orderby } = normalizeQuery({ ...a, ...b })

      // 当前的查询串
      const query = {}

      if ($count !== undefined) {
        query.$count = $count === 'false' ? 'false' : 'true'
      }
      if ($limit !== undefined) {
        query.$limit = +$limit
      }
      if ($offset !== undefined) {
        query.$offset = +$offset
      }
      if ($filter) {
        query.$filter = $filter
      }
      if ($orderby) {
        query.$orderby = $orderby
      }

      this.query = query
    }

    _syncProps (props) {
      const params = []
      if (!isEqual(props.location.query, this.props.location.query)) {
        params.push(props.location.query)
      }
      if (!isEqual(props.query, this.props.query)) {
        params.push(props.query)
      }
      if (params.length) {
        this._syncQuery(...params)
      }
    }

    // @override
    componentWillReceiveProps (nextProps) {
      // this.setState({
      //   active: nextProps.params ? this.constructor.deco === nextProps.params.deco : false
      // })
      const { total } = this.props
      this._syncProps(nextProps)
      // 删除了所有
      const { $offset, $limit } = this
      if (nextProps.total < total && nextProps.result.length === 0 && $offset >= $limit) {
        this.query.$offset = $offset - $limit
      }
    }

    get $limit () {
      return this.query.$limit || this.defaultQuery.$limit
    }

    get $offset () {
      return hasOwn(this.query, '$offset')
        ? this.query.$offset : this.defaultQuery.$offset
    }

    onChange (page) {
      const $offset = (page - 1) * this.$limit
      if ($offset) {
        this.query.$offset = $offset
      } else {
        delete this.query.$offset
      }
      this.forceUpdate()
    }

    // @override
    hookRender () {
      const { total } = this.props
      const { $offset, $limit, defaultQuery } = this
      const pageSize = $limit
      const current = Math.floor($offset / $limit) + 1

      if (isEqual(this.query, defaultQuery)) {
        this.query = {}
      }

      const query = isEmpty(this.query) ? { ...this.props.query } : { ...this.props.query, ...this.query }

      return <div className='ae-grid-paginate'>
        {super.hookRender({ query, defaultQuery })}
        <div className='ae-grid-paginate-content'>
          { total > pageSize
            ? <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              onChange={page => { this.onChange(page) }} />
            : null }
        </div>
      </div>
    }
  }
}
