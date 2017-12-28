import manager from 'ae/core/manager'

function getType (key) {
  const re1 = /(^\.)|((\/index)?\.jsx$)/g
  const re2 = /\/([a-z])/ig
  return key
    // 清理掉无用的前后缀
    .replace(re1, '')
    // 首字符大写
    .replace(re2, (_, c) => c.toUpperCase())
}

// 自动注册

// 基类们
const bases = require.context('../components', false, /\.jsx$/)
bases.keys().forEach(key => {
  manager.register({ type: getType(key), component: bases(key) })
})

// Fields
const fields = require.context('../components/fields', false, /\.jsx$/)
fields.keys().forEach(key => {
  manager.register({ type: `Field${getType(key)}`, component: fields(key) })
})

// Renders
const renders = require.context('../components/renders', false, /\.jsx$/)
renders.keys().forEach(key => {
  manager.register({ type: `Render${getType(key)}`, component: renders(key) })
})

// Decorators
const decorators = require.context('../components/decorators', true, /index\.jsx$/)
decorators.keys().forEach(key => {
  manager.register({ type: `Decorator${getType(key)}`, component: decorators(key) })
})

// 注意：decorator 不是严格意义上的 component，它是一个返回 component 的高阶函数
