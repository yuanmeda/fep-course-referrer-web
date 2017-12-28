import qs from 'query-string'

export default {
  name: 'querystring',

  lookup (options) {
    const queryParams = qs.parse(location.search)

    return queryParams[options.lookupQuerystring]
  }
}
