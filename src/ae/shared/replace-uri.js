import hasOwn from 'ae/shared/has-own'

/**
 * 替换 URI 中的 :xyz 与 {xyz}
 */
export default function replaceURI (uri, params) {
  function getValue (_, $1) {
    return hasOwn(params, $1) ? params[$1] : _
  }

  if (!params) {
    return uri
  }

  return uri
    .replace(/:([_a-z][_0-9a-z]+)/ig, getValue)
    .replace(/\{([_a-z][_0-9a-z]+)\}/ig, getValue)
}
