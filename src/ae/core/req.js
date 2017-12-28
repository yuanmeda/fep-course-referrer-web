/**
 * 将 Webpack 的 require.context 生成的对象转换成数组
 * 以便于排序
 */
export default req => req.keys()
  .map(key => [key, req])
