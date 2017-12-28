import React from 'react'
import { Route, IndexRoute, IndexRedirect } from 'react-router'
import isEmpty from 'lodash/isEmpty'
import { generateContainer, generateComponent } from 'ae/core/generator'
import storeRoutes from 'ae/store/routes'
import sortRoutes from 'ae/shared/sort-routes'

/**
 * 使用 getCached 实现 Component 延迟初始化
 */

function getCached (cache, key, fn) {
  let res = cache[key]
  if (!res) {
    res = cache[key] = fn()
  }
  return res
}

const cachedContainers = {}
function getContainer (config) {
  return getCached(cachedContainers, config.key, () => generateContainer(config))
}

const cachedComponents = {}
function getComponent (config) {
  return getCached(cachedComponents, config.key, () => generateComponent(config))
}

export default function parseRoutes (config, isChild) {
  const { bread, key, path, redirect, modules } = config
  // component 使用 AEBase 包裹
  const element = <Route
    bread={bread}
    key={key}
    path={path}
    getComponent={(state, cb) => cb(null, getContainer(config))}>
    { // 处理重定向
      redirect !== undefined
        ? <IndexRedirect to={redirect} />
        : <IndexRoute
          getComponent={(state, cb) => cb(null, getComponent(config))} />}
    { // 递归处理子模块
      !isEmpty(modules)
        // 子模块需要排序，保证 * 位于最后
        ? Object.values(modules).map(child => parseRoutes(child, true)).sort(sortRoutes)
        : null}
  </Route>
  // 仅 push 一级
  if (!isChild) {
    storeRoutes.push(element)
  } else {
    // 用于递归
    return element
  }
}
