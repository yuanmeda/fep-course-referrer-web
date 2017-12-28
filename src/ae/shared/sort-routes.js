/**
 * 确保带 * 号的路由最后被匹配到，用于 404
 */

export default function sortRoutes (a, b) {
  if (a.key === '') {
    return -1
  }
  if (a.key.indexOf('*') !== -1) {
    return 1
  }
  if (b.key === '') {
    return 1
  }
  if (b.key.indexOf('*') !== -1) {
    return -1
  }
  return 0
}
