import isPromise from 'ae/shared/is-promise'

export default function promisify (obj) {
  return isPromise(obj) ? obj : Promise.resolve(obj)
}
