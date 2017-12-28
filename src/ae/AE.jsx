import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
import { LocaleProvider } from 'fish'

// import Theme from 'ae/themes/fish'

import i18n from 'ae/services/i18n'
import rbac from 'ae/core/rbac'
import configureStore from 'ae/store/configureStore'
import routes from 'ae/store/routes'
import sortRoutes from 'ae/shared/sort-routes'
import promisify from 'ae/shared/promisify'

import { generateContainer } from 'ae/core/generator'
import parseModule from 'ae/core/module'
import parseReq from 'ae/core/req'

export default class AE {
  constructor () {
    this._container = '#app'
    this._namespace = 'AE'
    this._theme = null
    this._modules = []
    this._i18n = {}
  }

  ns (namespace) {
    this._namespace = namespace
    return this
  }

  theme (theme) {
    if (theme) {
      this._theme = promisify(theme)
    }

    return this
  }

  i18n (options) {
    this._i18n = options
    return this
  }

  rbac (options) {
    Object.assign(rbac, options)
    return this
  }

  req (req) {
    this._modules.push(...parseReq(req))
    return this
  }

  mount (container) {
    if (container) {
      this._container = container
    }

    if (!this._theme) {
      this._theme = import('ae/themes/fish')
    }

    if (!window.Intl) {
      import('intl').then(() => {
        this._mount()
      })
    } else {
      this._mount()
    }
  }

  _mount () {
    // 现在是同步的了
    i18n.init(this._i18n)

    // 并行加载，提升效率
    Promise.all([
      i18n.getTranslations('comp'),
      i18n.getTranslations('fish'),
      // for react-intl
      i18n.updateMoment(),
      i18n.addLocaleData(),
      parseModule(this._modules)
    ]).then(([Comp, fishT]) => {
      this._render(Object.assign(fishT, { Comp }))
    }).catch(e => {
      if (process.env.NODE_ENV !== 'production') {
        console.error(e)
      }
    })
  }

  async _render (translations) {
    const { _container, _theme } = this
    const Theme = await _theme
    render(
      <LocaleProvider locale={translations}>
        <Provider store={configureStore()}>
          <Router history={useRouterHistory(createHashHistory)({ queryKey: false })}>
            <Route path='/'
              component={generateContainer({
                permission: -1,
                inject: ['base'],
                scope: 'theme',
                i18n: true,
                container: Theme
              })}>
              {routes.sort(sortRoutes)}
            </Route>
          </Router>
        </Provider>
      </LocaleProvider>,
      typeof _container === 'string' ? document.querySelector(_container) : _container
    )
  }
}
