import isEmpty from 'lodash/isEmpty'
import storeMenus from 'ae/store/menus'

export default function parseMenu (config, isChild) {
  const { menu, modules, scope } = config

  // 首页
  if (scope === '') {
    // 未配置菜单
    if (!menu.title) {
      // 子模块不为空
      if (!isEmpty(modules)) {
        // 则，将子模块作为一级菜单项
        return Object.values(modules).forEach(child => parseMenu(child))
      }
    }
  }

  if (menu.title) {
    if (!isEmpty(modules)) {
      menu.children = Object.values(modules).map(child => parseMenu(child, true)).filter(child => !!child)
    }

    // 仅 push 一级
    if (!isChild) {
      menu.isRoot = true
      storeMenus.push(menu)
    }

    // 返回给 children
    return menu
  } else {
    if (process.env.NODE_ENV !== 'production') {
      if (!config.is404) {
        console.warn('%s 模块没有配置菜单', scope || '首页')
      }
    }
  }
}
