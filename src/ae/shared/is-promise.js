import isFunction from 'lodash/isFunction'

export default function isPromise (obj) {
  return obj && isFunction(obj.then)
}
