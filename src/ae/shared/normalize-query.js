import hasOwn from 'ae/shared/has-own'

export default function normalizeQuery (query) {
  return ['$offset', '$limit', '$count', '$filter', '$orderby']
    .reduce((obj, key, index) => {
      if (hasOwn(query, key)) {
        const value = query[key]
        obj[key] = index < 3 ? (value === undefined ? 0 : +value) : value
      }
      return obj
    }, {})
}
