/**
 * @function utils
 * @authors  hollton (holltonliu@163.com)
 * @date     2017-12-11 15:08:30
 * @version  v0.1 [高精尖业务v0.9.3]
 */

/**
 * [description 获取url参数，默认取当前路由参数]
 * @param  {[String]} url [含参数url]
 * @return {[Object]}     [params]
 */
const getUrlParams = (url) => {
  const hash = url || window.location.hash
  const params = {}
  const search = hash.substr(hash.indexOf('?') + 1)
  let splitIndex
  if (search) {
    search.split('&').forEach(item => {
      splitIndex = item.indexOf('=')
      if (splitIndex < 0) {
        params[item] = undefined
      } else {
        var key = item.substring(0, splitIndex)
        if (params.hasOwnProperty(key)) {
          if (!Array.isArray(params[key])) {
            params[key] = [params[key]]
          }
          params[key].push(item.substring(splitIndex + 1))
        } else {
          params[key] = item.substring(splitIndex + 1)
        }
      }
    })
  }
  return params
}

/**
 * [description 异步循环]
 * @param  {[Array]} arrData [待操作数据]
 * @param  {[Func]} asyncFn [异步操作回调(loop方法, 当前操作item, 当前index)]
 * @param  {[type]} doneFn  [循环结束回调]
 */
const asyncLoop = (arrData, asyncFn, doneFn) => {
  let i = -1
  const loop = () => {
    i++
    if (i === arrData.length) {
      doneFn()
    } else {
      asyncFn(loop, arrData[i], i)
    }
  }
  loop()
}

export default {
  getUrlParams,
  asyncLoop
}
