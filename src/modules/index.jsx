/**
 * 允许定义异步模块
 * 必须返回一个函数
 * 函数的返回值可以是一个 json 对象，或返回 json 对象的 promise 对象
 * 函数接收两个参数：scope 与 __
 * 当第二个形式参数提供时，AE 会自动加载当前模块下的国际化资源，并注入到当前模块对应的 Container
 * 注意：
 *  国际化使用的 yahoo 的 react-intl 的 IntlProvider，
 *  当子模块不声明 __ 时，会自动继承父模块
 */

/**
 * 同一目录下的文件会共享一个 scope，
 * 所以，404 页面的数据会与 index 页面的数据合并，
 * 比如 state
 */

import React from 'react'

export default (scope, __) => ({
  permission: 0,
  bread: {
    title: __('home'),
    icon: 'home'
  },
  component: Promise.resolve(props => {
    return <div>hello world</div>
  })
})
